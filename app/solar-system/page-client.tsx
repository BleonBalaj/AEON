'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Orbit,
  Globe2,
  Users,
  Compass,
  BookOpen,
  Search,
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Play,
  Pause,
  SlidersHorizontal,
  Info,
  Layers3,
  Thermometer,
  Weight,
  CircleDot,
  RotateCw,
  Sun,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import SolarViewer, { SolarViewerApi, SolarLayers, SolarViewMode } from '@/components/solar-viewer';
import { solarBodies, CelestialBody } from '@/lib/solar-system/planets';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const baseLayers: SolarLayers = {
  orbits: true,
  clouds: true,
  tilt: true,
  rings: true,
  night: true,
  revolution: true,
};

export default function SolarSystemClient() {
  const [index, setIndex] = useState(3); // Start at Earth (index 3)
  const [viewMode, setViewMode] = useState<SolarViewMode>('system'); // Start in full Solar System mode
  const [layers, setLayers] = useState<SolarLayers>(baseLayers);
  const [playing, setPlaying] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [speed, setSpeed] = useState<'Cinematic' | 'Normal' | 'Fast'>('Normal');
  const [status, setStatus] = useState('');
  const [full, setFull] = useState(false);

  const [dossierOpen, setDossierOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shrinkingFromAtlas, setShrinkingFromAtlas] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const last = sessionStorage.getItem('aeon_last_nav');
      if (last === 'earth' || last === 'odyssey' || !last) {
        setShrinkingFromAtlas(true);
        const t = setTimeout(() => setShrinkingFromAtlas(false), 900);
        return () => clearTimeout(t);
      }
    }
    sessionStorage.setItem('aeon_last_nav', 'solar');
  }, []);

  const body = solarBodies[index];
  const apiRef = useRef<SolarViewerApi | null>(null);

  const speedMultiplier = speed === 'Fast' ? 2.2 : speed === 'Cinematic' ? 0.35 : 1.0;

  const onViewerReady = useCallback((api: SolarViewerApi) => {
    apiRef.current = api;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'Escape') {
        setViewMode('system');
        apiRef.current?.reset();
      } else if (e.key === 'ArrowRight') {
        setIndex((i) => (i + 1) % solarBodies.length);
        setViewMode('planet');
      } else if (e.key === 'ArrowLeft') {
        setIndex((i) => (i - 1 + solarBodies.length) % solarBodies.length);
        setViewMode('planet');
      } else if (e.key === '+' || e.key === '=') {
        apiRef.current?.zoom(0.85);
      } else if (e.key === '-' || e.key === '_') {
        apiRef.current?.zoom(1.15);
      } else if (e.key === 's' || e.key === 'S') {
        setViewMode((v) => (v === 'system' ? 'planet' : 'system'));
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-tour playback timer
  useEffect(() => {
    if (!playing) return;
    const intervalMs = speed === 'Fast' ? 4000 : speed === 'Cinematic' ? 12000 : 7000;
    const t = setInterval(() => {
      setViewMode('planet');
      setIndex((curr) => (curr + 1) % solarBodies.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [playing, speed]);

  const words = body.name.split(' ');
  const titleTop = words.length > 1 ? words.slice(0, -1).join(' ') : words[0];
  const titleBottom = words.length > 1 ? words[words.length - 1] : '';

  return (
    <main className="atlas exploring solar-page">
      <a className="skip-link" href="#time-control">
        Skip to planet navigation
      </a>
      <div className="chamber">
        {/* Unified Topbar Header */}
        <header className="topbar">
          <Link className="brand" href="/" aria-label="AEON home">
            <Orbit size={30} />
            <span>AEON</span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/">
              <Globe2 size={15} />
              Explore Earth
            </Link>
            <Link href="/human-odyssey">
              <Users size={15} />
              Human Odyssey
            </Link>
            <Link href="/solar-system" className="active" aria-current="page">
              <Compass size={15} />
              Solar System
            </Link>
            <button onClick={() => setDossierOpen(true)}>
              <BookOpen size={15} />
              Planetary Dossier
            </button>
            <button onClick={() => setAboutOpen(true)}>
              <Info size={15} />
              About the atlas
            </button>
          </nav>
          <button
            className="search-button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search celestial bodies"
          >
            <Search size={17} />
            <span>Search planets</span>
            <kbd>⌘ K</kbd>
          </button>
        </header>

        {/* Primary Interactive 3D Workspace */}
        <section className="workspace" aria-label="Solar system planet visualization">
          <SolarViewer
            selectedBodyId={body.id}
            viewMode={viewMode}
            layers={layers}
            autoRotate={autoRotate}
            speedMultiplier={speedMultiplier}
            onSelectBody={(id) => {
              const foundIdx = solarBodies.findIndex((b) => b.id === id);
              if (foundIdx !== -1) {
                setIndex(foundIdx);
                setViewMode('planet');
              }
            }}
            onViewModeChange={setViewMode}
            onReady={onViewerReady}
            onStatus={setStatus}
          />

          {/* Left Intro Card */}
          <div className="intro">
            <div className="eyebrow">
              <span className="live-dot" style={{ background: viewMode === 'system' ? '#38bdf8' : body.accentColor }} />
              {viewMode === 'system'
                ? 'OUR COSMIC HOME · 8 PLANETS · 1 STAR'
                : `CELESTIAL BODY ${String(body.orderFromSun + 1).padStart(2, '0')} / 10 · ${body.classification.toUpperCase()}`}
            </div>
            <h1>
              {viewMode === 'system' ? (
                <>
                  The Solar
                  <br />
                  <em>System</em>
                </>
              ) : titleBottom ? (
                <>
                  {titleTop}
                  <br />
                  <em>{titleBottom}</em>
                </>
              ) : (
                <em>{body.name}</em>
              )}
            </h1>
            <p>
              {viewMode === 'system'
                ? 'A gravitationally bound heliocentric system in the Milky Way Orion Arm. Spanning the radiant Sun, 4 inner terrestrial worlds, the asteroid belt, 4 majestic gas and ice giants, and the deep-freeze worlds of the Kuiper Belt.'
                : body.summary}
            </p>

            <button
              className="solar-mode-switch"
              onClick={() => {
                if (viewMode === 'system') {
                  setViewMode('planet');
                } else {
                  setViewMode('system');
                }
              }}
            >
              {viewMode === 'system' ? <Compass size={14} /> : <Orbit size={14} />}
              <span>{viewMode === 'system' ? `Inspect ${body.name} Close-up` : 'View Entire Solar System'}</span>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', marginTop: '12px' }}>
              {viewMode !== 'system' ? (
                <>
                  <button
                    className="text-link"
                    onClick={() => setDossierOpen(true)}
                    style={{ color: '#38bdf8', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Info size={14} /> {body.id === 'sun' ? 'View Star Info' : 'View Planet Info'}
                  </button>
                  <button
                    className="text-link"
                    onClick={() => {
                      setIndex((i) => (i + 1) % solarBodies.length);
                      setViewMode('planet');
                    }}
                    style={{ color: '#9cbdb0', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    Journey to next world <ChevronRight size={14} />
                  </button>
                </>
              ) : (
                <button
                  className="text-link"
                  onClick={() => {
                    setIndex(3);
                    setViewMode('planet');
                  }}
                  style={{ color: '#9cbdb0', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  Inspect Earth (Home World) <ChevronRight size={14} />
                </button>
              )}
            </div>
            <div className="intro-foot">
              {viewMode === 'system'
                ? 'DIAMETER: ~100,000 AU TO OORT CLOUD · AGE: 4.57 GA'
                : `DISTANCE: ${body.distanceAU} AU · ORBIT: ${body.orbitalPeriodDisplay.toUpperCase()}`}
            </div>
          </div>

          {/* Bottom Globe Caption */}
          <div className="globe-caption">
            <span className="live-dot" style={{ background: viewMode === 'system' ? '#38bdf8' : body.accentColor }} />
            {viewMode === 'system'
              ? 'THE SOLAR SYSTEM · HELIOCENTRIC ORRERY · 39.5 AU SPAN'
              : `${body.name.toUpperCase()} · ${body.classification.toUpperCase()} · ${body.distanceKm}`}
            <span className="caption-sub">
              {status || (viewMode === 'system'
                ? 'Click any planet in 3D to zoom in · Drag to rotate orrery · Scroll to zoom'
                : 'Drag to inspect surface · Scroll to zoom · Press S for full system')}
            </span>
          </div>

          {/* Right Context Sidebar */}
          <aside className="context">
            <div className="context-heading">
              <span className="eyebrow">{viewMode === 'system' ? 'SYSTEM AT A GLANCE' : 'PLANET AT A GLANCE'}</span>
              <button
                aria-label="About this view"
                onClick={() => setDossierOpen(true)}
              >
                <Info size={14} />
              </button>
            </div>

            {viewMode === 'system' ? (
              <div className="planet-facts">
                <div>
                  <Sun size={15} />
                  <span>
                    Central Star
                    <strong>The Sun (G2V Yellow Dwarf)</strong>
                  </span>
                </div>
                <div>
                  <CircleDot size={15} />
                  <span>
                    Inner Worlds
                    <strong>Mercury, Venus, Earth, Mars</strong>
                  </span>
                </div>
                <div>
                  <Orbit size={15} />
                  <span>
                    Outer Giants
                    <strong>Jupiter, Saturn, Uranus, Neptune</strong>
                  </span>
                </div>
                <div>
                  <Sparkles size={15} />
                  <span>
                    Planetary Moons
                    <strong>290+ Confirmed Natural Satellites</strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="planet-facts">
                <div>
                  <CircleDot size={15} />
                  <span>
                    Equatorial Radius
                    <strong>{(body.radiusKm * 2).toLocaleString()} km ({body.radiusEarthRatio}× Earth)</strong>
                  </span>
                </div>
                <div>
                  <Weight size={15} />
                  <span>
                    Surface Gravity
                    <strong>{body.surfaceGravity}</strong>
                  </span>
                </div>
                <div>
                  <Thermometer size={15} />
                  <span>
                    Surface Temperature
                    <strong>{body.temperature.mean}</strong>
                  </span>
                </div>
                <div>
                  <RotateCw size={15} />
                  <span>
                    Sidereal Day
                    <strong>{body.rotationPeriodDisplay}</strong>
                  </span>
                </div>
                <div>
                  <Sparkles size={15} />
                  <span>
                    Confirmed Moons
                    <strong>{body.moonsCount} {body.notableMoons.length > 0 ? `(${body.notableMoons.slice(0, 2).join(', ')})` : ''}</strong>
                  </span>
                </div>
              </div>
            )}

            <hr />

            <div className="context-heading">
              <span className="eyebrow">OBSERVATORY LAYERS</span>
              <button onClick={() => setDossierOpen(true)} aria-label="More layers">
                <SlidersHorizontal size={14} />
              </button>
            </div>

            <label className="layer-row" style={{ cursor: 'pointer' }}>
              <span>Planetary Orbits</span>
              <Switch
                checked={Boolean(layers.orbits)}
                onCheckedChange={(c) => setLayers((l) => ({ ...l, orbits: Boolean(c) }))}
              />
            </label>

            <label className="layer-row" style={{ cursor: 'pointer' }}>
              <span>Orbital Motion</span>
              <Switch
                checked={Boolean(layers.revolution)}
                onCheckedChange={(c) => setLayers((l) => ({ ...l, revolution: Boolean(c) }))}
              />
            </label>

            <label className="layer-row" style={{ cursor: 'pointer' }}>
              <span>Atmosphere & Clouds</span>
              <Switch
                checked={Boolean(layers.clouds)}
                onCheckedChange={(c) => setLayers((l) => ({ ...l, clouds: Boolean(c) }))}
              />
            </label>

            <label className="layer-row" style={{ cursor: 'pointer' }}>
              <span>Planetary Rings</span>
              <Switch
                checked={Boolean(layers.rings)}
                onCheckedChange={(c) => setLayers((l) => ({ ...l, rings: Boolean(c) }))}
              />
            </label>

            <label className="layer-row" style={{ cursor: 'pointer' }}>
              <span>True Axial Tilts</span>
              <Switch
                checked={Boolean(layers.tilt)}
                onCheckedChange={(c) => setLayers((l) => ({ ...l, tilt: Boolean(c) }))}
              />
            </label>
          </aside>

          {/* 3D View Toolbar */}
          <div className="view-toolbar" aria-label="View controls">
            <button aria-label="Zoom in" title="Zoom in (+)" onClick={() => apiRef.current?.zoom(0.85)}>
              <Plus size={18} />
            </button>
            <button aria-label="Zoom out" title="Zoom out (-)" onClick={() => apiRef.current?.zoom(1.15)}>
              <Minus size={18} />
            </button>
            <span />
            <button
              aria-label="Reset view to full solar system"
              title="Reset view to full solar system (R / Esc)"
              onClick={() => {
                setViewMode('system');
                apiRef.current?.reset();
              }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              aria-label={viewMode === 'system' ? 'Inspect current planet' : 'View entire solar system (S)'}
              title={viewMode === 'system' ? 'Inspect current planet' : 'View entire solar system (S)'}
              className={viewMode === 'system' ? 'on' : ''}
              onClick={() => setViewMode((v) => (v === 'system' ? 'planet' : 'system'))}
            >
              <Orbit size={17} />
            </button>
            <button
              aria-label={full ? 'Exit full screen' : 'Full screen'}
              title="Full screen"
              onClick={async () => {
                if (document.fullscreenElement) {
                  await document.exitFullscreen();
                  setFull(false);
                } else {
                  await document.documentElement.requestFullscreen();
                  setFull(true);
                }
              }}
            >
              <Maximize2 size={16} />
            </button>
          </div>


        </section>

        {/* Bottom Navigation Console */}
        <section
          className={`time-panel ${shrinkingFromAtlas ? 'glass-morph-shrink' : ''}`}
          id="time-control"
          aria-label="Solar system planet navigation"
        >
          <svg
            className="console-shell"
            viewBox="0 0 1200 220"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="console-glass" x2="0" y2="1">
                <stop stopColor="#a5b8b8" stopOpacity=".09" />
                <stop offset=".45" stopColor="#071012" stopOpacity=".78" />
                <stop offset="1" stopColor="#101716" stopOpacity=".5" />
              </linearGradient>
              <linearGradient id="console-rim">
                <stop stopColor="#667a7d" stopOpacity=".1" />
                <stop offset=".3" stopColor="#c4d6d8" stopOpacity=".7" />
                <stop offset=".5" stopColor="#f0dfb9" />
                <stop offset=".7" stopColor="#c4d6d8" stopOpacity=".7" />
                <stop offset="1" stopColor="#667a7d" stopOpacity=".1" />
              </linearGradient>
            </defs>
            <path
              d="M 0 40 Q 245 8 475 19 Q 600 -14 725 19 Q 955 8 1200 40 L 1178 211 Q 600 227 22 211 Z"
              fill="url(#console-glass)"
              stroke="#cbd4c02a"
            />
            <path
              d="M 0 40 Q 245 8 475 19 Q 600 -14 725 19 Q 955 8 1200 40"
              fill="none"
              stroke="url(#console-rim)"
              strokeWidth="1.4"
            />
            <path
              d="M 34 213 Q 600 227 1166 213"
              fill="none"
              stroke="url(#console-rim)"
              strokeOpacity=".4"
            />
            <path
              d="M 17 44 Q 245 17 475 25 Q 600 -6 725 25 Q 955 17 1183 44"
              fill="none"
              stroke="url(#console-rim)"
              strokeOpacity=".2"
            />
            <path
              d="M 13 55 L 32 191 M 1187 55 L 1168 191"
              fill="none"
              stroke="#b7dce4"
              strokeOpacity=".18"
              strokeWidth=".7"
            />
          </svg>

          {/* Console Header / Stepper Line */}
          <div className="time-head">
            <div className="date-block">
              <span className="eyebrow">
                {viewMode === 'system' ? 'HELIOCENTRIC ARCHITECTURE' : 'SELECTED CELESTIAL WORLD'}
              </span>
              <strong>{viewMode === 'system' ? 'The Solar System' : body.name}</strong>
              <span className="epoch-line">
                {viewMode === 'system' ? 'Complete 8-Planet Planetary Orrery' : body.subtitle}
              </span>
            </div>

            <div className="timeline-actions">
              <div className="play-controls">
                <button
                  className="step-button"
                  onClick={() => {
                    setViewMode('planet');
                    setIndex((i) => (i - 1 + solarBodies.length) % solarBodies.length);
                  }}
                  title="Previous planet (Left Arrow)"
                  aria-label="Previous planet"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className="play-button"
                  onClick={() => setPlaying((p) => !p)}
                  title={playing ? 'Pause tour (Space)' : 'Play planetary tour (Space)'}
                  aria-label={playing ? 'Pause tour' : 'Play tour'}
                >
                  {playing ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <button
                  className="step-button"
                  onClick={() => {
                    setViewMode('planet');
                    setIndex((i) => (i + 1) % solarBodies.length);
                  }}
                  title="Next planet (Right Arrow)"
                  aria-label="Next planet"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  className="speed-select"
                  onClick={() => {
                    const next = speed === 'Cinematic' ? 'Normal' : speed === 'Normal' ? 'Fast' : 'Cinematic';
                    setSpeed(next);
                  }}
                  title="Change tour transition speed"
                >
                  {speed}
                </button>
              </div>
            </div>
          </div>

          {/* Seamless Planetary Ribbon (Integrated into glass console, no boxes) */}
          <div className="solar-strip">
            <button
              className={`solar-strip-btn ${viewMode === 'system' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('system');
                setPlaying(false);
              }}
            >
              Entire System
            </button>
            {solarBodies.map((b, i) => (
              <button
                key={b.id}
                className={`solar-strip-btn ${viewMode === 'planet' && index === i ? 'active' : ''}`}
                onClick={() => {
                  setIndex(i);
                  setViewMode('planet');
                  setPlaying(false);
                }}
              >
                {b.name}
              </button>
            ))}
          </div>

          <div className="timeline-foot" style={{ marginTop: '8px' }}>
            <span>
              Scale: 0.00 AU (Sun) to 39.48 AU (Pluto) · Heliocentric planetary coordinates
            </span>
            <button
              onClick={() => {
                setIndex(3);
                setViewMode('planet');
              }}
            >
              <Globe2 size={13} /> Earth (Home World)
            </button>
          </div>
        </section>

        {/* Detailed NASA Planetary Dossier Sheet */}
        <Sheet open={dossierOpen} onOpenChange={setDossierOpen}>
          <SheetContent side="right" className="atlas-sheet">
            <SheetHeader>
              <div className="eyebrow" style={{ color: body.accentColor }}>
                NASA PLANETARY SCIENCE DOSSIER
              </div>
              <SheetTitle>{body.name}</SheetTitle>
              <SheetDescription>{body.subtitle}</SheetDescription>
            </SheetHeader>

            <div className="sheet-body">
              <h3>Scientific Overview</h3>
              <p>{body.summary}</p>

              <h3>Geology & Internal Structure</h3>
              <p>{body.geology}</p>

              <h3>Atmospheric Profile</h3>
              <p>{body.atmosphere.summary}</p>
              <div style={{ margin: '14px 0', background: '#091518', padding: '12px', borderRadius: '6px', border: '1px solid #ffffff12' }}>
                <strong style={{ fontSize: '12px', color: '#b9d5c5', display: 'block', marginBottom: '8px' }}>
                  Atmospheric Composition:
                </strong>
                {body.atmosphere.gases.map((gas) => (
                  <div key={gas.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '3px 0', color: '#8aa69b' }}>
                    <span>{gas.name}</span>
                    <span style={{ color: '#e5f3ea', fontFamily: 'monospace' }}>{gas.percent}%</span>
                  </div>
                ))}
              </div>

              <h3>Robotic Exploration History</h3>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#9cb5aa', lineHeight: 1.75 }}>
                {body.exploration.map((exp, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{exp}</li>
                ))}
              </ul>

              <h3>Astrobiological Prospects</h3>
              <p>{body.astrobiology}</p>

              <div className="evidence-box" style={{ marginTop: '20px' }}>
                <Sparkles size={18} />
                <div>
                  <h3>Did You Know?</h3>
                  <p>{body.funFact}</p>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  className="primary"
                  onClick={() => setDossierOpen(false)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Return to 3D Observatory
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Search Modal */}
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogContent className="city-picker-dialog">
            <DialogHeader>
              <DialogTitle>Search Solar System</DialogTitle>
              <DialogDescription>
                Search across all 10 planets, moons, and the central star.
              </DialogDescription>
            </DialogHeader>
            <div className="city-search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search planets, moons or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="city-regions-list">
              {solarBodies
                .filter(
                  (b) =>
                    !searchQuery ||
                    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.classification.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.notableMoons.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((b) => (
                  <button
                    key={b.id}
                    className={`city-choice-card ${body.id === b.id ? 'active' : ''}`}
                    onClick={() => {
                      setIndex(solarBodies.findIndex((x) => x.id === b.id));
                      setSearchOpen(false);
                    }}
                  >
                    <div className="city-choice-info">
                      <strong>{b.name}</strong>
                      <span>{b.classification} · {b.distanceAU} AU</span>
                    </div>
                    <ChevronRight size={15} />
                  </button>
                ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* About Dialog with Credits */}
        <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
          <DialogContent className="city-picker-dialog">
            <DialogHeader>
              <DialogTitle>About Solar System Observatory</DialogTitle>
              <DialogDescription>
                An interactive physical planetarium combining NASA/JPL planetary ephemeris, real surface textures, and astrophysics data.
              </DialogDescription>
            </DialogHeader>
            <div style={{ fontSize: '13px', color: '#9cb5aa', lineHeight: 1.8, padding: '10px 0' }}>
              <p>
                Part of the <strong>AEON</strong> living universe. Textures adapted from NASA Jet Propulsion Laboratory, USGS Astrogeology Science Center, and ESA planetary science archives.
              </p>
              <hr style={{ border: 0, borderTop: '1px solid #ffffff14', margin: '14px 0' }} />
              <div style={{ fontSize: '12px', color: '#6ee7b7' }}>
                <strong>Created by Bleon Balaj</strong>
                <div style={{ color: '#8fa59c', marginTop: '4px' }}>
                  Contact: <a href="mailto:b.balaj@hotmail.com" style={{ textDecoration: 'underline' }}>b.balaj@hotmail.com</a>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
