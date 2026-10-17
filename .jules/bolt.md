## 2025-01-20 - Precomputing Diurnal Cycles in Simulation
**Learning:** `calculateSimulationData` executes math operations (`Math.cos`, `Math.sin`) in a very tight loop (e.g. 60 steps per hour * 168 hours = 10,080 iterations per run). The 24-hour diurnal cycle repeats, so calculating these steps on-the-fly is inefficient.
**Action:** Pre-computing the 24-hour diurnal temperature and solar gain cycles into a `Float64Array` array before the main simulation loop cuts execution time by over 50%.

## 2026-10-16 - Hoist Trig Invariants & Consolidate Filters
**Learning:** When optimizing nested iteration loops in JavaScript, leveraging pre-computed static elements effectively removes calculation bottlenecks like `Math.cos`. Consolidating multiple array traversal iterations (`filter`, `reduce`, `find`) into a single `forEach` or `reduce` pass significantly minimizes overhead and garbage collection.
**Action:** Prioritize a single-pass processing strategy for array aggregations over chainable methods when performance and GC overhead are constrained. Always initialize lookup variables locally to prevent runtime `ReferenceError` during refactoring.

## 2026-10-16 - Memoize Thermal Resistance Calculations
**Learning:** Repetitive recalculation of thermal characteristics, especially those involving Continuous Insulation fasteners, wastes CPU cycles across simulation ticks. Memoizing these using deterministic composite keys (like stringified structures) provides immediate performance returns without altering outputs.
**Action:** Implement module-scoped caching (Map) for pure structural calculation functions (like calculateEffectiveR) when they feed into heavy iterative simulation loops.
