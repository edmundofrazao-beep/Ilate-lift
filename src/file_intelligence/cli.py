from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .classifier import Classifier
from .clustering import ClusteringEngine
from .config import PipelineConfig, ensure_workspace_dirs
from .deduper import Deduper
from .jsonl import JsonlWriter
from .library_refiner import LibraryRefiner
from .logging_utils import configure_logger
from .organizer import Organizer
from .rollback import RollbackEngine
from .scanner import Scanner
from .schematics_extractor import SchematicsExtractor
from .schematics_finalizer import SchematicsFinalizer
from .semantic_api import SemanticApiProcessor
from .semantic_library_builder import SemanticLibraryBuilder
from .semantic_queue import SemanticQueuePlanner
from .storage import StateStore


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Autonomous file intelligence migration engine")
    parser.add_argument("--workspace-root", type=Path, required=True, help="Local workspace root")
    parser.add_argument("--source-root", type=Path, help="Source root, defaults to <workspace>/original")
    parser.add_argument("--scan", action="store_true")
    parser.add_argument("--classify", action="store_true")
    parser.add_argument("--cluster", action="store_true")
    parser.add_argument("--dedupe", action="store_true")
    parser.add_argument("--organize", action="store_true")
    parser.add_argument("--refine-library", action="store_true")
    parser.add_argument("--build-semantic-library", action="store_true")
    parser.add_argument("--extract-schematics", action="store_true")
    parser.add_argument("--finalize-schematics", action="store_true")
    parser.add_argument("--plan-semantic", action="store_true")
    parser.add_argument("--run-semantic-api", action="store_true")
    parser.add_argument("--rollback", action="store_true")
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--dry-run", action="store_true", default=True)
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--workers", type=int, default=None)
    parser.add_argument("--snippet-chars", type=int, default=1000)
    parser.add_argument("--stage1-batch-size", type=int, default=25)
    parser.add_argument("--stage2-batch-size", type=int, default=12)
    parser.add_argument("--low-confidence-threshold", type=float, default=0.72)
    parser.add_argument("--categories", type=str, help="Comma-separated categories for partial apply")
    parser.add_argument("--classification-limit", type=int)
    parser.add_argument("--library-root", type=Path, help="Existing organized library root for in-place refinement")
    parser.add_argument("--semantic-limit", type=int, default=80)
    parser.add_argument("--semantic-batch-size", type=int, default=8)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    selected = [args.scan, args.classify, args.cluster, args.dedupe, args.organize, args.refine_library, args.build_semantic_library, args.extract_schematics, args.finalize_schematics, args.plan_semantic, args.run_semantic_api, args.rollback]
    if sum(bool(value) for value in selected) != 1:
        parser.error("choose exactly one operation flag: --scan, --classify, --cluster, --dedupe, --organize, --refine-library, --build-semantic-library, --extract-schematics, --finalize-schematics, --plan-semantic, --run-semantic-api or --rollback")

    workspace_root = args.workspace_root.resolve()
    source_root = args.source_root.resolve() if args.source_root else workspace_root / "original"
    categories = tuple(filter(None, (part.strip() for part in (args.categories or "").split(","))))

    config = PipelineConfig(
        workspace_root=workspace_root,
        source_root=source_root,
        dry_run=not args.execute,
        execute=args.execute,
        resume=args.resume,
        workers=args.workers or PipelineConfig(workspace_root=workspace_root, source_root=source_root).workers,
        snippet_chars=args.snippet_chars,
        stage1_batch_size=args.stage1_batch_size,
        stage2_batch_size=args.stage2_batch_size,
        low_confidence_threshold=args.low_confidence_threshold,
        categories_filter=categories,
        classification_limit=args.classification_limit,
    )
    ensure_workspace_dirs(config.paths)

    errors_logger = configure_logger("file_intelligence.errors", config.paths.logs_dir / "errors.log")
    state = StateStore(config.paths.state_dir / "pipeline.db")

    try:
        if args.scan:
            logger = configure_logger("file_intelligence.scan", config.paths.logs_dir / "scan.log")
            writer = JsonlWriter(config.paths.data_dir / "scan_records.jsonl")
            result = Scanner(config, state, writer, logger).run()
        elif args.classify:
            logger = configure_logger("file_intelligence.classification", config.paths.logs_dir / "classification.log")
            writer = JsonlWriter(config.paths.data_dir / "classifications.jsonl")
            result = Classifier(config, state, writer, logger).run()
        elif args.cluster:
            logger = configure_logger("file_intelligence.cluster", config.paths.logs_dir / "classification.log")
            writer = JsonlWriter(config.paths.data_dir / "clusters.jsonl")
            result = ClusteringEngine(config, state, writer, logger).run()
        elif args.dedupe:
            logger = configure_logger("file_intelligence.dedupe", config.paths.logs_dir / "classification.log")
            writer = JsonlWriter(config.paths.data_dir / "dedupe_relations.jsonl")
            result = Deduper(config.source_root, state, writer, logger).run()
        elif args.organize:
            logger = configure_logger("file_intelligence.organize", config.paths.logs_dir / "classification.log")
            writer = JsonlWriter(config.paths.logs_dir / "moves.jsonl")
            result = Organizer(config, state, writer, logger).run()
        elif args.refine_library:
            logger = configure_logger("file_intelligence.refine_library", config.paths.logs_dir / "classification.log")
            writer = JsonlWriter(config.paths.logs_dir / "moves.jsonl")
            library_root = (args.library_root or (workspace_root / "organized_v5")).resolve()
            result = LibraryRefiner(library_root, state, writer, logger).run(execute=args.execute)
        elif args.build_semantic_library:
            logger = configure_logger("file_intelligence.build_semantic_library", config.paths.logs_dir / "classification.log")
            writer = JsonlWriter(config.paths.logs_dir / "moves.jsonl")
            library_root = (args.library_root or (workspace_root / "organized_v5")).resolve()
            result = SemanticLibraryBuilder(
                library_root,
                workspace_root,
                config.paths.data_dir,
                state,
                writer,
                logger,
            ).run(execute=args.execute)
        elif args.extract_schematics:
            logger = configure_logger("file_intelligence.extract_schematics", config.paths.logs_dir / "classification.log")
            writer = JsonlWriter(config.paths.logs_dir / "moves.jsonl")
            library_root = (args.library_root or (workspace_root / "organized_v7")).resolve()
            result = SchematicsExtractor(
                library_root,
                workspace_root,
                config.paths.data_dir,
                state,
                writer,
                logger,
            ).run(execute=args.execute)
        elif args.finalize_schematics:
            logger = configure_logger("file_intelligence.finalize_schematics", config.paths.logs_dir / "classification.log")
            writer = JsonlWriter(config.paths.logs_dir / "moves.jsonl")
            library_root = (args.library_root or (workspace_root / "electrical_schematics_v2")).resolve()
            result = SchematicsFinalizer(
                library_root,
                workspace_root,
                state,
                writer,
                logger,
            ).run(execute=args.execute)
        elif args.plan_semantic:
            logger = configure_logger("file_intelligence.plan_semantic", config.paths.logs_dir / "classification.log")
            library_root = (args.library_root or (workspace_root / "organized_v5")).resolve()
            result = SemanticQueuePlanner(library_root, config.paths.data_dir, logger).run()
        elif args.run_semantic_api:
            logger = configure_logger("file_intelligence.run_semantic_api", config.paths.logs_dir / "classification.log")
            library_root = (args.library_root or (workspace_root / "organized_v5")).resolve()
            result = SemanticApiProcessor(
                library_root,
                config.paths.data_dir,
                logger,
                limit=args.semantic_limit,
                batch_size=args.semantic_batch_size,
            ).run()
        else:
            logger = configure_logger("file_intelligence.rollback", config.paths.logs_dir / "classification.log")
            result = RollbackEngine(state, logger).run(execute=args.execute)

        print(result)
        print(f"Workspace ready: {workspace_root}")
        print(f"Insert source files in: {source_root}")
        return 0
    except Exception as exc:  # pragma: no cover
        errors_logger.exception("pipeline_failed error=%s", exc)
        raise
    finally:
        state.close()


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
