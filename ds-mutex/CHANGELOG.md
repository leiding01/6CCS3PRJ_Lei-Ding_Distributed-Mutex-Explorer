# Changelog

All notable changes to this project will be documented in this file.

The project uses lightweight semantic versioning (pre-1.0): `vMAJOR.MINOR.PATCH`.

## [Unreleased]
- Planned: evaluation write-up, report figures, and reproducibility polish.

## [0.3.1] - YYYY-MM-DD
### Added
- RA message fault controls: drop next in-flight message; arm/drop-next-send (drops next outgoing message).
- Evidence exports: state JSON + trace TXT + preview PNG (timestamped).

### Improved
- Trace clarity for stalled states (e.g., waiting for missing REPLY after a drop).

### Notes
- Ricart–Agrawala module is a teaching-oriented prototype. Safety is prioritised; liveness may be violated under message loss, which is intentionally demonstrated.
