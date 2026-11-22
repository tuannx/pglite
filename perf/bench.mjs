// Perf benches for pglite (fork tuannx/pglite).
// Scope: pure TypeScript hot paths that run on every query, measured WITHOUT
// the Wasm Postgres engine (building it needs the Docker Wasm toolchain and is
// out of scope for a lightweight rerun harness — see perf/README.md).
// Source under test: packages/pglite/src/templating.ts (sql/query/identifier),
// imported directly; Node >=22 type-stripping loads the .ts source.
// Fixtures are fixed; warmup/iterations are fixed per bench for determinism.
import { sql, query, identifier, raw } from '../packages/pglite/src/templating.ts'

let sink = 0

// 100-parameter strings fixture for the large-template bench.
function makeStrings (n) {
  const parts = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? 'SELECT ' : ', '))
  parts.raw = [...parts]
  return parts
}
const largeStrings = makeStrings(100)
const largeValues = Array.from({ length: 100 }, (_, i) => i)

export const benches = [
  {
    name: 'templating.query-simple',
    scope: 'packages/pglite/src/templating.ts query() — 2 params',
    warmup: 2000,
    iterations: 20000,
    fn: () => { sink += query`SELECT * FROM t WHERE id = ${42} AND name = ${'tony'}`.query.length }
  },
  {
    name: 'templating.query-nested-identifier-raw',
    scope: 'packages/pglite/src/templating.ts query()+sql()+identifier()+raw() nested',
    warmup: 2000,
    iterations: 20000,
    fn: () => {
      const filter = sql`WHERE a = ${1} AND b = ${'x'}`
      sink += query`SELECT * FROM ${identifier`my_table`} ${filter} ${raw`LIMIT 10`}`.query.length
    }
  },
  {
    name: 'templating.query-100-params',
    scope: 'packages/pglite/src/templating.ts sql() — 100 params',
    warmup: 500,
    iterations: 5000,
    fn: () => { sink += sql(largeStrings, ...largeValues).values.length }
  }
]

export function getSink () { return sink }
