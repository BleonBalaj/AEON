"""Import publisher's 0.1-degree PaleoDEM grids; no synthetic geography.

Usage: python scripts/prepare-cenozoic.py ARCHIVE
Requires numpy, netCDF4 and Pillow (build-time only).
"""
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
import numpy as np
from netCDF4 import Dataset
from PIL import Image

archive = Path(sys.argv[1])
out = Path('public/paleo-detail')
out.mkdir(exist_ok=True)
records = []
with zipfile.ZipFile(archive) as source:
    for name in source.namelist():
        match = re.search(r'_([\d.]+)Ma\.nc$', name)
        if not match or name.startswith('__MACOSX'):
            continue
        age = float(match[1])
        if age > 70 or age % 5:
            continue
        with Dataset('memory', memory=source.read(name)) as grid:
            lat = np.asarray(grid['latitude'][:])
            lon = np.asarray(grid['longitude'][:])
            z = np.asarray(grid['z'][:])
            assert z.shape == (1801, 3601)
            assert np.isfinite(z).all()
            assert np.all(np.diff(lat) > 0) or np.all(np.diff(lat) < 0)
            assert np.all(np.diff(lon) > 0) or np.all(np.diff(lon) < 0)
            if lat[0] > lat[-1]:
                z = z[::-1, :]
            if lon[0] > lon[-1]:
                z = z[:, ::-1]
            # Keep every second published sample: 0.2 degrees, 1801 x 901.
            # Image rows run north to south. Repair export-only polar spikes.
            z = z[::-2, ::2].copy()
            z[0] = z[1]
            z[-1] = z[-2]
            z[:, -1] = z[:, 0]
            encoded = np.rint(np.clip(z + 10000, 0, 65535)).astype(np.uint16)
            rgb = np.zeros((*z.shape, 3), dtype=np.uint8)
            rgb[..., 0] = encoded >> 8
            rgb[..., 1] = encoded & 255
            Image.fromarray(rgb).save(out / f'{int(age)}.png', optimize=True)
            records.append({'age': age, 'file': name, 'description': grid.description})
assert sorted(r['age'] for r in records) == list(range(0, 71, 5))
(out / 'provenance.json').write_text(json.dumps({
    'citation': 'Scotese & Wright (2018), PALEOMAP PaleoDEMs',
    'source': 'https://zenodo.org/records/5460860',
    'archive': archive.name,
    'archiveSha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
    'sourceSpacingDegrees': 0.1,
    'displaySpacingDegrees': 0.2,
    'note': 'Nominal source ages retained. Sampled published grids; no added terrain. Polar export spikes repaired from adjacent rows.',
    'records': sorted(records, key=lambda r: r['age']),
}, indent=2) + '\n', encoding='utf-8')
print(f'Imported {len(records)} finer terrain grids from 0 to 70 Ma')
