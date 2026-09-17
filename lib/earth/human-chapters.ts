export interface KeySite {
  name: string;
  date: string;
  location: string;
  details: string;
}

export interface ChapterEvidenceData {
  subtitle: string;
  lead: string;
  significance: string;
  uncertainty: string;
  environment: string;
  genetics: string;
  technology: string;
  sites: KeySite[];
  sources: { name: string; url: string; note: string }[];
}

export interface HumanChapter {
  id: string;
  name: string;
  region: string;
  start: number;
  end: number;
  focus: [number, number];
  routes: readonly string[];
  insight: string;
  evidence: ChapterEvidenceData;
}

export const humanChapters: HumanChapter[] = [
  {
    id: 'sapiens',
    name: 'Many beginnings',
    region: 'Africa',
    start: 0.3,
    end: 0.12,
    focus: [8, 23],
    routes: ['africa-n', 'africa-s'],
    insight:
      'Our origins belong to a continent. The points on this globe represent selected evidence, not one birthplace.',
    evidence: {
      subtitle: 'The Pan-African Emergence of Modern Humans',
      lead:
        'Palaeoanthropology and paleogenomics have decisively replaced the old "single cradle of humankind" model with a pan-African structured metapopulation framework. Between 300,000 and 100,000 years ago, anatomically and culturally modern humans emerged not from one isolated valley, but through shifting networks of populations spanning northern, eastern, and southern Africa.',
      significance:
        'Demonstrates that the diagnostic traits of Homo sapiens—including globular braincases, retracted facial anatomy, symbolic pigment utilization, and complex Middle Stone Age projectile technologies—evolved polycentrically across an entire continent over hundreds of millennia.',
      uncertainty:
        'Fossil preservation remains sparse across the tropical rainforest basins of Central and West Africa. The exact degree of gene flow between regional groups and the contribution of archaic "ghost" African hominin populations remain active areas of genomic research.',
      environment:
        'Milankovitch orbital cycles drove repeated "Green Sahara" African Humid Periods interspersed with intense mega-droughts. Expanding savannas and lake networks created trans-continental migration corridors that periodically connected regional populations before desertification isolated them again.',
      genetics:
        'Whole-genome analyses of contemporary African hunter-gatherer populations (including San, Mbuti, and Biaka groups) demonstrate deepest modern human lineage divergences exceeding 250,000–300,000 years, confirming ancient continental structure.',
      technology:
        'Middle Stone Age (MSA) prepared-core Levallois flake and blade production, heat treatment of silcrete stones, mastic-glued hafted spears, bone points, and geometric engraved ochre art.',
      sites: [
        {
          name: 'Jebel Irhoud',
          date: '~315,000 years ago',
          location: 'Morocco, North Africa',
          details:
            'Earliest known early Homo sapiens crania, displaying modern-like facial structures combined with elongated archaic braincases, accompanied by Levallois flint blades and evidence of controlled fire.',
        },
        {
          name: 'Florisbad',
          date: '~260,000 years ago',
          location: 'Free State, South Africa',
          details:
            'Transitional cranial fragment representing an early archaic Homo sapiens morphology in the southern extremity of the continent, proving continental-scale geographic breadth.',
        },
        {
          name: 'Omo Kibish (Omo I)',
          date: '~233,000 years ago',
          location: 'Omo Valley, Ethiopia',
          details:
            'Redated via volcanic ash tephrochronology in 2022; possesses high cranial vaults, rounded occipital profiles, and distinct modern chin morphology.',
        },
        {
          name: 'Herto (Bouri)',
          date: '~160,000 years ago',
          location: 'Middle Awash, Ethiopia',
          details:
            'Fossils of Homo sapiens idaltu showing cultural defleshing and polished cutmarks, indicating complex early mortuary practices and symbolic behaviors.',
        },
        {
          name: 'Blombos Cave & Klasies River',
          date: '~100,000–75,000 years ago',
          location: 'Southern Cape, South Africa',
          details:
            'Cross-hatched engraved ochre plaques, marine shellfish harvesting, bone awls, Nassarius shell bead jewelry, and heat-treated silcrete stone tools.',
        },
      ],
      sources: [
        {
          name: 'Scerri et al. (2018) - Did Our Species Evolve in Subdivided Populations?',
          url: 'https://doi.org/10.1016/j.tree.2018.05.005',
          note: 'Foundational paper on the pan-African evolution model.',
        },
        {
          name: 'Hublin et al. (2017) - New fossils from Jebel Irhoud, Morocco',
          url: 'https://doi.org/10.1038/nature22336',
          note: 'Excavation and thermoluminescence dating of 300 ka modern human ancestors.',
        },
        {
          name: 'Vidal et al. (2022) - Age of the oldest Homo sapiens from eastern Africa',
          url: 'https://doi.org/10.1038/s41586-021-04275-8',
          note: 'Tephrostratigraphic redating of Omo I to at least 233 ka.',
        },
      ],
    },
  },
  {
    id: 'out-africa',
    name: 'Beyond the familiar',
    region: 'Africa → Southwest Asia',
    start: 0.075,
    end: 0.05,
    focus: [22, 48],
    routes: ['levant', 'arabia', 'india'],
    insight:
      'Watch the connections branch. These are broad dispersal hypotheses; people moved more than once, in more than one direction.',
    evidence: {
      subtitle: 'Dispersal across the Red Sea and Southwest Asia',
      lead:
        'While early pioneering pulses ventured into the Levant by 180,000 years ago (Misliya Cave) and 100,000 years ago (Qafzeh/Skhul), genetic data shows that nearly all contemporary non-African ancestry descends from a major, sustained expansion that occurred between 70,000 and 50,000 years ago across Southwest Asia and southern coastal Arabia.',
      significance:
        'Established the permanent geographic presence of modern humans outside of Africa and facilitated the primary pulse of interbreeding with Neanderthals in western Asia prior to the divergence of European and Asian lineages.',
      uncertainty:
        'The relative demographic contribution of the Northern Route (across the Sinai Isthmus into the Levant) versus the Southern Route (across the narrow Bab-el-Mandeb Strait along the Arabian coastline) remains actively debated among archaeologists and geneticists.',
      environment:
        'Marine Isotope Stage 4 (MIS 4) glacial cooling dropped global sea levels, shrinking the Bab-el-Mandeb crossing to less than 5–10 km and converting the modern Persian Gulf into a fertile freshwater river basin known as the "Gulf Oasis".',
      genetics:
        'Whole-genome analyses from the 45,000-year-old Ust\'-Ishim Siberian human prove that the shared pulse of Neanderthal admixture occurred between 55,000 and 50,000 years ago, leaving ~1.5–2.5% Neanderthal DNA in all non-African populations.',
      technology:
        'Initial Upper Paleolithic (IUP) volumetric blade cores, specialized coastal shellfish exploitation, transportable ostrich eggshell water containers, and expanding regional trade networks.',
      sites: [
        {
          name: 'Manot Cave',
          date: '~55,000 years ago',
          location: 'Western Galilee, Israel',
          details:
            'A partial skull cap demonstrating clear anatomical affinities to both modern African and early European Upper Paleolithic humans, situated squarely in the geographic zone and time window of Neanderthal coexistence.',
        },
        {
          name: 'Jebel Faya (FAY-NE1)',
          date: '~125,000–60,000 years ago',
          location: 'Sharjah, United Arab Emirates',
          details:
            'Stratified Paleolithic stone tool industries in southern Arabia showing technology related to East African Middle Stone Age assemblages, documenting periodic crossings of the southern Red Sea.',
        },
        {
          name: 'Skhul & Qafzeh Caves',
          date: '~120,000–90,000 years ago',
          location: 'Mount Carmel & Nazareth, Israel',
          details:
            'Early anatomically modern human skeletons accompanied by intentional burials, red ochre processing, and perforations in marine Glycymeris clam shells for body adornment.',
        },
        {
          name: 'Mundafan & Al Wusta',
          date: '~85,000–80,000 years ago',
          location: 'Nafud & Rub\' al Khali Deserts, Saudi Arabia',
          details:
            'Fossilized human finger bone and Middle Paleolithic hunting sites situated on ancient freshwater lake margins, confirming a habitable "Green Arabia" corridor during humid climate pulses.',
        },
      ],
      sources: [
        {
          name: 'Hershkovitz et al. (2015) - Levantine cranium from Manot Cave',
          url: 'https://doi.org/10.1038/nature14134',
          note: 'Direct fossil evidence of 55 ka modern human presence in the Levant.',
        },
        {
          name: 'Armitage et al. (2011) - The Southern Route "Out of Africa"',
          url: 'https://doi.org/10.1126/science.1199211',
          note: 'Paleoenvironmental and archaeological evidence at Jebel Faya, UAE.',
        },
        {
          name: 'Fu et al. (2014) - Genome sequence of a 45,000-year-old modern human',
          url: 'https://doi.org/10.1038/nature13810',
          note: 'Ust\'-Ishim genome constraining Neanderthal admixture timing.',
        },
      ],
    },
  },
  {
    id: 'sahul',
    name: 'Across the water',
    region: 'Southeast Asia → Sahul',
    start: 0.065,
    end: 0.05,
    focus: [-5, 119],
    routes: ['sunda', 'sahul'],
    insight:
      'Lower seas joined Australia and New Guinea. They never eliminated every sea crossing between Southeast Asia and Sahul.',
    evidence: {
      subtitle: 'Maritime Seafaring into Sunda, Wallacea, and Sahul',
      lead:
        'During Pleistocene glacial stages, global sea level dropped by up to 120 meters, exposing the continental shelves of Sundaland (connecting modern Malaysia, Sumatra, Java, and Borneo) and Sahul (joining Australia, New Guinea, and Tasmania). However, the deep ocean trenches of Wallacea were NEVER bridged by land. Reaching Sahul required a minimum of 8 to 10 sequential open-ocean crossings, representing the earliest verified deep-water seafaring in human history.',
      significance:
        'Demonstrates that 65,000–50,000 years ago, Homo sapiens possessed the technological capacity, cooperative social coordination, and navigational skill to construct ocean-going watercraft and explore beyond visual horizons.',
      uncertainty:
        'The exact route taken remains under debate: a Northern Route through Sulawesi and the northern Maluku islands to West Papua, or a Southern Route stepping through Java, Flores, and Timor to the exposed northwestern Sahul shelf.',
      environment:
        'Glacial lowstands created expansive coastal mangrove corridors and exposed the vast, arid Arafura plain. However, open oceanic straits spanning 70–90 kilometers across Wallacea (e.g. Weber Deep >7,000 m depth) required true pelagic navigation.',
      genetics:
        'Indigenous Australian and Papuan genomes contain 4–6% archaic Denisovan ancestry, acquired through an ancient admixture event with an eastern Denisovan population that was distinct from the Siberian Altai Denisovans.',
      technology:
        'Ocean-going bamboo and lashed-timber rafts, ground-edge stone axe manufacturing (the world\'s oldest examples), systematic fire-stick farming to reshape terrestrial ecosystems, and mineral pigment chemistry.',
      sites: [
        {
          name: 'Madjedbebe Rock Shelter',
          date: '~65,000 years ago',
          location: 'Arnhem Land, Northern Territory, Australia',
          details:
            'Extensive stratified deposits dated by optically stimulated luminescence (OSL); unearthed ground-edge stone axes, reflective ground mica pigments, hearths, and grinding stones.',
        },
        {
          name: 'Lake Mungo (Willandra Lakes)',
          date: '~42,000–40,000 years ago',
          location: 'New South Wales, Australia',
          details:
            'The site of Mungo Man (the oldest known ritual burial sprinkled with red ochre) and Mungo Lady (the world\'s earliest recorded human cremation ritual).',
        },
        {
          name: 'Leang Bulu\' Sipong 4',
          date: '~45,500 years ago',
          location: 'Maros-Pangkep, Sulawesi, Indonesia',
          details:
            'The world\'s oldest known figurative rock art scene, depicting part-human, part-animal figures (therianthropes) hunting endemic Sulawesi warty pigs and dwarf anoa with ropes and spears.',
        },
        {
          name: 'Carpenter\'s Gap & Riwi',
          date: '~48,000–45,000 years ago',
          location: 'Kimberley, Western Australia',
          details:
            'Revealed ground-edge axe fragments with ochre residues, bone points, and marine Dentalium shell beads transported hundreds of kilometers inland.',
        },
        {
          name: 'Ivane Valley',
          date: '~49,000 years ago',
          location: 'Owen Stanley Range, Papua New Guinea',
          details:
            'High-altitude alpine rainforest occupation at 2,000 meters elevation, proving rapid human adaptation to montane environments with exploitation of pandanus nuts and yams.',
        },
      ],
      sources: [
        {
          name: 'Clarkson et al. (2017) - Human occupation of northern Australia by 65,000 years ago',
          url: 'https://doi.org/10.1038/nature22968',
          note: 'Excavation and comprehensive OSL chronology of Madjedbebe.',
        },
        {
          name: 'Brumm et al. (2021) - Oldest cave art found in Sulawesi',
          url: 'https://doi.org/10.1126/sciadv.abd4648',
          note: 'Uranium-series dating of figurative paintings in Wallacea.',
        },
        {
          name: 'O\'Connell et al. (2018) - When did Homo sapiens first reach Southeast Asia and Sahul?',
          url: 'https://doi.org/10.1073/pnas.1808385115',
          note: 'Critical debate on 65 ka vs 50 ka colonization models.',
        },
      ],
    },
  },
  {
    id: 'europe',
    name: 'A world of encounters',
    region: 'Europe & Asia',
    start: 0.06,
    end: 0.04,
    focus: [42, 65],
    routes: ['europe', 'asia'],
    insight:
      'This was a shared human world. Neanderthals and Denisovan-related populations contributed ancestry to later Homo sapiens populations.',
    evidence: {
      subtitle: 'Coexistence, Admixture, and Upper Paleolithic Art in Eurasia',
      lead:
        'Between 50,000 and 40,000 years ago, Homo sapiens expanded into western Eurasia, entering landscapes occupied for hundreds of millennia by Neanderthals in the west and Denisovans in the east. Ancient genomics has revolutionized this picture: rather than a rapid, violent replacement, modern humans coexisted, traded, and interbred with archaic humans across multiple overlapping ecological zones.',
      significance:
        'Witnessed the explosion of Upper Paleolithic symbolic culture (cave masterworks, musical instruments, figurative sculpture, tailored cold-climate clothing) and established the Neanderthal and Denisovan genetic legacy in living humans.',
      uncertainty:
        'The relative roles of severe climatic disruption (Heinrich Event 4 cold snap and the 39,000-year-old Campanian Ignimbrite supervolcanic eruption in Italy) versus demographic swamping in the final disappearance of Neanderthals as a distinct population.',
      environment:
        'The immense "Mammoth Steppe" biome: cold, windswept grasslands supporting massive herds of woolly mammoths, woolly rhinos, steppe bison, and wild horses, subject to abrupt Dansgaard-Oeschger millennial warming and cooling cycles.',
      genetics:
        'Genomes from early European modern humans (Bacho Kiro, Oase, Zlatý kůň) show substantial Neanderthal DNA in very long unbroken chromosome segments (up to 3–6%), proving interbreeding was frequent and ongoing in Europe just generations before fossilization.',
      technology:
        'Aurignacian and Gravettian lithic blade industries, split-base bone projectile points, eyed bone needles for multi-layered tailored fur garments, ivory carving, and aerodynamically balanced spear-throwers (atlatls).',
      sites: [
        {
          name: 'Bacho Kiro Cave',
          date: '~45,000 years ago',
          location: 'Dryanovo, Bulgaria',
          details:
            'Directly dated Initial Upper Paleolithic modern human bones; ancient DNA revealed individuals with recent Neanderthal ancestors just 5 to 7 generations back in their family trees, alongside pierced cave bear tooth pendants.',
        },
        {
          name: 'Denisova Cave',
          date: '~50,000–40,000 years ago',
          location: 'Altai Mountains, Siberia',
          details:
            'A legendary geological archive containing remains of Neanderthals, Denisovans, and modern humans, as well as "Denny" (Denisova 11)—the first-generation hybrid daughter of a Neanderthal mother and a Denisovan father.',
        },
        {
          name: 'Zlatý kůň',
          date: '~45,000 years ago',
          location: 'Bohemia, Czech Republic',
          details:
            'A female skull that represents one of the oldest directly sequenced modern human genomes in Europe, carrying unbroken Neanderthal tracts from a population that split before the divergence of Europeans and Asians.',
        },
        {
          name: 'Chauvet Cave',
          date: '~36,000 years ago',
          location: 'Ardèche, France',
          details:
            'Over 400 extraordinary charcoal and ochre paintings portraying deep artistic mastery: perspective, shading, and dynamic motion of woolly rhinos, cave lions, mammoths, and horses.',
        },
        {
          name: 'Hohlenstein-Stadel & Hohle Fels',
          date: '~40,000 years ago',
          location: 'Swabian Jura, Germany',
          details:
            'Home to the iconic "Lion Man" (Löwenmensch) carved from mammoth ivory—the oldest known anthropomorphic zoomorphic sculpture—and bird-bone musical flutes showing early musical and abstract thinking.',
        },
      ],
      sources: [
        {
          name: 'Hublin et al. (2020) - Initial Upper Palaeolithic Homo sapiens from Bacho Kiro',
          url: 'https://doi.org/10.1038/s41586-020-2259-z',
          note: 'Earliest Upper Paleolithic modern humans in Europe with aDNA.',
        },
        {
          name: 'Slon et al. (2018) - The genome of the offspring of a Neanderthal mother and Denisovan father',
          url: 'https://doi.org/10.1038/s41586-018-0455-0',
          note: 'Direct genetic confirmation of first-generation hominin interbreeding.',
        },
        {
          name: 'Higham et al. (2014) - The timing and spatiotemporal patterning of Neanderthal disappearance',
          url: 'https://doi.org/10.1038/nature13621',
          note: 'Continental Bayesian radiocarbon chronology of the Neanderthal transition.',
        },
      ],
    },
  },
  {
    id: 'americas',
    name: 'New horizons',
    region: 'Beringia → the Americas',
    start: 0.032,
    end: 0.0145,
    focus: [55, -165],
    routes: ['siberia', 'beringia', 'america', 'south-america'],
    insight:
      'Evidence of presence and evidence of a route are different. White Sands footprints do not establish the precise path taken into the Americas.',
    evidence: {
      subtitle: 'The Peopling of the Americas Across Beringia and the Pacific Coast',
      lead:
        'The settlement of the Western Hemisphere has experienced a major paradigm shift. For decades, the "Clovis First" model (~13,000 years ago via an inland ice-free corridor) was orthodox. Today, unequivocal empirical discoveries—most notably the 21,000–23,000-year-old human footprint trackways at White Sands, New Mexico—confirm that humans were flourishing in North America during the Last Glacial Maximum (LGM), long before interior deglaciation.',
      significance:
        'Demonstrates human resilience during extreme glacial conditions and elevates the Pacific Coastal Route ("Kelp Highway") hypothesis as the primary early pathway for entry into South America.',
      uncertainty:
        'The exact coastal route taken into South America is obscured by post-glacial sea level rise, which drowned ancient paleocoastlines under 100+ meters of ocean. The genetic relationship between pre-LGM populations and later Indigenous Native American lineages remains under active study.',
      environment:
        'During the LGM (26,000–19,000 years ago), the Cordilleran and Laurentide ice sheets coalesced into a 3,000-meter-thick continuous continental barrier. However, Beringia remained largely unglaciated steppe-tundra, and the Pacific coastline offered rich kelp forest ecosystems with seals, fish, and shellfish.',
      genetics:
        'Ancient DNA confirms the "Beringian Standstill" model: an ancestral population was genetically isolated in Beringia for several millennia (~25,000–15,000 years ago) before expanding southward and diverging into Northern Native American (NNA) and Southern Native American (SNA) branches.',
      technology:
        'Watercraft adapted to sub-Arctic littoral voyaging, microblade core technology, stemmed and bifacial projectile points, bone and antler needles for watertight skin garments, and specialized megafauna butchery tools.',
      sites: [
        {
          name: 'White Sands National Park',
          date: '~23,000–21,000 years ago',
          location: 'New Mexico, United States',
          details:
            'Multiple deeply stratified human footprint tracks pressed into ancient lakebed mud alongside mammoth and giant ground sloth tracks; verified in 2023 by independent radiocarbon dating of terrestrial conifer pollen and quartz OSL.',
        },
        {
          name: 'Monte Verde',
          date: '~14,500–18,500 years ago',
          location: 'Los Lagos, Southern Chile',
          details:
            'Remarkably preserved waterlogged settlement containing timber hut foundations, hearths, mastodon meat tissue, and nine species of medicinal coastal marine seaweeds, definitively pre-dating the Clovis horizon.',
        },
        {
          name: 'Cooper\'s Ferry',
          date: '~16,000 years ago',
          location: 'Salmon River, Idaho, United States',
          details:
            'Stemmed projectile points and pit features along the Columbia River basin sharing striking technical affinities with Upper Paleolithic stone tools from Hokkaido, Japan (Tachikawa culture).',
        },
        {
          name: 'Bluefish Caves',
          date: '~24,000 years ago',
          location: 'Yukon Territory, Canada',
          details:
            'Horse, bison, and mammoth bones bearing microscopic stone-tool butchery cutmarks, providing early stratigraphic support for human presence during the Beringian Standstill.',
        },
        {
          name: 'Paisley Caves',
          date: '~14,300 years ago',
          location: 'Summer Lake Basin, Oregon, United States',
          details:
            'Western Stemmed stone tools and desiccated human coprolites yielding modern human mitochondrial DNA (haplogroups A2 and B2) with no connection to Clovis fluted point technology.',
        },
      ],
      sources: [
        {
          name: 'Bennett et al. (2021) - Evidence of humans in North America during the Last Glacial Maximum',
          url: 'https://doi.org/10.1126/science.abg7586',
          note: 'Initial discovery and radiocarbon dating of White Sands footprints.',
        },
        {
          name: 'Pigati et al. (2023) - Independent age estimates resolve the controversy of ancient footprints at White Sands',
          url: 'https://doi.org/10.1126/science.adh5007',
          note: 'Pollen and OSL validation confirming 21–23 ka antiquity.',
        },
        {
          name: 'Dillehay et al. (2015) - New archaeological evidence for an early human presence at Monte Verde, Chile',
          url: 'https://doi.org/10.1371/journal.pone.0141923',
          note: 'Deep stratigraphic excavations and dating at Monte Verde.',
        },
      ],
    },
  },
  {
    id: 'pacific',
    name: 'An ocean of possibility',
    region: 'Remote Oceania',
    start: 0.0033,
    end: 0.0008,
    focus: [-15, -175],
    routes: ['pacific-west', 'pacific-east'],
    insight:
      'The last chapter unfolds across water. Different islands were settled at different times; these lines connect regions, not individual voyages.',
    evidence: {
      subtitle: 'The Settlement of Remote Oceania and the Polynesian Triangle',
      lead:
        'The colonization of Remote Oceania represents the final and geographically vastest migration in human history. Starting roughly 3,300 years ago with the seafaring Lapita culture expanding from Island Southeast Asia into Melanesia, Fiji, Tonga, and Samoa, voyagers traversed thousands of miles of open Pacific Ocean without metal tools or compasses, culminating in the settlement of Hawaii, Rapa Nui, and New Zealand.',
      significance:
        'Represents the zenith of non-instrumental pelagic wayfinding and maritime technology, successfully establishing complex, self-sustaining societies across the largest ocean on Earth.',
      uncertainty:
        'The causes of the "Long Pause" (a ~1,500-year hiatus between the initial settlement of Western Polynesia around 900 BCE and the sudden expansion into Eastern Polynesia around 1000 CE), whether driven by shifting wind patterns during El Niño cycles or the development of larger double-hulled catamarans.',
      environment:
        'Vast expanses of open Pacific waters subject to shifting trade winds and equatorial doldrums; isolated volcanic high islands and low coral atolls devoid of terrestrial mammals (except bats), requiring the intentional transportation of entire agricultural ecosystems.',
      genetics:
        'Genomic evidence shows Austronesian-speaking seafaring populations admixed with Indigenous Papuans before voyaging east. Recent ancient DNA studies confirm prehistoric Polynesian voyagers reached the coast of South America, introducing the sweet potato (Ipomoea batatas) and exchanging genes with Indigenous South Americans.',
      technology:
        'Double-hulled voyaging canoes (wa\'a kaulua / waka hourua) equipped with oceanic crab-claw sails; non-instrumental wayfinding navigating by star paths (zenith stars), ocean swell interference patterns, cloud lore, and migratory bird flight routes; transport of domesticated taro, yams, pigs, and dogs.',
      sites: [
        {
          name: 'Teouma Cemetery',
          date: '~3,000 years ago',
          location: 'Efate Island, Vanuatu',
          details:
            'Oldest known major cemetery of the Lapita culture; revealed burials with missing skulls placed in secondary ritual pots, diagnostic dentate-stamped earthenware, and cone shell jewelry.',
        },
        {
          name: 'Sigatoka Sand Dunes & Lapita Type Site',
          date: '~3,100–2,900 years ago',
          location: 'Fiji & New Caledonia',
          details:
            'Type-sites yielding thousands of sherds of intricate dentate-stamped Lapita ceramics with anthropomorphic face motifs and imported Talasea obsidian from the Bismarck Archipelago.',
        },
        {
          name: 'Wairau Bar',
          date: '~1280–1300 CE',
          location: 'Marlborough, South Island, New Zealand (Aotearoa)',
          details:
            'The founding settlement of Māori culture in New Zealand; burials containing massive moa-egg water canteens, pearl-shell lures, and adzes matching stone quarries in the Society Islands.',
        },
        {
          name: 'Fa\'ahia & Huahine',
          date: '~1000–1150 CE',
          location: 'Society Islands, French Polynesia',
          details:
            'Waterlogged archaeological deposits that preserved intact structural timbers, steering oars, and outrigger canoe components used in long-distance East Polynesian voyaging.',
        },
        {
          name: 'Anakena & Rano Raraku (Rapa Nui)',
          date: '~1200 CE',
          location: 'Easter Island, Southeast Pacific',
          details:
            'Initial landing site and megalithic quarries where Polynesian master stonemasons carved hundreds of colossal stone moai statues and monumental stone ahu platforms.',
        },
      ],
      sources: [
        {
          name: 'Kirch, P.V. (2000) - On the Road of the Winds: An Archaeological History of the Pacific Islands',
          url: 'https://www.ucpress.edu/book/9780520223462/on-the-road-of-the-winds',
          note: 'Authoritative archaeological synthesis of Pacific migrations.',
        },
        {
          name: 'Ioannidis et al. (2020) - Native American gene flow into Polynesia pre-dates Easter Island settlement',
          url: 'https://doi.org/10.1038/s41586-020-2487-2',
          note: 'Genomic proof of prehistoric contact between Polynesians and South Americans.',
        },
        {
          name: 'Wilmshurst et al. (2011) - High-precision radiocarbon dating shows recent and rapid expansion into East Polynesia',
          url: 'https://doi.org/10.1073/pnas.1015876108',
          note: 'Bayesian radiocarbon recalibration dating New Zealand to ~1280 CE.',
        },
      ],
    },
  },
];
