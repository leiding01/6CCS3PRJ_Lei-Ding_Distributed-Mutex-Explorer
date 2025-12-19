# Export folder (generated evidence)

This folder is intended for *generated* evidence exports (JSON state, trace, PNG preview).

The application exports timestamped files here so you can capture reproducible evidence for:
- evaluation checklists (e.g., Nielsen heuristics),
- correctness traces,
- report figures.

## Git policy

- This folder exists in the repository, but **generated exports are ignored by git** (see `.gitignore`).
- Only commit *curated* figures that you actually use in the final report under `ds-mutex/report/figures/` (outside `export/`).

## Suggested workflow

1. Run a scenario / demo.
2. Click **Export evidence (JSON+trace+PNG)**.
3. Pick the best PNG(s) and copy/move them to `ds-mutex/report/figures/` with meaningful names.
4. Reference those curated figures in your report.

If you need to share a full export session, attach the exported files to a GitHub Release instead of committing them.
