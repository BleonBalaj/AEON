export interface PaleoCityAnchor {
  age: number; // in Ma (0 to 540)
  lat: number; // latitude in degrees (-90 to 90)
  lon: number; // longitude in degrees (-180 to 180)
  environment: string;
}

export interface PaleoCity {
  id: string;
  name: string;
  country: string;
  region: string;
  craton: string;
  modernLat: number;
  modernLon: number;
  anchors: PaleoCityAnchor[];
}

export interface PaleoCityLocation {
  lat: number;
  lon: number;
  driftKm: number;
  environment: string;
  direction: string;
}

// Great-circle distance between two geographic points in kilometers
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Cardinal direction from ancient coordinate to modern coordinate
export function getDriftBearing(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const cardinals = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest', 'North'];
  return cardinals[Math.round(brng / 45) % 8];
}

// Interpolate paleolocation smoothly between calibrated PALEOMAP anchors
export function getPaleoCityLocation(city: PaleoCity, age: number): PaleoCityLocation {
  // Clamp to calibrated range
  const clampedAge = Math.max(0, Math.min(540, age));
  const anchors = city.anchors;

  if (clampedAge <= 0) {
    return {
      lat: city.modernLat,
      lon: city.modernLon,
      driftKm: 0,
      environment: 'Present-day geographic location',
      direction: 'None',
    };
  }

  // Find surrounding anchors
  let lower = anchors[0];
  let upper = anchors[anchors.length - 1];

  for (let i = 0; i < anchors.length - 1; i++) {
    if (clampedAge >= anchors[i].age && clampedAge <= anchors[i + 1].age) {
      lower = anchors[i];
      upper = anchors[i + 1];
      break;
    }
  }

  const span = upper.age - lower.age;
  const t = span === 0 ? 0 : (clampedAge - lower.age) / span;
  // Smooth cosine easing between anchors
  const easeT = (1 - Math.cos(t * Math.PI)) / 2;

  // Latitude linear interpolation
  const lat = lower.lat + (upper.lat - lower.lat) * easeT;

  // Shortest-path longitude interpolation
  let dLon = upper.lon - lower.lon;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;
  let lon = lower.lon + dLon * easeT;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;

  const driftKm = haversineKm(lat, lon, city.modernLat, city.modernLon);
  const direction = getDriftBearing(lat, lon, city.modernLat, city.modernLon);
  const environment = t > 0.5 ? upper.environment : lower.environment;

  return {
    lat: Number(lat.toFixed(1)),
    lon: Number(lon.toFixed(1)),
    driftKm,
    environment,
    direction,
  };
}

