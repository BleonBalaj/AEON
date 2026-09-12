# Completion audit — original 31-section brief

Checked against the original attachment on 2026-09-07. This audit distinguishes working implementation from evidence of the full requested quality bar. It must not be read as a declaration that the entire goal is complete.

## 2026-09-08 refinement evidence

User authorized rendered testing and requested a refined futuristic observatory surface while retaining typography, plus a separate Human Odyssey storyline. Implemented `/human-odyssey` with six chapters, chapter-specific routes, auto-advancing demo, pause/restart/steps, keyboard scrubber, camera focus and evidence sheets. Later user feedback superseded this: human exploration is isolated in Human Odyssey. Surface styling preserves the original Geist body and Georgia emphasis. The later loading fix retains the last complete surface, reports loading and pauses timeline playback while the new reconstruction loads.

Browser checks: desktop 1280×800 and 1440×1000, phone 390×844; no horizontal overflow at inspected sizes; main context ends at y485 and timeline begins y566 at 1280×800. Switches are 24×14 rather than stretched. Human playback visibly advanced from 300 ka to ~172 ka; chapter selection, End-key scrubbing, Sahul and Pacific evidence sheets were exercised. Rendered Earth imagery, route stage and mobile stacking inspected. Search matching was tightened after the browser revealed irrelevant fuzzy matches. These checks do not prove exhaustive accessibility, device performance or the remaining scientific requirements below.

| Brief | Current implementation and evidence | Remaining evidence or work |
|---|---|---|
| 1. Interactive realistic Earth | Three.js globe, drag/pinch/zoom, atmospheric shader, NASA composite, changing elevation grids | Rendered desktop/mobile quality, lighting, touch and reduced-capability checks pending |
| 2. Timeline | Five scales; adaptive overview; playback and date hierarchy | Unit math passes; all UI interactions need browser validation |
| 3. Geological history | Four eons, three Phanerozoic eras, all twelve periods; 46 chapters | Expand selected epoch/event coverage as needed; chapter source coverage is not yet a sentence-by-sentence scholarly audit |
| 4. Continental drift | 109 sourced PALEOMAP elevation rasters, 0–540 Ma, GPU interpolation | Continuous plate rotations, historical boundary types and movement vectors are not implemented; early supercontinents are discussed but not reconstructed |
| 5. Climate/environment | Qualitative environmental context, schematic latitude overlay, ice/shelf illustration | No quantitative paleoclimate raster or atmospheric time series; this is explicitly disclosed |
| 6. Life/evolution | Chapters, time-dependent biosphere descriptions and meaningful recent markers | Not a complete fossil atlas; rendered interaction checks pending |
| 7. Big Five extinctions | Five distinct chapters; dates, causes, rough loss estimates where suitable; emphasis; Chicxulub region | Visual effect validation and refinement pending; exact reconstructed impact position is not claimed |
| 8. Human evolution | Overlapping date ranges and selected fossil regions for six groups | Dots are selected evidence locations, not complete population ranges |
| 9. Migration | Fifteen branching approximate connections; progressive animation and dedicated playback | Needs visible route/progression validation; regional alternatives and evidence detail could be expanded |
| 10. Other hominins | Neanderthal and Denisovan-related fossil regions; overlap in time; interbreeding explanation | Continuous geographic range/contact-zone overlays are not implemented |
| 11. Ice age geography | Coarse bathymetric shelf exposure and schematic ice; documented sea-level anchors | Detailed Beringia/Sunda/Sahul validation pending; isostatic/local coastlines not modeled |
| 12. Civilization | Agriculture, Uruk, Egypt, Indus, Shang and Olmec chapters/markers | Bronze/Iron Age coverage is limited to context, not separate robust chapters |
| 13. Event markers | Timeline jumps, selected location focus, details, related events | Full click/focus/UI validation pending |
| 14. Playback | Four speeds, pause/resume, scrub, milestone steps, automatic human layers | Math/runtime navigation checked; actual playback timing and visual transitions need browser checks |
| 15. Era explorer | Searchable catalog, filters and featured shortcuts | Browser interaction validation pending |
| 16. Information design | Globe-centered desktop view; docked context; mobile bottom sheet CSS | Rendered overlap/readability audit pending |
| 17. Search | Accessible command search across names, descriptions and keywords | Search selection and keyboard flow need browser testing |
| 18. Visual style | Dark planetarium theme, restrained accents, serif/sans typography | Visual-exceptional quality claim is unproven without rendered inspection |
| 19. Realism | Satellite composite for modern Earth; shaded data-driven terrain for ancient Earth | Ancient detail limited by 1° source resolution; cloud pattern not meteorological reconstruction |
| 20. Accuracy | Primary scientific/museum sources, explicit uncertainty, corrected ICS boundaries | Source catalog exists; broad sources do not alone prove every adjacent claim |
| 21. Sources | Per-chapter links, dataset attribution and explanation panel | Link availability and exact claim coverage require continued focused checking |
| 22. Performance | Bounded texture cache, on-demand grids, pixel-ratio cap, hidden-tab render skip | Device performance and GPU/context-loss recovery tests pending |
| 23. Responsive design | Several CSS breakpoints, touch controls, mobile sheets | Real viewport and touch verification pending |
| 24. Accessibility | Labels, keyboard controls, focus styles, text alternatives, reduced motion | Contrast, focus trap, keyboard-only end-to-end and 200% text checks pending |
| 25. Architecture | Renderer, timeline/data, migration, sources and UI separated | Foundation is modular; additional data can be added without renderer rewrites |
| 26. Future expansion | Data-driven structure | Future features deliberately not implemented, as allowed in brief |
| 27. First load | Globe-led homepage with Begin the journey | Rendered first-load quality and asset-loading checks pending |
| 28. Details | Date, classification, description, importance, location, evidence, related chapters, sources | UI QA pending; entries currently combine evidence and certainty |
| 29. Time compression | 24-hour and calendar-year views with event jumps | Arithmetic grounded in event ages; visible interaction check pending |
| 30. Interactive product | Actual 3D, controls, routes, timeline; no marketing-only stand-in | Deployed; full browser journey validation pending |
| 31. Quality bar | Build, types, 4,005 round-trip positions, 109 raster integrity checks and WebMCP navigation passed | Entire requested production-quality bar is not yet proven |

