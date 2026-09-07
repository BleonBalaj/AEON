# AEON — A living history of Earth

An interactive planetarium-style Earth history atlas. React 19, TypeScript, Three.js and Vinext, with accessible Base UI / Shadcn controls.

## Run

- `npm install`
- `npm run dev`
- `npm test` — timeline math, geological boundaries, sources, sea-level anchors, raster integrity and plate data.
- `npx tsc --noEmit`
- `npm run build`

## Systems

- `components/earth-globe.tsx`: GPU renderer, camera, surface interpolation, atmosphere, migration paths, fossil/civilization pins and modern plate boundaries.
- `lib/earth/history.ts`: sourced chapters, geological hierarchy, five timeline scales, qualitative environmental summaries and illustrative sea-level interpolation.
- `lib/earth/migration.ts`: schematic dispersal connections and overlapping fossil date ranges.
- `public/paleo`: 109 encoded elevation grids spanning 0–540 Ma, generally at 5 Ma intervals. High byte in red, low byte in green; metres = R*256+G-10000.
- `app/page.tsx`: playback, search, layer controls, chapter and evidence panels, comparison and time-compression views.

The initial view uses NASA imagery. The deep-time overview is deliberately nonlinear, preserving space for recent human history. Four additional windows use linear scales within the selected interval.

## Scientific provenance and limitations

PALEOMAP PaleoDEMs: Scotese, C.R. & Wright, N. (2018), obtained from EarthByte, CC BY 4.0. Original elevation values were encoded as PNG; exported polar-row artifacts were replaced with the adjacent row. Surface interpolation blends elevations and is not a continuous plate-rotation solution. Terrain colors and cloud patterns are illustrative rather than reconstructed vegetation or weather.

Modern texture: NASA Blue Marble Next Generation, July 2004, cloud-free composite. NASA is credited and no endorsement is implied.

Plate boundaries: Peter Bird (2003) PB2002; GeoJSON conversion by Hugo Ahlenius / Nordpil, ODC Attribution License. Only modern/recent views show these boundaries. The application does not invent ancient plate vectors, boundary types, subduction rates or reconstructed motion arrows.

Before 540 Ma, procedural worlds illustrate physical conditions; continent locations are explicitly not claimed as known. Early proposed supercontinents are described with uncertainty. The 1-degree modern elevation grid only approximates glacial shelf exposure; local sea-level effects, detailed ice margins, straits and isostasy are not modeled. Ice is schematic. Migration paths illustrate broad connections, not a validated route reconstruction. Hominin dots represent selected fossil regions, not continuous population ranges.

The geological hierarchy uses ICS 2024/12, including the 4031 Ma Archean boundary. Navigation is in approximate years before present; civilization BCE labels are rounded. Exact historical temperatures or gas concentrations are not invented. Climate overlay latitude bands are explicitly illustrative.

46 sourced chapters cover the requested history at overview depth; this is not a complete fossil database, climate model, archaeological atlas or political-history simulator. Sources are accessible per chapter and in About the atlas.

To regenerate rasters, obtain the CSV archive from https://www.earthbyte.org/paleodem-resource-scotese-and-wright-2018/ and NASA's Blue Marble JPEG, then run:

`node scripts/prepare-paleo.mjs CSV_DIRECTORY NASA_JPEG LICENSE_FILE`

## Validation

- TypeScript and production build passed during development.
- Automated tests cover 4,005 round-trip positions across five timeline scales, geological boundaries including K–Pg, all source references, all 109 raster dimensions, known land/ocean coordinate orientation, distinct Pangaea geography and source-backed sea-level anchors.
- Browser WebMCP contract verified for navigation to 280 Ma, 21 ka and present; invalid negative time rejected without altering state. No runtime errors reported in that check.
- Full screenshot-based visual QA and exhaustive pointer/touch/browser-device testing were not performed. The bundled Sites skill reserves these for explicit browser-testing requests.

Optional browser agent tools are feature-detected through `document.modelContext`; unsupported browsers retain the complete visible interface.
