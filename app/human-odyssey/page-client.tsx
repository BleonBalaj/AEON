'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Orbit,
  Globe2,
  Users,
  Clock3,
  BookOpen,
  Search,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Play,
  Pause,
  Layers3,
  Route,
  Info,
  SlidersHorizontal,
  Mountain,
  Activity,
  Snowflake,
  Volume2,
  VolumeX,
  MapPin,
  Dna,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import Globe, { GlobeApi, Layers } from '@/components/earth-globe';
import { toggleAmbience, subscribeAmbience } from '@/lib/earth/ambience';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import HumanAtlas from '@/components/human-atlas';
import {
  events,
  EarthEvent,
  formatAge,
  sources,
  iceAgeGeography,
} from '@/lib/earth/history';
import { routes } from '@/lib/earth/migration';
import { humanChapters } from '@/lib/earth/human-chapters';

const chapters = humanChapters;

const baseLayers: Layers = {
  clouds: true,
  plates: false,
  climate: false,
  ice: true,
  life: false,
  humans: true,
  migration: true,
  civilization: false,
  grid: false,
};

export default function HumanOdyssey() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<'Cinematic' | 'Normal' | 'Fast'>('Normal');
  const [audioOn, setAudioOn] = useState(false);
  useEffect(() => subscribeAmbience(setAudioOn), []);
  const [evidence, setEvidence] = useState(false);
  const [allRoutes, setAllRoutes] = useState(false);
  const [layers, setLayers] = useState<Layers>(baseLayers);
  const [autoRotate, setAutoRotate] = useState(false);
  const [full, setFull] = useState(false);
  const [status, setStatus] = useState('');
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [atlasEvent, setAtlasEvent] = useState<EarthEvent | null>(null);

  const api = useRef<GlobeApi | null>(null);
  const chapter = chapters[index];
  const age =
    atlasEvent?.age ??
    chapter.start + ((chapter.end - chapter.start) * progress) / 100;
  const event =
    atlasEvent ??
    events.find((e) => e.id === chapter.id) ??
    events.find((e) => e.id === 'sapiens')!;
  const geography = iceAgeGeography(age);
  const focus = atlasEvent?.location ?? chapter.focus;
  const focusLat = focus[0];
  const focusLon = focus[1];
  const focusRef = useRef({ lat: focusLat, lon: focusLon });

  useEffect(() => {
    focusRef.current = { lat: focusLat, lon: focusLon };
  }, [focusLat, focusLon]);

  const ready = useCallback((value: GlobeApi) => {
    api.current = value;
    value.focus(focusRef.current.lat, focusRef.current.lon);
  }, []);

  const go = useCallback((next: number) => {
    setAtlasEvent(null);
    setIndex(next);
    setProgress(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    api.current?.focus(focusLat, focusLon);
  }, [focusLat, focusLon]);

  const visit = (entry: EarthEvent) => {
    setPlaying(false);
    setAtlasEvent(entry);
  };

  const buffering = useRef(true);
  const onBuffering = useCallback((waiting: boolean) => {
    buffering.current = waiting;
  }, []);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = 0;
    let position = progressRef.current;

    const tick = (now: number) => {
      if (buffering.current || document.hidden) {
        last = 0;
        frame = requestAnimationFrame(tick);
        return;
      }
      const speedMult =
        { Cinematic: 0.55, Normal: 1, Fast: 2 }[speedRef.current] || 1;
      if (last) {
        position = Math.min(
          100,
          position + ((Math.min(now - last, 100) / 240) * speedMult),
        );
      }
      if (position >= 100) {
        if (index === chapters.length - 1) {
          setProgress(100);
          setPlaying(false);
        } else {
          setProgress(0);
          setIndex((i) => i + 1);
        }
        return;
      }
      setProgress(position);
      last = now;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, index]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAtlasOpen((v) => !v);
        return;
      }
      if (isInput) return;
      if (e.code === 'Space' && (e.target === document.body || e.target === document.documentElement) && !atlasOpen && !evidence) {
        e.preventDefault();
        play();
      } else if ((e.key === 'r' || e.key === 'R') && !atlasOpen && !evidence) {
        e.preventDefault();
        api.current?.reset();
      } else if ((e.key === 'm' || e.key === 'M') && !atlasOpen && !evidence) {
        e.preventDefault();
        toggleAmbience();
      } else if ((e.key === '+' || e.key === '=') && !atlasOpen && !evidence) {
        e.preventDefault();
        api.current?.zoom(0.85);
      } else if ((e.key === '-' || e.key === '_') && !atlasOpen && !evidence) {
        e.preventDefault();
        api.current?.zoom(1.15);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [atlasOpen, evidence]);

  const play = () => {
    setAtlasEvent(null);
    if (progress === 100) {
      setProgress(0);
      if (index === chapters.length - 1) setIndex(0);
    }
    setPlaying((v) => !v);
  };
  return (
    <main className={`atlas ${playing || atlasEvent ? 'exploring' : ''}`}>
      <a className="skip-link" href="#time-control">
        Skip to timeline
      </a>
      <div className="chamber">
        <header className="topbar">
          <Link className="brand" href="/" aria-label="AEON home">
            <Orbit size={30} />
            <span>AEON</span>
          </Link>
          <span className="brand-note">
            A LIVING HISTORY
            <br />
            OF EARTH
          </span>
          <nav aria-label="Main navigation">
            <Link href="/">
              <Globe2 size={15} />
              Explore Earth
            </Link>
            <Link href="/human-odyssey" className="active" aria-current="page">
              <Users size={15} />
              Human Odyssey
            </Link>
            <button onClick={() => { setPlaying(false); setAtlasOpen(true); }}>
              <Clock3 size={15} />
              Story Atlas
            </button>
            <button onClick={() => { setPlaying(false); setEvidence(true); }}>
              <BookOpen size={15} />
              About the atlas
            </button>
          </nav>
          <button
            className="search-button"
            onClick={() => { setPlaying(false); setAtlasOpen(true); }}
            aria-label="Search human history"
          >
            <Search size={17} />
            <span>Search history</span>
            <kbd>⌘ K</kbd>
          </button>
        </header>

        <section className="workspace" aria-label="Human migration visualization">
          <Globe
            onBuffering={onBuffering}
            age={age}
            layers={{
              ...layers,
              civilization: atlasEvent?.category === 'Civilization',
            }}
            selected={atlasEvent}
            onSelect={(entry) => {
              visit(entry);
              setEvidence(true);
            }}
            onReady={ready}
            autoRotate={autoRotate}
            onStatus={setStatus}
            routeIds={
              atlasEvent ? [] : allRoutes ? undefined : [...chapter.routes]
            }
          />

          <div className="intro">
            <div className="eyebrow">
              <span className="live-dot" />{' '}
              {atlasEvent
                ? 'HUMAN STORY ATLAS'
                : `CHAPTER ${String(index + 1).padStart(2, '0')} / 06`}
            </div>
            <h1>
              {(() => {
                const title = atlasEvent ? atlasEvent.title : chapter.name;
                const words = title.split(' ');
                if (words.length <= 1) return title;
                const splitIdx = words.length === 2 ? 1 : words.length <= 4 ? 2 : 3;
                const top = words.slice(0, splitIdx).join(' ');
                const bottom = words.slice(splitIdx).join(' ');
                return (
                  <>
                    {top}
                    <br />
                    <em>{bottom}</em>
                  </>
                );
              })()}
            </h1>
            <p>{atlasEvent ? atlasEvent.description : event.description}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              <button
                className="text-link"
                onClick={() => {
                  setPlaying(false);
                  setEvidence(true);
                }}
              >
                Read the evidence <ArrowUpRight size={16} />
              </button>
              {atlasEvent && (
                <button className="text-link" onClick={() => setAtlasEvent(null)}>
                  Return to guided journey <ArrowUpRight size={14} />
                </button>
              )}
            </div>
            <div className="intro-foot">
              {formatAge(age).toUpperCase()} · {chapter.region.toUpperCase()}
            </div>
          </div>

          <div className="globe-caption">
            <span className="live-dot" />{' '}
            {atlasEvent?.place
              ? `${atlasEvent.place.toUpperCase()} · `
              : `${chapter.region.toUpperCase()} · `}
            HUMAN DISPERSAL
            <span className="caption-sub">
              {status || 'Drag to explore · Scroll or pinch to zoom · Double-click to center'}
            </span>
          </div>

          <aside className="context">
            <div className="context-heading">
              <span className="eyebrow">CHAPTER AT A GLANCE</span>
              <button
                aria-label="Read the evidence"
                title="Evidence & uncertainty"
                onClick={() => {
                  setPlaying(false);
                  setEvidence(true);
                }}
              >
                <Info size={14} />
              </button>
            </div>
            <div className="planet-facts">
              <div>
                <Route size={15} />
                <span>
                  Dispersal region<strong>{chapter.region}</strong>
                </span>
              </div>
              <div>
                <Activity size={15} />
                <span>
                  Sea level
                  <strong>
                    {geography.level > 0 ? '+' : ''}
                    {Math.round(geography.level / 5) * 5} m vs. today
                  </strong>
                </span>
              </div>
              <div>
                <Mountain size={15} />
                <span>
                  Paleogeography
                  <strong>
                    {geography.regions.length
                      ? geography.regions.join(', ')
                      : 'Near-modern coastlines'}
                  </strong>
                </span>
              </div>
            </div>
            <hr />
            <div className="context-heading">
              <span className="eyebrow">VIEW LAYERS</span>
              <button
                onClick={() => {
                  setPlaying(false);
                  setAtlasOpen(true);
                }}
                aria-label="Search human story atlas"
                title="Human Story Atlas"
              >
                <SlidersHorizontal size={14} />
              </button>
            </div>
            <label className="layer-row" htmlFor="quick-all-routes">
              <Route size={15} />
              <span>All dispersal routes</span>
              <Switch
                id="quick-all-routes"
                size="sm"
                checked={allRoutes}
                onCheckedChange={setAllRoutes}
              />
            </label>
            <label className="layer-row" htmlFor="quick-fossil-locs">
              <Users size={15} />
              <span>Fossil locations</span>
              <Switch
                id="quick-fossil-locs"
                size="sm"
                checked={layers.humans}
                onCheckedChange={(v) =>
                  setLayers((l) => ({ ...l, humans: v }))
                }
              />
            </label>
            <label className="layer-row" htmlFor="quick-ice-shelves">
              <Snowflake size={15} />
              <span>Ice & exposed shelves</span>
              <Switch
                id="quick-ice-shelves"
                size="sm"
                checked={layers.ice}
                onCheckedChange={(v) =>
                  setLayers((l) => ({ ...l, ice: v }))
                }
              />
            </label>
            <p className="layer-notice">
              {atlasEvent?.certainty ?? chapter.insight}
            </p>
          </aside>

          <div className="view-toolbar" aria-label="Globe controls">
            <button
              aria-label="Zoom in"
              title="Zoom in"
              onClick={() => api.current?.zoom(0.85)}
            >
              <Plus size={18} />
            </button>
            <button
              aria-label="Zoom out"
              title="Zoom out"
              onClick={() => api.current?.zoom(1.15)}
            >
              <Minus size={18} />
            </button>
            <span />
            <button
              aria-label="Refocus this chapter"
              title="Refocus chapter"
              onClick={() => api.current?.focus(focus[0], focus[1])}
            >
              <RotateCcw size={16} />
            </button>
            <button
              aria-label={
                autoRotate ? 'Stop globe rotation' : 'Start globe rotation'
              }
              aria-pressed={autoRotate}
              title="Auto rotation"
              className={autoRotate ? 'on' : ''}
              onClick={() => setAutoRotate((v) => !v)}
            >
              <Orbit size={17} />
            </button>
            <button
              aria-label={full ? 'Exit full screen' : 'Full screen'}
              title="Full screen"
              onClick={async () => {
                try {
                  if (document.fullscreenElement)
                    await document.exitFullscreen();
                  else await document.documentElement.requestFullscreen();
                } catch {
                  setStatus('Full screen is unavailable in this preview.');
                }
              }}
            >
              <Maximize2 size={16} />
            </button>
            <button
              aria-label={audioOn ? 'Mute ambient soundscape (M)' : 'Play ambient soundscape (M)'}
              title={audioOn ? 'Mute ambient soundscape (M)' : 'Play ambient soundscape (M)'}
              className={audioOn ? 'on' : ''}
              onClick={toggleAmbience}
            >
              {audioOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          <button
            className="mobile-layer-toggle"
            onClick={() => setAtlasOpen(true)}
          >
            <Layers3 size={17} /> Layers
          </button>

          <div className="bottom-workspace">
            <button
              onClick={() => {
                setPlaying(false);
                setAtlasOpen(true);
              }}
            >
              <BookOpen size={14} />
              <span>Human Story Atlas</span>
            </button>
            <button
              className="orientation"
              onClick={() => api.current?.reset()}
              title="Align globe to North (R)"
              aria-label="Align globe to North"
            >
              N <span>↑</span>
            </button>
            <button
              onClick={() => {
                setPlaying(false);
                setEvidence(true);
              }}
            >
              <Info size={14} />
              <span>Evidence & uncertainty</span>
            </button>
          </div>
        </section>

        <section
          className="time-panel"
          id="time-control"
          data-playing={playing}
          aria-label="Human Odyssey playback controls"
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

          <div className="time-head">
            <div className="date-block">
              <span className="eyebrow">YOUR PLACE IN TIME</span>
              <strong aria-live={playing ? 'off' : 'polite'}>
                {formatAge(age)}
              </strong>
              <span className="epoch-line">
                {atlasEvent
                  ? `${atlasEvent.category} · ${atlasEvent.place}`
                  : `Chapter ${index + 1} / ${chapter.name} (${chapter.region})`}
              </span>
            </div>

            <div className="timeline-actions">
              <div className="scale-picker">
                <span>CHAPTER</span>
                <Select
                  value={String(index)}
                  onValueChange={(v) => go(Number(v))}
                >
                  <SelectTrigger aria-label="Human Odyssey chapter">
                    <SelectValue>{chapter.name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((c, i) => (
                      <SelectItem key={c.id} value={String(i)}>
                        {String(i + 1).padStart(2, '0')}. {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="play-controls">
                <button
                  className="step-button"
                  aria-label="Previous chapter"
                  onClick={() => go(index - 1)}
                  disabled={index === 0}
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  className="play-button"
                  onClick={play}
                  aria-label={playing ? 'Pause journey' : 'Play guided demo'}
                >
                  {playing ? (
                    <Pause size={17} fill="currentColor" />
                  ) : (
                    <Play size={17} fill="currentColor" />
                  )}
                </button>
                <button
                  className="step-button"
                  aria-label="Next chapter"
                  onClick={() => go(index + 1)}
                  disabled={index === chapters.length - 1}
                >
                  <ChevronRight size={17} />
                </button>
                <Select
                  value={speed}
                  onValueChange={(v) => v && setSpeed(v as 'Cinematic' | 'Normal' | 'Fast')}
                >
                  <SelectTrigger aria-label="Demo playback speed" className="speed-select">
                    <SelectValue>{speed}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cinematic">Cinematic</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Fast">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="timeline-track">
            <Slider
              aria-label="Human chapter progress"
              aria-valuetext={`${chapter.name}: ${formatAge(age)}`}
              value={[progress]}
              min={0}
              max={100}
              step={0.1}
              onValueChange={(v) => {
                setAtlasEvent(null);
                setPlaying(false);
                setProgress(Array.isArray(v) ? v[0] : v);
              }}
            />
            <div className="timeline-labels">
              <span style={{ left: '0%' }}>{formatAge(chapter.start, true)}</span>
              <span style={{ left: '50%', transform: 'translateX(-50%)' }}>
                {formatAge((chapter.start + chapter.end) / 2, true)}
              </span>
              <span style={{ right: '0%' }}>{formatAge(chapter.end, true)}</span>
            </div>
          </div>

          <div
            className="eon-strip"
            style={{
              gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
            }}
          >
            {chapters.map((c, i) => (
              <button
                key={c.id}
                className={!atlasEvent && i === index ? 'active' : ''}
                onClick={() => go(i)}
                title={`${c.name} (${c.region}) · ${formatAge(c.start, true)}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="timeline-foot">
            <span>
              {atlasEvent
                ? 'Select Play or any chapter to return to the guided migration demo.'
                : 'Dispersal lines connect regions schematically; ancient movement was branching and multi-directional.'}
            </span>
            <button
              onClick={() => {
                setAtlasEvent(null);
                setIndex(0);
                setProgress(0);
                setPlaying(true);
              }}
            >
              <RotateCcw size={12} /> Restart demo
            </button>
          </div>
        </section>
      </div>

      <Sheet open={evidence} onOpenChange={setEvidence}>
        <SheetContent scrollResetKey={event.id} className="atlas-sheet">
          <SheetHeader>
            <SheetTitle>{atlasEvent?.title ?? chapter.name}</SheetTitle>
            <SheetDescription>{event.date}</SheetDescription>
          </SheetHeader>
          <div className="sheet-body">
            {!atlasEvent ? (
              <>
                <p className="evidence-subtitle">{chapter.evidence.subtitle}</p>

                <h3>What the evidence tells us</h3>
                <p>{chapter.evidence.lead}</p>

                <h3>Why it matters</h3>
                <p>{chapter.evidence.significance}</p>

                <div className="evidence-box">
                  <BookOpen size={17} />
                  <div>
                    <h3>What remains uncertain</h3>
                    <p>{chapter.evidence.uncertainty}</p>
                  </div>
                </div>

                <div className="evidence-card">
                  <div className="evidence-card-head">
                    <Mountain size={15} />
                    <h4>Palaeoenvironment & Climate Drivers</h4>
                  </div>
                  <p>{chapter.evidence.environment}</p>
                </div>

                <div className="evidence-sites">
                  <h3>Landmark Archaeological & Fossil Discoveries</h3>
                  <div className="site-list">
                    {chapter.evidence.sites.map((site) => (
                      <div key={site.name} className="site-item">
                        <div className="site-item-header">
                          <strong>{site.name}</strong>
                          <span className="site-date-badge">{site.date}</span>
                        </div>
                        <div className="site-loc">
                          <MapPin size={12} /> {site.location}
                        </div>
                        <p>{site.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="evidence-card">
                  <div className="evidence-card-head">
                    <Dna size={15} />
                    <h4>Ancient DNA & Biological Discoveries</h4>
                  </div>
                  <p>{chapter.evidence.genetics}</p>
                </div>

                <div className="evidence-card">
                  <div className="evidence-card-head">
                    <Compass size={15} />
                    <h4>Navigational & Material Technology</h4>
                  </div>
                  <p>{chapter.evidence.technology}</p>
                </div>

                <h3>Connections in this chapter</h3>
                {routes
                  .filter((r) => (chapter.routes as readonly string[]).includes(r.id))
                  .map((r) => (
                    <p key={r.id}>
                      {r.name}
                      <br />
                      <small>{r.range}</small>
                    </p>
                  ))}

                <h3>Key Sources & References</h3>
                <ul className="sources-list">
                  {chapter.evidence.sources.map((s) => (
                    <li key={s.name}>
                      <a href={s.url} target="_blank" rel="noreferrer">
                        <span>
                          <strong>{s.name}</strong>
                          <small style={{ display: 'block', color: '#7e968a', marginTop: 2 }}>
                            {s.note}
                          </small>
                        </span>
                        <ArrowUpRight size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <button
                  className="text-link"
                  onClick={() => setAtlasEvent(null)}
                  style={{ marginBottom: '14px' }}
                >
                  ← Back to {chapter.name} overview
                </button>
                <h3>What the evidence tells us</h3>
                <p>{event.description}</p>
                <h3>Why it matters</h3>
                <p>{event.importance}</p>
                <div className="evidence-box">
                  <BookOpen size={17} />
                  <div>
                    <h3>What remains uncertain</h3>
                    <p>{event.certainty}</p>
                  </div>
                </div>
                <h3>Sources</h3>
                <ul className="sources-list">
                  {event.sources.map((id) => (
                    <li key={id}>
                      <a href={sources[id]?.url || '#'} target="_blank" rel="noreferrer">
                        {sources[id]?.name || id}
                        <ArrowUpRight size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="fine-print">
              Fossil markers show selected evidence locations, not continuous
              population ranges. Ice and shelf geography is approximate.
              Playback speed serves the explanation and is not a population
              model.
            </p>
            <div className="atlas-credits">
              <div>Created by <strong>Bleon Balaj</strong></div>
              <div>Contact: <a href="mailto:b.balaj@hotmail.com">b.balaj@hotmail.com</a></div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <HumanAtlas
        open={atlasOpen}
        onOpenChange={setAtlasOpen}
        onSelect={visit}
      />
    </main>
  );
}
