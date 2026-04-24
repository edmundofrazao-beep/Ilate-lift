from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any, Iterable

from .models import ClassificationDecision, DedupeRelation, FileRecord, MoveLedgerEntry


class StateStore:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA journal_mode=WAL;")
        self.conn.execute("PRAGMA synchronous=NORMAL;")
        self._init_schema()

    def _init_schema(self) -> None:
        self.conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS files (
                path TEXT PRIMARY KEY,
                rel_path TEXT NOT NULL,
                filename TEXT NOT NULL,
                extension TEXT NOT NULL,
                size INTEGER NOT NULL,
                mtime_ns INTEGER NOT NULL,
                sha1 TEXT NOT NULL,
                snippet TEXT NOT NULL,
                snippet_source TEXT NOT NULL,
                scan_timestamp TEXT NOT NULL,
                category TEXT,
                confidence REAL,
                stage TEXT,
                rationale TEXT,
                heuristic_override INTEGER DEFAULT 0,
                family_hint TEXT,
                canonical_path TEXT,
                is_duplicate INTEGER DEFAULT 0,
                duplicate_of TEXT,
                cluster_id TEXT,
                suggested_subpath TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_files_sha1 ON files(sha1);
            CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
            CREATE INDEX IF NOT EXISTS idx_files_duplicate ON files(is_duplicate);

            CREATE TABLE IF NOT EXISTS move_ledger (
                id TEXT PRIMARY KEY,
                hash TEXT NOT NULL,
                from_path TEXT NOT NULL,
                to_path TEXT NOT NULL,
                operation_type TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                rolled_back_at TEXT
            );

            CREATE TABLE IF NOT EXISTS ai_cache (
                sha1 TEXT NOT NULL,
                stage TEXT NOT NULL,
                model TEXT NOT NULL,
                prompt_fingerprint TEXT NOT NULL,
                category TEXT NOT NULL,
                confidence REAL NOT NULL,
                rationale TEXT NOT NULL,
                PRIMARY KEY (sha1, stage, model, prompt_fingerprint)
            );
            """
        )
        self.conn.commit()

    def close(self) -> None:
        self.conn.commit()
        self.conn.close()

    def get_existing_file(self, path: str) -> sqlite3.Row | None:
        return self.conn.execute("SELECT * FROM files WHERE path = ?", (path,)).fetchone()

    def upsert_file(self, record: FileRecord) -> None:
        self.conn.execute(
            """
            INSERT INTO files (
                path, rel_path, filename, extension, size, mtime_ns, sha1, snippet, snippet_source, scan_timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(path) DO UPDATE SET
                rel_path=excluded.rel_path,
                filename=excluded.filename,
                extension=excluded.extension,
                size=excluded.size,
                mtime_ns=excluded.mtime_ns,
                sha1=excluded.sha1,
                snippet=excluded.snippet,
                snippet_source=excluded.snippet_source,
                scan_timestamp=excluded.scan_timestamp
            """,
            (
                record.path,
                record.rel_path,
                record.filename,
                record.extension,
                record.size,
                record.mtime_ns,
                record.sha1,
                record.snippet,
                record.snippet_source,
                record.scan_timestamp,
            ),
        )
        self.conn.commit()

    def iter_files(self, where: str = "", params: tuple[Any, ...] = ()) -> Iterable[sqlite3.Row]:
        query = "SELECT * FROM files"
        if where:
            query += f" WHERE {where}"
        query += " ORDER BY rel_path"
        yield from self.conn.execute(query, params)

    def iter_unclassified(self, limit: int | None = None, path_prefix: str | None = None) -> list[sqlite3.Row]:
        conditions = ["(category IS NULL OR category = '')"]
        params: list[Any] = []
        if path_prefix:
            conditions.append("path LIKE ?")
            params.append(f"{path_prefix}%")
        query = f"SELECT * FROM files WHERE {' AND '.join(conditions)} ORDER BY rel_path"
        if limit is not None:
            query += f" LIMIT {int(limit)}"
        return list(self.conn.execute(query, tuple(params)))

    def save_classification(self, decision: ClassificationDecision) -> None:
        self.conn.execute(
            """
            UPDATE files
            SET category=?, confidence=?, stage=?, rationale=?, heuristic_override=?, family_hint=?
            WHERE path=?
            """,
            (
                decision.category,
                decision.confidence,
                decision.stage,
                decision.rationale,
                int(decision.heuristic_override),
                decision.family_hint,
                decision.path,
            ),
        )
        self.conn.commit()

    def get_ai_cache(
        self, sha1: str, stage: str, model: str, prompt_fingerprint: str
    ) -> sqlite3.Row | None:
        return self.conn.execute(
            """
            SELECT * FROM ai_cache
            WHERE sha1=? AND stage=? AND model=? AND prompt_fingerprint=?
            """,
            (sha1, stage, model, prompt_fingerprint),
        ).fetchone()

    def save_ai_cache(
        self,
        sha1: str,
        stage: str,
        model: str,
        prompt_fingerprint: str,
        category: str,
        confidence: float,
        rationale: str,
    ) -> None:
        self.conn.execute(
            """
            INSERT OR REPLACE INTO ai_cache
            (sha1, stage, model, prompt_fingerprint, category, confidence, rationale)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (sha1, stage, model, prompt_fingerprint, category, confidence, rationale),
        )
        self.conn.commit()

    def save_cluster(self, path: str, cluster_id: str, suggested_subpath: str) -> None:
        self.conn.execute(
            "UPDATE files SET cluster_id=?, suggested_subpath=? WHERE path=?",
            (cluster_id, suggested_subpath, path),
        )
        self.conn.commit()

    def mark_dedupe(self, relation: DedupeRelation) -> None:
        self.conn.execute(
            "UPDATE files SET canonical_path=?, is_duplicate=0, duplicate_of=NULL WHERE path=?",
            (relation.canonical_path, relation.canonical_path),
        )
        self.conn.execute(
            "UPDATE files SET canonical_path=?, is_duplicate=1, duplicate_of=? WHERE path=?",
            (relation.canonical_path, relation.canonical_path, relation.duplicate_path),
        )
        self.conn.commit()

    def iter_duplicate_groups(self) -> list[sqlite3.Row]:
        return list(
            self.conn.execute(
                """
                SELECT sha1, COUNT(*) AS count
                FROM files
                GROUP BY sha1
                HAVING COUNT(*) > 1
                ORDER BY count DESC, sha1
                """
            )
        )

    def iter_duplicate_groups_for_prefix(self, path_prefix: str) -> list[sqlite3.Row]:
        return list(
            self.conn.execute(
                """
                SELECT sha1, COUNT(*) AS count
                FROM files
                WHERE sha1 IN (
                    SELECT DISTINCT sha1
                    FROM files
                    WHERE path LIKE ?
                )
                GROUP BY sha1
                HAVING COUNT(*) > 1
                ORDER BY count DESC, sha1
                """,
                (f"{path_prefix}%",),
            )
        )

    def insert_move_entry(self, entry: MoveLedgerEntry) -> None:
        self.conn.execute(
            """
            INSERT OR REPLACE INTO move_ledger
            (id, hash, from_path, to_path, operation_type, timestamp, rolled_back_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entry.id,
                entry.hash,
                entry.from_path,
                entry.to_path,
                entry.operation_type,
                entry.timestamp,
                entry.rolled_back_at,
            ),
        )
        self.conn.commit()

    def iter_unrolled_moves_reverse(self) -> list[sqlite3.Row]:
        return list(
            self.conn.execute(
                """
                SELECT * FROM move_ledger
                WHERE rolled_back_at IS NULL
                ORDER BY timestamp DESC, id DESC
                """
            )
        )

    def mark_move_rolled_back(self, move_id: str, rolled_back_at: str) -> None:
        self.conn.execute(
            "UPDATE move_ledger SET rolled_back_at=? WHERE id=?",
            (rolled_back_at, move_id),
        )
        self.conn.commit()
