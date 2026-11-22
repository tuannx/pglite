# Perf baselines — pglite (fork)

Lightweight, dependency-free perf harness for the pure TypeScript hot paths
that run on every query. It does **not** measure the Wasm Postgres engine:
building that requires the Docker Wasm toolchain (`pnpm wasm:build`), which is
out of scope for a fast rerun check. The existing `packages/benchmark` suite
(SQL workloads against a built PGlite) remains the engine-level benchmark.

## Scope

`packages/pglite/src/templating.ts` — `query()` / `sql()` / `identifier()` /
`raw()` template-to-parameterized-query conversion (see `perf/bench.mjs`).

## Run

```sh
./perf/run-perf.sh                    # compare vs perf/baseline.json
node perf/run-perf.mjs --write-baseline   # regenerate baseline (only on purpose)
```

Requires Node >= 22 (type-stripping imports the `.ts` sources directly; no
install, no build). Verdict: median regression >10% = warn, >25% = block
(exit 1). Baseline metadata (environment, fork commit) is in
`perf/baseline.json`.
