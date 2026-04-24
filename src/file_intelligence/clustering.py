from __future__ import annotations

import hashlib
import re
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

from .brands import detect_brand, slugify_folder
from .config import PipelineConfig
from .jsonl import JsonlWriter
from .models import ClusterSuggestion
from .storage import StateStore


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", text.strip().lower()).strip("_")
    return slug or "misc"


def tokenize_name(path: str) -> set[str]:
    stem = Path(path).stem.lower()
    tokens = re.split(r"[^a-z0-9]+", stem)
    return {token for token in tokens if len(token) >= 3}


class ClusteringEngine:
    def __init__(self, config: PipelineConfig, state: StateStore, writer: JsonlWriter, logger) -> None:
        self.config = config
        self.state = state
        self.writer = writer
        self.logger = logger

    def run(self) -> dict[str, int]:
        rows = list(self.state.iter_files("category IS NOT NULL AND category != ''"))
        category_buckets: dict[str, list] = defaultdict(list)
        for row in rows:
            category_buckets[row["category"]].append(row)

        suggestions = 0
        for category, members in category_buckets.items():
            clusters = self._cluster_category(category, members)
            for cluster in clusters:
                self.writer.write(cluster.to_dict())
                suggestions += 1
                for path in cluster.member_paths:
                    self.state.save_cluster(path, cluster.cluster_id, cluster.suggested_subpath)

        self.logger.info("cluster_complete suggestions=%s", suggestions)
        return {"suggestions": suggestions}

    def _cluster_category(self, category: str, rows: list) -> list[ClusterSuggestion]:
        groups: list[list] = []
        for row in rows:
            name_tokens = tokenize_name(row["filename"])
            matched_group = None
            for group in groups:
                representative = group[0]
                similarity = SequenceMatcher(None, representative["filename"].lower(), row["filename"].lower()).ratio()
                overlap = len(tokenize_name(representative["filename"]) & name_tokens)
                if similarity >= 0.72 or overlap >= 2 or representative["rel_path"].split("/")[0] == row["rel_path"].split("/")[0]:
                    matched_group = group
                    break
            if matched_group is None:
                groups.append([row])
            else:
                matched_group.append(row)

        suggestions: list[ClusterSuggestion] = []
        for group in groups:
            if len(group) < 2:
                continue
            family_name = self._family_name(group)
            brand_name = self._group_brand(group) or "Sem_Marca"
            cluster_id = hashlib.sha1(f"{category}|{family_name}".encode("utf-8")).hexdigest()[:12]
            subpath = f"{category}/{slugify_folder(brand_name)}/{slugify(family_name)}"
            suggestions.append(
                ClusterSuggestion(
                    cluster_id=cluster_id,
                    cluster_name=family_name,
                    category=category,
                    suggested_subpath=subpath,
                    member_paths=[row["path"] for row in group],
                )
            )
        return suggestions

    def _family_name(self, group: list) -> str:
        token_counts: dict[str, int] = defaultdict(int)
        for row in group:
            for token in tokenize_name(row["filename"]):
                token_counts[token] += 1
        common = [token for token, count in sorted(token_counts.items(), key=lambda item: (-item[1], item[0])) if count >= 2]
        if common:
            return "_".join(common[:3])
        return Path(group[0]["rel_path"]).parts[0]

    def _group_brand(self, group: list) -> str | None:
        brand_counts: dict[str, int] = defaultdict(int)
        for row in group:
            brand = detect_brand(row["rel_path"], row["filename"], row["snippet"])
            if brand:
                brand_counts[brand] += 1
        if not brand_counts:
            return None
        return sorted(brand_counts.items(), key=lambda item: (-item[1], item[0]))[0][0]
