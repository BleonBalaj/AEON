## 2025-05-18 - Tectonic Geometry Arc Tessellation Bottleneck
**Learning:** Arc subdivision in 3D globe line rendering generates tens of thousands of segment vertices. Using closure allocations (`reduce`, `map`), temporary 3D vector arrays, and dynamic array spreading in inner loops creates significant CPU and GC overhead (~1.6s for 50x tessellation runs).
**Action:** Use two-pass buffer size calculation and direct scalar math into pre-allocated Float32Array buffers when tessellating spherical geographic geometries.