## Current publication

Private version 9 is the last confirmed publication before this audit update. It includes the engraved brand, verified chapter-panel scroll reset, early-Earth surface differentiation, aligned Cryogenian context and Earth-only biosphere copy. A deployment success proves delivery, not visual or scientific completeness.

## Next priorities

1. Retain the last complete surface during raster loads, pause playback while buffering, and report the pending reconstruction. Implemented; broader failure and device testing remains.
2. Browser testing is explicitly authorized. Representative desktop/mobile checks have been performed; continue targeted regression checks as features change.
3. Improve major missing scientific features in the original scope: historical plate geometry/motion, regional migration/range evidence, and detailed ice-age geography, using published data rather than invented shapes.
4. Complete targeted source, accessibility and performance checks before declaring the goal achieved.


## Latest focused checks

Early Earth previously reused almost unchanged terrain above 540 Ma. Geometry, bare-rock treatment and cooling-stage clouds now vary with age, explicitly as illustration. Desktop browser snapshots checked 4540, 4400, 3800, 1800, 700 and 650 Ma; the nonglacial Cryogenian interval visibly differs from glacial coverage. No browser console errors in that check. Human Story Atlas search, selection of the Indus civilization and its evidence source were verified through the UI. This does not establish full scientific or physical-device completeness.


## Scientific-context regression pass — 2026-09-09

Shared Cryogenian ice timing now drives the renderer instead of duplicating GLSL dates. Environment labels distinguish Sturtian, nonglacial interval and Marinoan. Two sourced chapters explain the interval and later freeze. Precambrian comparison copy explicitly distinguishes illustrations from PaleoDEM reconstructions. Earth-only biosphere descriptions replace the residual hominin narrative; Human Odyssey retains human content. Holocene environmental classification uses the same 11.7 ka boundary as the geological hierarchy. Automated checks cover ice at 700/680/640/638 Ma, no ice in the modeled interval, label agreement, and the Earth-only biosphere invariant. Earlier table rows describe the baseline and must be interpreted with the dated refinements above; they are not a claim of current full completion.

Boundary-extinction chapter context now uses the geological period that ends at each formal boundary. The Great Dying therefore opens as Permian rather than Mesozoic, the end-Triassic event as Triassic, and the K–Pg event as Cretaceous. The Great Dying event anchor and certainty text use the high-precision marine extinction onset of approximately 251.941 Ma, while retaining explicit uncertainty for terrestrial timing and loss estimates. Browser verification confirmed the Great Dying sheet opens at scroll position zero, focuses its title, shows the Permian badge and produces no console errors.

## Phanerozoic globe integrity pass — 2026-09-09

Rendered inspection of the forest, Pangaea and early dinosaur intervals exposed a source-preparation defect: all 50 PaleoDEM textures from 150 through 395 Ma were flat zero-elevation rasters. The official EarthByte CSV collection mixes current LF/CRLF files with legacy CR-only files; the importer recognized only the first two line-ending forms. The importer now accepts all three, validates row count and elevation range, fills the published grids' omitted longitude seam where necessary, and regenerated the complete affected interval from the official CC BY 4.0 source. Automated checks now reject every flat, landless, oceanless or adjacent-duplicate PaleoDEM instead of merely counting image files.