// Calibrated PALEOMAP global cities database
export const paleoCities: PaleoCity[] = [
  {
    id: 'pristina',
    name: 'Pristina (Prishtinë)',
    country: 'Kosovo',
    region: 'Europe',
    craton: 'Pelagonian / Vardar Belt',
    modernLat: 42.67,
    modernLon: 21.17,
    anchors: [
      { age: 0, lat: 42.7, lon: 21.2, environment: 'Temperate Balkan highland basin' },
      { age: 20, lat: 38.5, lon: 18.0, environment: 'Emerging Dinaric mountain chains & Paratethys shores' },
      { age: 50, lat: 34.0, lon: 15.0, environment: 'Subtropical Tethyan island archipelago & Alpine uplift' },
      { age: 66, lat: 30.0, lon: 12.0, environment: 'Warm carbonate reefs in the northern Tethys seaway' },
      { age: 100, lat: 24.0, lon: 10.0, environment: 'Subtropical Tethyan carbonate platform & volcanic arc' },
      { age: 150, lat: 19.5, lon: 8.0, environment: 'Tropical reef lagoon and closing Vardar oceanic basin' },
      { age: 200, lat: 14.0, lon: 6.0, environment: 'Opening Neotethys rift along the eastern edge of Pangaea' },
      { age: 250, lat: 7.5, lon: 4.0, environment: 'Tropical coastal margin facing the Paleotethys' },
      { age: 300, lat: -1.0, lon: 2.0, environment: 'Equatorial Variscan collisional belt & dense swamps' },
      { age: 370, lat: -16.0, lon: -5.0, environment: 'Peri-Gondwanan microcontinent in the Rheic Ocean' },
      { age: 440, lat: -32.0, lon: -12.0, environment: 'Subtropical shallow marine shelf of southern Gondwana' },
      { age: 500, lat: -52.0, lon: -20.0, environment: 'Temperate southern high-latitude Gondwanan margin' },
      { age: 540, lat: -58.0, lon: -24.0, environment: 'Sub-polar marine shelf during the Cambrian explosion' },
    ],
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    craton: 'Baltica / Avalonia',
    modernLat: 51.51,
    modernLon: -0.13,
    anchors: [
      { age: 0, lat: 51.5, lon: -0.1, environment: 'Temperate maritime British Isles' },
      { age: 20, lat: 48.0, lon: -2.0, environment: 'Warm temperate European seaway' },
      { age: 50, lat: 43.0, lon: -5.0, environment: 'Subtropical coastal rainforest and shallow sea' },
      { age: 66, lat: 38.0, lon: -10.0, environment: 'Warm shallow chalk seas near K-Pg boundary' },
      { age: 100, lat: 35.0, lon: -12.0, environment: 'Subtropical European archipelago in Tethys ocean' },
      { age: 150, lat: 32.0, lon: 5.0, environment: 'Tropical island reef lagoon in the Jurassic sea' },
      { age: 200, lat: 23.0, lon: 12.0, environment: 'Subtropical northern Pangaean rift margin' },
      { age: 250, lat: 14.0, lon: 22.0, environment: 'Arid interior of northern Pangaea' },
      { age: 300, lat: -2.0, lon: 18.0, environment: 'Equatorial tropical wetland and coal swamp forest' },
      { age: 370, lat: -18.0, lon: 10.0, environment: 'Old Red Sandstone continent south of the equator' },
      { age: 440, lat: -35.0, lon: 5.0, environment: 'Subtropical margin of the closing Iapetus Ocean' },
      { age: 500, lat: -55.0, lon: -20.0, environment: 'Temperate southern polar shelf of Avalonia' },
      { age: 540, lat: -60.0, lon: -25.0, environment: 'Sub-polar southern sea during Cambrian explosion' },
    ],
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    region: 'North America',
    craton: 'Laurentia',
    modernLat: 40.71,
    modernLon: -74.01,
    anchors: [
      { age: 0, lat: 40.7, lon: -74.0, environment: 'Temperate coastal North Atlantic' },
      { age: 20, lat: 39.0, lon: -72.0, environment: 'Warm temperate eastern North American seaboard' },
      { age: 50, lat: 36.0, lon: -68.0, environment: 'Dense subtropical forest during Eocene thermal maximum' },
      { age: 66, lat: 34.0, lon: -62.0, environment: 'Forested coastal plain facing developing Atlantic' },
      { age: 100, lat: 31.0, lon: -55.0, environment: 'Subtropical Appalachian mountain margin' },
      { age: 150, lat: 24.0, lon: -35.0, environment: 'Opening Central Atlantic tropical rift sea' },
      { age: 200, lat: 15.0, lon: -20.0, environment: 'Central Atlantic Magmatic rift basin in central Pangaea' },
      { age: 250, lat: 6.0, lon: -12.0, environment: 'Equatorial continental interior of Pangaea' },
      { age: 300, lat: -4.0, lon: -18.0, environment: 'Tropical rainforest and Appalachian mountain building' },
      { age: 370, lat: -18.0, lon: -25.0, environment: 'Euramerican coastal wetland south of the equator' },
      { age: 440, lat: -22.0, lon: -32.0, environment: 'Taconic mountain orogeny and warm tropical sea' },
      { age: 500, lat: -15.0, lon: -38.0, environment: 'Tropical carbonate shelf of ancient Laurentia' },
      { age: 540, lat: -12.0, lon: -40.0, environment: 'Tropical shallow sea during Cambrian diversification' },
    ],
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    craton: 'Australian Craton / East Gondwana',
    modernLat: -33.87,
    modernLon: 151.21,
    anchors: [
      { age: 0, lat: -33.9, lon: 151.2, environment: 'Temperate coastal southeastern Australia' },
      { age: 20, lat: -42.0, lon: 142.0, environment: 'Cool temperate forest drifting north from Antarctica' },
      { age: 50, lat: -58.0, lon: 130.0, environment: 'Attached to Antarctica in southern polar forest' },
      { age: 66, lat: -64.0, lon: 122.0, environment: 'Southern high-latitude polar conifer forest' },
      { age: 100, lat: -68.0, lon: 115.0, environment: 'Near South Pole with seasonal polar darkness' },
      { age: 150, lat: -52.0, lon: 125.0, environment: 'Eastern Gondwana continental interior' },
      { age: 200, lat: -45.0, lon: 140.0, environment: 'Cool temperate Gondwanan river basin' },
      { age: 250, lat: -62.0, lon: 148.0, environment: 'High-latitude southern margin of Pangaea' },
      { age: 300, lat: -72.0, lon: 140.0, environment: 'Covered beneath the immense Gondwana ice sheet' },
      { age: 370, lat: -25.0, lon: 130.0, environment: 'Warm subtropical eastern Gondwana sea' },
      { age: 440, lat: -12.0, lon: 120.0, environment: 'Tropical ocean shelf north of central Gondwana' },
      { age: 500, lat: 8.0, lon: 110.0, environment: 'Northern equatorial tropical reef sea' },
      { age: 540, lat: 15.0, lon: 105.0, environment: 'Equatorial shallow sea in eastern Gondwana' },
    ],
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    craton: 'East Asian Continental Margin',
    modernLat: 35.68,
    modernLon: 139.77,
    anchors: [
      { age: 0, lat: 35.7, lon: 139.8, environment: 'Temperate Japanese volcanic island arc' },
      { age: 20, lat: 32.0, lon: 135.0, environment: 'Opening of the Sea of Japan back-arc basin' },
      { age: 50, lat: 26.0, lon: 130.0, environment: 'Subtropical Asian continental margin volcanic chain' },
      { age: 66, lat: 28.0, lon: 125.0, environment: 'Active volcanic arc along eastern Eurasia' },
      { age: 100, lat: 32.0, lon: 120.0, environment: 'Subduction trench facing the Panthalassa ocean' },
      { age: 150, lat: 35.0, lon: 115.0, environment: 'Terranes accreting to the East Asian margin' },
      { age: 200, lat: 30.0, lon: 110.0, environment: 'Subtropical island arc in western Panthalassa' },
      { age: 250, lat: 22.0, lon: 105.0, environment: 'Tropical marine arc near the South China block' },
      { age: 300, lat: 12.0, lon: 95.0, environment: 'Tropical Tethyan ocean margin' },
      { age: 370, lat: 5.0, lon: 85.0, environment: 'Equatorial volcanic archipelago in Panthalassa' },
      { age: 440, lat: -5.0, lon: 75.0, environment: 'Southern equatorial volcanic island arc' },
      { age: 500, lat: -18.0, lon: 65.0, environment: 'Subtropical oceanic arc off Gondwana' },
      { age: 540, lat: -25.0, lon: 60.0, environment: 'Early Paleozoic microcontinental fragment' },
    ],
  },
  {
    id: 'cairo',
    name: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    craton: 'African Craton',
    modernLat: 30.04,
    modernLon: 31.24,
    anchors: [
      { age: 0, lat: 30.0, lon: 31.2, environment: 'Nile Valley oasis in arid North Africa' },
      { age: 20, lat: 26.0, lon: 32.0, environment: 'Tropical Tethys seaway closing into Mediterranean' },
      { age: 50, lat: 18.0, lon: 30.0, environment: 'Warm shallow tropical Tethys ocean (whale valley)' },
      { age: 66, lat: 12.0, lon: 28.0, environment: 'Tropical marine carbonate platform on African shelf' },
      { age: 100, lat: 5.0, lon: 22.0, environment: 'Equatorial mangrove coast and dinosaur delta' },
      { age: 150, lat: 2.0, lon: 18.0, environment: 'Equatorial margin of northern Gondwana' },
      { age: 200, lat: -4.0, lon: 15.0, environment: 'Southern equatorial Tethys ocean shoreline' },
      { age: 250, lat: -12.0, lon: 10.0, environment: 'Subtropical northern Gondwana interior' },
      { age: 300, lat: -24.0, lon: 8.0, environment: 'Dry subtropical zone of the Gondwana supercontinent' },
      { age: 370, lat: -45.0, lon: 5.0, environment: 'Temperate southern high-latitude Gondwana' },
      { age: 440, lat: -65.0, lon: 0.0, environment: 'Near South Pole during late Ordovician ice age' },
      { age: 500, lat: -52.0, lon: -10.0, environment: 'Southern cold-temperate continental platform' },
      { age: 540, lat: -42.0, lon: -18.0, environment: 'Southern temperate margin of assembling Gondwana' },
    ],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    region: 'Asia',
    craton: 'Indian Plate',
    modernLat: 19.08,
    modernLon: 72.88,
    anchors: [
      { age: 0, lat: 19.1, lon: 72.9, environment: 'Tropical Arabian Sea coastline of western India' },
      { age: 20, lat: 12.0, lon: 70.0, environment: 'Crashing into Asia; uplifting the Himalayas' },
      { age: 50, lat: -5.0, lon: 65.0, environment: 'Fastest-drifting continent; speeding across equator' },
      { age: 66, lat: -18.0, lon: 60.0, environment: 'Directly over Réunion hotspot; Deccan Traps eruptions' },
      { age: 100, lat: -42.0, lon: 52.0, environment: 'Isolated island continent rifting from Madagascar' },
      { age: 150, lat: -55.0, lon: 45.0, environment: 'Locked in interior of southern Gondwana' },
      { age: 200, lat: -48.0, lon: 50.0, environment: 'Cool temperate Gondwana rift valley' },
      { age: 250, lat: -42.0, lon: 55.0, environment: 'Southern high-latitude margin of Tethys Ocean' },
      { age: 300, lat: -52.0, lon: 60.0, environment: 'Deep inside the late Paleozoic southern ice sheet' },
      { age: 370, lat: -25.0, lon: 65.0, environment: 'Subtropical Gondwana carbonate shelf' },
      { age: 440, lat: -10.0, lon: 70.0, environment: 'Tropical ocean margin of ancient Gondwana' },
      { age: 500, lat: 5.0, lon: 75.0, environment: 'Northern equatorial tropical ocean shelf' },
      { age: 540, lat: 12.0, lon: 80.0, environment: 'Equatorial shallow sea in early Cambrian Gondwana' },
    ],
  },
  {
    id: 'sao-paulo',
    name: 'São Paulo',
    country: 'Brazil',
    region: 'South America',
    craton: 'South American Platform',
    modernLat: -23.55,
    modernLon: -46.63,
    anchors: [
      { age: 0, lat: -23.6, lon: -46.6, environment: 'Subtropical Brazilian highlands near Atlantic coast' },
      { age: 20, lat: -26.0, lon: -42.0, environment: 'Subtropical South American forest' },
      { age: 50, lat: -32.0, lon: -35.0, environment: 'Dense warm temperate forest in isolating continent' },
      { age: 66, lat: -36.0, lon: -28.0, environment: 'Opening South Atlantic; widening oceanic gulf' },
      { age: 100, lat: -40.0, lon: -18.0, environment: 'Early South Atlantic rift; shared fauna with Africa' },
      { age: 150, lat: -45.0, lon: -10.0, environment: 'Locked contiguous against the African continent' },
      { age: 200, lat: -50.0, lon: -5.0, environment: 'Interior Paraná basin desert and basalt flows' },
      { age: 250, lat: -58.0, lon: 0.0, environment: 'Cold-temperate southern Pangaean interior' },
      { age: 300, lat: -65.0, lon: 10.0, environment: 'Glaciated under massive Gondwana continental ice' },
      { age: 370, lat: -55.0, lon: 20.0, environment: 'Cool temperate Devonian marine basin' },
      { age: 440, lat: -48.0, lon: 30.0, environment: 'Southern high-latitude peri-glacial sea' },
      { age: 500, lat: -35.0, lon: 40.0, environment: 'Subtropical marine basin in western Gondwana' },
      { age: 540, lat: -25.0, lon: 45.0, environment: 'Warm shallow sea in assembling Gondwana' },
    ],
  },
  {
    id: 'beijing',
    name: 'Beijing',
    country: 'China',
    region: 'Asia',
    craton: 'North China Craton',
    modernLat: 39.91,
    modernLon: 116.40,
    anchors: [
      { age: 0, lat: 39.9, lon: 116.4, environment: 'Temperate North China Plain' },
      { age: 20, lat: 38.0, lon: 114.0, environment: 'Temperate East Asian river basin' },
      { age: 50, lat: 35.0, lon: 110.0, environment: 'Warm subtropical forested Asian interior' },
      { age: 66, lat: 32.0, lon: 105.0, environment: 'Subtropical dinosaur floodplain in East Asia' },
      { age: 100, lat: 32.0, lon: 105.0, environment: 'Warm temperate inland lake and volcanic basin' },
      { age: 150, lat: 28.0, lon: 100.0, environment: 'Subtropical Yanliao forested ecosystem (feathered dinosaurs)' },
      { age: 200, lat: 22.0, lon: 95.0, environment: 'Tropical river and lake basin in South Asia' },
      { age: 250, lat: 15.0, lon: 85.0, environment: 'Isolated tropical block docking with southern Siberia' },
      { age: 300, lat: 5.0, lon: 75.0, environment: 'Tropical island continent in the paleo-Tethys Ocean' },
      { age: 370, lat: -5.0, lon: 68.0, environment: 'Equatorial carbonate shelf in Panthalassa' },
      { age: 440, lat: -15.0, lon: 60.0, environment: 'Subtropical shallow tropical sea' },
      { age: 500, lat: -22.0, lon: 52.0, environment: 'Warm marine platform with trilobite reefs' },
      { age: 540, lat: -28.0, lon: 45.0, environment: 'Shallow sea during early Cambrian explosion' },
    ],
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    craton: 'Kalahari Craton / Cape Fold Belt',
    modernLat: -33.92,
    modernLon: 18.42,
    anchors: [
      { age: 0, lat: -33.9, lon: 18.4, environment: 'Mediterranean fynbos coastal tip of southern Africa' },
      { age: 20, lat: -35.0, lon: 17.0, environment: 'Cool temperate Benguela current upwelling zone' },
      { age: 50, lat: -38.0, lon: 15.0, environment: 'Temperate southern tip of Africa' },
      { age: 66, lat: -42.0, lon: 12.0, environment: 'Early South Atlantic gateway ocean basin' },
      { age: 100, lat: -48.0, lon: 8.0, environment: 'Sub-polar southern ocean rifting from Falkland plateau' },
      { age: 150, lat: -55.0, lon: 2.0, environment: 'Deep within southern Gondwana supercontinent' },
      { age: 200, lat: -62.0, lon: -5.0, environment: 'Karoo basin filled with mammal-like reptiles' },
      { age: 250, lat: -70.0, lon: -10.0, environment: 'Southern high-latitude polar Karoo basin' },
      { age: 300, lat: -78.0, lon: -15.0, environment: 'Submerged beneath the Dwyka polar ice sheet' },
      { age: 370, lat: -65.0, lon: -20.0, environment: 'Cold-temperate southern marine embayment' },
      { age: 440, lat: -45.0, lon: -25.0, environment: 'Glacial marine deposits (Table Mountain sandstones)' },
      { age: 500, lat: -30.0, lon: -28.0, environment: 'Subtropical marine basin in assembling Gondwana' },
      { age: 540, lat: -20.0, lon: -30.0, environment: 'Warm shallow sea in early Cambrian Africa' },
    ],
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    craton: 'Armorica / Variscan Belt',
    modernLat: 48.86,
    modernLon: 2.35,
    anchors: [
      { age: 0, lat: 48.9, lon: 2.4, environment: 'Temperate Paris basin in western Europe' },
      { age: 20, lat: 45.0, lon: 0.0, environment: 'Warm temperate European inland basin' },
      { age: 50, lat: 40.0, lon: -3.0, environment: 'Subtropical palm-rich Paris basin tropical sea' },
      { age: 66, lat: 35.0, lon: -7.0, environment: 'Warm chalk ocean teeming with ammonites' },
      { age: 100, lat: 32.0, lon: -9.0, environment: 'Tropical island archipelago in Tethys ocean' },
      { age: 150, lat: 28.0, lon: 8.0, environment: 'Warm shallow lagoon and carbonate coral reefs' },
      { age: 200, lat: 20.0, lon: 15.0, environment: 'Subtropical evaporite basin in interior Pangaea' },
      { age: 250, lat: 12.0, lon: 24.0, environment: 'Hot arid desert heart of northern Pangaea' },
      { age: 300, lat: -3.0, lon: 20.0, environment: 'Equatorial Variscan mountain chain and coal swamps' },
      { age: 370, lat: -20.0, lon: 12.0, environment: 'Warm shallow sea south of the Devonian equator' },
      { age: 440, lat: -38.0, lon: 6.0, environment: 'Subtropical peri-Gondwanan microcontinental shelf' },
      { age: 500, lat: -58.0, lon: -18.0, environment: 'High-latitude cold shelf near southern Gondwana' },
      { age: 540, lat: -62.0, lon: -22.0, environment: 'Polar-temperate Cambrian ocean shelf' },
    ],
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    country: 'United States',
    region: 'North America',
    craton: 'Cordilleran Accreted Terranes',
    modernLat: 34.05,
    modernLon: -118.24,
    anchors: [
      { age: 0, lat: 34.1, lon: -118.2, environment: 'Mediterranean coastal plain along San Andreas fault' },
      { age: 20, lat: 31.0, lon: -115.0, environment: 'Opening Gulf of California rift system' },
      { age: 50, lat: 28.0, lon: -110.0, environment: 'Subtropical forearc basin on Pacific margin' },
      { age: 66, lat: 26.0, lon: -105.0, environment: 'Active volcanic mountain chain (Sierra Nevada roots)' },
      { age: 100, lat: 24.0, lon: -98.0, environment: 'Subduction trench facing the ancient Farallon plate' },
      { age: 150, lat: 18.0, lon: -85.0, environment: 'Island arc terranes colliding with western Laurentia' },
      { age: 200, lat: 10.0, lon: -75.0, environment: 'Tropical volcanic arc in eastern Panthalassa' },
      { age: 250, lat: 3.0, lon: -65.0, environment: 'Equatorial oceanic island arc off western Pangaea' },
      { age: 300, lat: -6.0, lon: -60.0, environment: 'Tropical volcanic archipelago in Panthalassa' },
      { age: 370, lat: -18.0, lon: -55.0, environment: 'Deep ocean floor off ancient southwestern Laurentia' },
      { age: 440, lat: -25.0, lon: -50.0, environment: 'Panthalassa oceanic basin' },
      { age: 500, lat: -15.0, lon: -52.0, environment: 'Passive margin tropical sea of western Laurentia' },
      { age: 540, lat: -10.0, lon: -55.0, environment: 'Equatorial shallow sea on Laurentian shelf' },
    ],
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    craton: 'Apulian Microplate / Adria',
    modernLat: 41.90,
    modernLon: 12.50,
    anchors: [
      { age: 0, lat: 41.9, lon: 12.5, environment: 'Mediterranean peninsula between Tyrrhenian & Adriatic' },
      { age: 20, lat: 38.0, lon: 10.0, environment: 'Apennine mountain building during African collision' },
      { age: 50, lat: 30.0, lon: 6.0, environment: 'Subtropical carbonate platform in closing Tethys' },
      { age: 66, lat: 24.0, lon: 2.0, environment: 'Tropical shallow sea and coral reefs (Tethys Ocean)' },
      { age: 100, lat: 18.0, lon: 5.0, environment: 'Tropical Bahama-like carbonate bank in Tethys' },
      { age: 150, lat: 14.0, lon: 15.0, environment: 'Tropical ocean shelf between Africa and Europe' },
      { age: 200, lat: 8.0, lon: 22.0, environment: 'Equatorial Tethys carbonate platform' },
      { age: 250, lat: -2.0, lon: 30.0, environment: 'Equatorial coastline of Tethyan marine embayment' },
      { age: 300, lat: -14.0, lon: 26.0, environment: 'Subtropical marine shelf on northern Gondwana' },
      { age: 370, lat: -32.0, lon: 18.0, environment: 'Southern temperate margin of northern Gondwana' },
      { age: 440, lat: -55.0, lon: 12.0, environment: 'High-latitude cold sea near northern African craton' },
      { age: 500, lat: -48.0, lon: 2.0, environment: 'Temperate marine shelf in northern Gondwana' },
      { age: 540, lat: -38.0, lon: -5.0, environment: 'Southern temperate sea in early Cambrian' },
    ],
  },
];
