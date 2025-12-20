# Changelog

All notable changes to this project will be documented in this file.

The project uses lightweight semantic versioning (pre-1.0): `vMAJOR.MINOR.PATCH`.

## [Unreleased]
### Planned
- Evaluation write-up (usability + correctness narrative) and evidence curation for the final report.
- Reproducibility polish: curated figures in `report/figures/` and consistent evidence bundles (JSON + trace + PNG).
- Issue tracking cleanup (labels, milestones) and documentation consolidation.

## [0.3.2] - 2025-12-20
### Fixed
- CI smoke-tests workflow: updated to run from the repository root after promoting the tool to the top-level directory (resolves CI failure due to missing `ds-mutex/` working directory).

### Changed
- Repository hygiene / presentation: updated GitHub repository metadata (About description, topics, Pages link) to reflect the Distributed Mutual Exclusion artefact.

### Notes
- This release is intended as a **freeze baseline** tag for reproducible evidence collection (report figures, traces, and exported state).

## [0.3.1] - 2025-12-18
### Added
- Ricart–Agrawala (prototype) fault controls:
  - Drop next in-flight message (drops queue head).
  - Arm/disarm drop-next-send (drops the next outgoing message).
- Evidence exports:
  - State JSON
  - Trace TXT
  - Preview PNG
  - Timestamped export naming to support reproducible reporting.

### Improved
- Trace clarity for stalled states, including explicit explanation when progress halts due to missing REPLY(s) after message drops (safety preserved; liveness may fail under message loss). Example traces show “no messages in flight” after a dropped REQUEST to a target process. 

### Notes
- Ricart–Agrawala module is a teaching-oriented prototype. Safety (mutual exclusion) is prioritised; liveness may be violated under message loss, which is intentionally demonstrated via faults and trace output.
