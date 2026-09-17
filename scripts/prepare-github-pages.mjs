import { readFile, writeFile } from 'node:fs/promises';

const prefix = '/AEON';

async function patchFile(path, replacements) {
  let source = await readFile(path, 'utf8');

  for (const [needle, replacement] of replacements) {
    if (!source.includes(needle)) {
      throw new Error(`GitHub Pages patch could not find expected text in ${path}: ${needle}`);
    }
    source = source.split(needle).join(replacement);
  }

  await writeFile(path, source);
}

await patchFile('components/earth-globe.tsx', [
  ["l.load('/textures/earth.webp'", "l.load('/AEON/textures/earth.webp'"],
  ["l.load('/paleo-detail/0.png'", "l.load('/AEON/paleo-detail/0.png'"],
  [
    "loader.load((gridAge<=70?'/paleo-detail/':'/paleo/')+gridAge+'.png'",
    "loader.load((gridAge<=70?'/AEON/paleo-detail/':'/AEON/paleo/')+gridAge+'.png'",
  ],
  ["loader.load('/textures/earth.webp'", "loader.load('/AEON/textures/earth.webp'"],
  ["fetch('/plates.json')", "fetch('/AEON/plates.json')"],
]);

await patchFile('app/observatory.css', [
  ["url('/art/observatory-chamber.png')", "url('/AEON/art/observatory-chamber.png')"],
]);

console.log(`Prepared static assets for GitHub Pages at ${prefix}`);