The renderer also now distinguishes broad surface regimes without presenting them as exact biome maps: limited terrestrial vegetation before land plants, regional equatorial Carboniferous wetlands, increasing Permian–Triassic aridity, later greenhouse vegetation and a toggleable schematic late Paleozoic southern ice overlay. Desktop browser checks covered 310, 280, 250, 230, 200, 150, 100 and 66 Ma, plus the southern Carboniferous view with clouds disabled and the ice layer toggled. Continental geometry, land/ocean separation and interval-to-interval changes are visible; no WebGL or console errors were observed.

## Ice Age geography pass — 2026-09-09

The Human Odyssey globe now makes lowered sea level visually legible: the shared elevation grid exposes submerged shelf terrain, while newly emerged land receives a restrained mineral treatment distinct from ordinary modern terrain. The former pair of screen-space northern ice blobs has been replaced with geographic footprints for the Laurentide, Cordilleran, Innuitian and Eurasian complexes, plus Patagonia and the expanded Antarctic margin. Their time envelope peaks at 21 ka and fades through deglaciation. These are explicitly simplified, data-guided extents rather than a claim of exact ice thickness or margin position.

Human Odyssey now reports the interpolated global sea level and identifies Beringia, Sunda, Sahul and the persistent Wallacean sea crossings during relevant chapters. The Last Glacial Maximum evidence sheet cites Lambeck et al. for sea level and PaleoMIST for global ice reconstruction. Automated checks lock the LGM peak, Holocene retreat, regional readout and −120 m anchor. Desktop render inspection covered Sahul at 65 ka, Beringia at 32 ka and the 21 ka peak, plus the ice-and-shelf toggle; the revised ice growth curve was reduced after that inspection showed the pre-maximum extent was initially too strong. The readout remained legible and no console or WebGL errors appeared. Physical mobile-device and GPU performance checks remain open.

## Surface interpretation follow-up — 2026-09-09

Separated early low-growing vegetation from the illustrative Devonian forest expansion, following Davies et al. (2024). Globe caption now distinguishes PALEOMAP terrain from illustrative surface colors. Neither the climate belts nor circular Ice Age masks are imported vegetation/ice reconstructions; exact extents remain unresolved. Corrected the coarse sea-level ramp so mid/late-Holocene cities no longer show Ice Age land bridges. This remains an approximate global illustration, not a local relative-sea-level reconstruction. Accessibility changes retain explicit search and switch names, internal links, and pure playback updates. Keyboard atlas search and selection were exercised; full accessibility coverage remains open.

## Timeline accessibility verification — 2026-09-12

Both timeline labels and their selected-date descriptions now reach the actual range inputs rather than only their wrapper. Browser accessibility inspection verified the named Earth and Human Odyssey sliders. Keyboard Home/End changed Earth from present to 4.54 Ga and back; Human Odyssey End reported Many beginnings: 120,000 years ago. These checks prove slider naming and endpoint behavior, not full screen-reader compatibility or a complete accessibility audit.

## Graphics recovery verification — 2026-09-12

Actual WEBGL_lose_context extension tests covered both Earth and Human Odyssey during playback. Each slider remained unchanged while the context was lost, then advanced after restoration; screenshots confirmed the planet rendered again. The renderer now propagates context loss through buffering and stops render work until restoration. Human Odyssey obeys buffering and hidden-tab pauses. scripts/check-recovery.cjs preserves the repeatable integration check (Playwright and Chrome required). This does not prove recovery on every mobile GPU.

## Published navigation and surface-boundary regression — 2026-09-12

Reproduced the live Human Odyssey navigation failure: vinext client navigation emitted TypeError errors while the direct page returned HTTP 200. Internal route links now use native document navigation. Verified built Worker preview navigation into Human Odyssey, globe readiness and advancing playback without page errors. Replaced the abrupt 540 Ma procedural/reconstruction switch with a clearly illustrative 620–540 Ma interpolation anchored to the first terrain grid; preloads the 540 Ma grid and neighbors before crossing. Captured 620, 590, 560, 540.01, 539.99, 530 and 510 Ma; the boundary comparison passed the small-change threshold. This is visual continuity, not new evidence for Precambrian geography. Initial readiness now waits for required elevation grids and dismisses the loader when a usable surface is ready.

## Date selection, cache and recent-surface corrections — 2026-09-12

Removed automatic scale changes from date jumps, chapter/search selections, comparisons and WebMCP; starting playback now honors the selected scale. Terrain requests have four concurrent loads and prioritize selected dates; retain the bounded 109-grid set instead of evicting requested pairs during prefetch. The full compressed set is 3,367,166 bytes. Background warming prevents repeat-selection reloads. Canvas diagnostic attributes report requested/rendered ages; an explicit pending indicator appears while a new surface is unavailable. Production-preview checks cover 66, 34, 20, 5 Ma, 21 ka and 500 years; rapid jumps resolve to their final requested age and preserve Deep time. Found and corrected the overly broad glacial-surface mask that hid satellite imagery even at 500 years. Native same-origin View Transitions add blur/scale continuity between routes with reduced-motion handling; unsupported browsers keep normal navigation.
