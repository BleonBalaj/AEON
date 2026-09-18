'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CelestialBody, solarBodies } from '@/lib/solar-system/planets';

export type SolarViewMode = 'system' | 'planet';

export interface SolarLayers {
  orbits: boolean;
  clouds: boolean;
  tilt: boolean;
  rings: boolean;
  night: boolean;
  revolution: boolean;
}

export interface SolarViewerApi {
  zoom: (factor: number) => void;
  reset: () => void;
  focusBody: (id: string) => void;
  viewSystem: () => void;
}

interface SolarViewerProps {
  selectedBodyId: string; // 'system' | 'sun' | 'mercury' | ...
  viewMode: SolarViewMode;
  layers: SolarLayers;
  autoRotate: boolean;
  speedMultiplier: number;
  onSelectBody: (id: string) => void;
  onViewModeChange: (mode: SolarViewMode) => void;
  onReady: (api: SolarViewerApi) => void;
  onStatus: (status: string) => void;
}

interface PlanetConfig {
  id: string;
  name: string;
  orbitRadius: number;
  size: number;
  orbitSpeed: number; // orbital speed ratio
  spinSpeed: number;
  tiltDeg: number;
  texture: string;
  bump?: string;
  clouds?: string;
  oblate?: [number, number, number];
  rings?: {
    inner: number;
    outer: number;
    texture: string;
  };
  hasMoon?: boolean;
}

const CELESTIAL_CONFIGS: PlanetConfig[] = [
  {
    id: 'sun',
    name: 'Sun',
    orbitRadius: 0,
    size: 2.6,
    orbitSpeed: 0,
    spinSpeed: 0.04,
    tiltDeg: 7.25,
    texture: '/textures/planets/sun.jpg',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    orbitRadius: 6.2,
    size: 0.38,
    orbitSpeed: 2.8,
    spinSpeed: 0.08,
    tiltDeg: 0.03,
    texture: '/textures/planets/mercury.jpg',
    bump: '/textures/planets/mercury_bump.jpg',
  },
  {
    id: 'venus',
    name: 'Venus',
    orbitRadius: 9.4,
    size: 0.58,
    orbitSpeed: 1.8,
    spinSpeed: -0.06,
    tiltDeg: 177.36,
    texture: '/textures/planets/venus.jpg',
  },
  {
    id: 'earth',
    name: 'Earth',
    orbitRadius: 13.2,
    size: 0.62,
    orbitSpeed: 1.2,
    spinSpeed: 0.25,
    tiltDeg: 23.44,
    texture: '/textures/planets/earth.jpg',
    bump: '/textures/planets/earth_bump.jpg',
    clouds: '/textures/planets/earth_clouds.jpg',
    hasMoon: true,
  },
  {
    id: 'mars',
    name: 'Mars',
    orbitRadius: 17.2,
    size: 0.44,
    orbitSpeed: 0.85,
    spinSpeed: 0.24,
    tiltDeg: 25.19,
    texture: '/textures/planets/mars.jpg',
    bump: '/textures/planets/mars_bump.jpg',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    orbitRadius: 23.2,
    size: 1.55,
    orbitSpeed: 0.45,
    spinSpeed: 0.55,
    tiltDeg: 3.13,
    texture: '/textures/planets/jupiter.jpg',
    oblate: [1.06, 0.93, 1.06],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    orbitRadius: 30.5,
    size: 1.22,
    orbitSpeed: 0.28,
    spinSpeed: 0.50,
    tiltDeg: 26.73,
    texture: '/textures/planets/saturn.jpg',
    oblate: [1.06, 0.92, 1.06],
    rings: {
      inner: 1.5,
      outer: 3.1,
      texture: '/textures/planets/saturn_ring.png',
    },
  },
  {
    id: 'uranus',
    name: 'Uranus',
    orbitRadius: 38.0,
    size: 0.88,
    orbitSpeed: 0.18,
    spinSpeed: 0.32,
    tiltDeg: 97.77,
    texture: '/textures/planets/uranus.jpg',
    rings: {
      inner: 1.1,
      outer: 1.9,
      texture: '/textures/planets/uranus_ring.png',
    },
  },
  {
    id: 'neptune',
    name: 'Neptune',
    orbitRadius: 45.5,
    size: 0.85,
    orbitSpeed: 0.12,
    spinSpeed: 0.34,
    tiltDeg: 28.32,
    texture: '/textures/planets/neptune.jpg',
  },
  {
    id: 'pluto',
    name: 'Pluto',
    orbitRadius: 52.0,
    size: 0.28,
    orbitSpeed: 0.08,
    spinSpeed: 0.09,
    tiltDeg: 122.53,
    texture: '/textures/planets/pluto.jpg',
  },
];

export default function SolarViewer({
  selectedBodyId,
  viewMode,
  layers,
  autoRotate,
  speedMultiplier,
  onSelectBody,
  onViewModeChange,
  onReady,
  onStatus,
}: SolarViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // Keep latest props in refs for animation loop
  const viewModeRef = useRef(viewMode);
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  const selectedBodyIdRef = useRef(selectedBodyId);
  useEffect(() => {
    selectedBodyIdRef.current = selectedBodyId;
  }, [selectedBodyId]);

  const layersRef = useRef(layers);
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const speedRef = useRef(speedMultiplier);
  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  const onSelectBodyRef = useRef(onSelectBody);
  useEffect(() => {
    onSelectBodyRef.current = onSelectBody;
  }, [onSelectBody]);

  const onViewModeChangeRef = useRef(onViewModeChange);
  useEffect(() => {
    onViewModeChangeRef.current = onViewModeChange;
  }, [onViewModeChange]);

  const onStatusRef = useRef(onStatus);
  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Celestial object registry
  interface BodyNode {
    config: PlanetConfig;
    orbitPivot: THREE.Group;
    bodyContainer: THREE.Group;
    bodyMesh: THREE.Mesh;
    cloudsMesh?: THREE.Mesh;
    ringsMesh?: THREE.Mesh;
    orbitLine?: THREE.Line;
    hitSphere: THREE.Mesh;
    angle: number;
  }
  const bodiesRef = useRef<Map<string, BodyNode>>(new Map());
  const sunInnerCoronaMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const sunOuterCoronaMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const getPlanetFocusPose = (node: BodyNode) => {
    const worldPos = new THREE.Vector3();
    node.bodyContainer.getWorldPosition(worldPos);
    if (node.config.id === 'sun') {
      return {
        cam: new THREE.Vector3(0, 5.8, 22.0),
        target: new THREE.Vector3(0, 0, 0),
      };
    }
    const viewDist = node.config.rings
      ? node.config.rings.outer * 2.65
      : node.config.size * 5.8;
    return {
      cam: worldPos.clone().add(new THREE.Vector3(0, viewDist * 0.28, viewDist)),
      target: worldPos,
    };
  };

  const lastPlanetWorldPos = useRef<THREE.Vector3 | null>(null);

  // Camera lerp target positions
  const targetCamPos = useRef(new THREE.Vector3(0, 46, 66));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const savedSystemCamPos = useRef<THREE.Vector3 | null>(null);
  const savedSystemLookAt = useRef<THREE.Vector3 | null>(null);
  const isTransitioningRef = useRef(false);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth || 1200;
    const height = container.clientHeight || window.innerHeight || 800;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 3000);
    const yOffset = Math.round(height * 0.08);
    camera.setViewOffset(width, height, 0, yOffset, width, height);
    camera.position.set(0, 46, 66);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.2;
    controls.maxDistance = 250.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // allow slight under-angle
    controlsRef.current = controls;

    const textureLoader = new THREE.TextureLoader();

    // 1. Vast Starfield (4,000 Stars)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 4200;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color('#d4e6f1'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#fef3c7'),
      new THREE.Color('#fde68a'),
      new THREE.Color('#93c5fd'),
      new THREE.Color('#fed7aa'),
    ];

    for (let i = 0; i < starCount; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 400 + Math.random() * 400;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 2. Lighting System
    // Ambient light so the unlit sides remain faintly visible with high contrast
    const ambientLight = new THREE.AmbientLight(0x14202b, 0.45);
    scene.add(ambientLight);

    // Radiant Sun PointLight illuminating all planets outwards
    const sunPointLight = new THREE.PointLight(0xfffaed, 4.2, 350, 0.25);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    // Soft directional rim light for depth
    const rimLight = new THREE.DirectionalLight(0x7ec8e3, 0.5);
    rimLight.position.set(30, 40, 30);
    scene.add(rimLight);

    // 3. Build Celestial Bodies & Orbits
    bodiesRef.current.clear();
    const hitMeshes: THREE.Mesh[] = [];

    CELESTIAL_CONFIGS.forEach((cfg, idx) => {
      const orbitPivot = new THREE.Group();
      scene.add(orbitPivot);

      const bodyContainer = new THREE.Group();
      bodyContainer.position.set(cfg.orbitRadius, 0, 0);
      orbitPivot.add(bodyContainer);

      // Initial angle distribution so planets don't start in a single line
      const startAngle = idx * 0.72 + (idx % 2 === 0 ? 0.4 : 0);
      orbitPivot.rotation.y = startAngle;

      let orbitLine: THREE.Line | undefined;
      if (cfg.orbitRadius > 0) {
        // Orbit curve in XZ plane
        const curve = new THREE.EllipseCurve(
          0,
          0,
          cfg.orbitRadius,
          cfg.orbitRadius,
          0,
          2 * Math.PI,
          false,
          0
        );
        const points = curve.getPoints(128);
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(
          points.map((p) => new THREE.Vector3(p.x, 0, p.y))
        );
        const orbitMat = new THREE.LineBasicMaterial({
          color: cfg.id === 'earth' ? 0x38bdf8 : 0x64748b,
          transparent: true,
          opacity: 0.28,
        });
        orbitLine = new THREE.Line(orbitGeo, orbitMat);
        scene.add(orbitLine);
      }

      // Planet Sphere
      const sphereGeo = new THREE.SphereGeometry(cfg.size, 64, 64);
      let bodyMesh: THREE.Mesh;

      if (cfg.id === 'sun') {
        const sunTex = textureLoader.load(cfg.texture);
        sunTex.colorSpace = THREE.SRGBColorSpace;

        // Photosphere: Authentic 2K NASA SDO Photograph with self-illuminating material
        const sunMat = new THREE.MeshBasicMaterial({
          map: sunTex,
        });
        bodyMesh = new THREE.Mesh(sphereGeo, sunMat);

        // Layer 1: Inner Atmospheric Chromosphere Glow (Concentric Sphere, completely spherical from all angles)
        const innerCoronaGeo = new THREE.SphereGeometry(cfg.size * 1.08, 48, 48);
        const innerCoronaMat = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
          },
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              vViewPosition = -mvPosition.xyz;
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
              vec3 normal = normalize(vNormal);
              vec3 viewDir = normalize(vViewPosition);
              float rim = 1.0 - clamp(dot(normal, viewDir), 0.0, 1.0);
              float glow = pow(rim, 2.4);
              float pulse = 0.95 + 0.05 * sin(time * 2.0);
              vec3 color = vec3(1.0, 0.72, 0.22);
              gl_FragColor = vec4(color, glow * 0.9 * pulse);
            }
          `,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        });
        sunInnerCoronaMatRef.current = innerCoronaMat;
        const innerCorona = new THREE.Mesh(innerCoronaGeo, innerCoronaMat);
        bodyContainer.add(innerCorona);

        // Layer 2: Outer Diffuse Coronal Radiance (Concentric Sphere, completely spherical with soft falloff)
        const outerCoronaGeo = new THREE.SphereGeometry(cfg.size * 1.32, 48, 48);
        const outerCoronaMat = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
          },
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              vViewPosition = -mvPosition.xyz;
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform float time;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
              vec3 normal = normalize(vNormal);
              vec3 viewDir = normalize(vViewPosition);
              float rim = 1.0 - clamp(dot(normal, viewDir), 0.0, 1.0);
              float glow = pow(rim, 3.8);
              float pulse = 0.92 + 0.08 * cos(time * 1.5);
              vec3 color = vec3(1.0, 0.45, 0.08);
              gl_FragColor = vec4(color, glow * 0.5 * pulse);
            }
          `,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
        });
        sunOuterCoronaMatRef.current = outerCoronaMat;
        const outerCorona = new THREE.Mesh(outerCoronaGeo, outerCoronaMat);
        bodyContainer.add(outerCorona);
      } else {
        const diffTex = textureLoader.load(cfg.texture);
        diffTex.colorSpace = THREE.SRGBColorSpace;
        const bumpTex = cfg.bump ? textureLoader.load(cfg.bump) : null;

        const matOptions: THREE.MeshStandardMaterialParameters = {
          map: diffTex,
          roughness: cfg.id === 'jupiter' || cfg.id === 'saturn' || cfg.id === 'uranus' || cfg.id === 'neptune' ? 0.42 : 0.82,
          metalness: 0.04,
        };
        if (bumpTex) {
          matOptions.bumpMap = bumpTex;
          matOptions.bumpScale = 0.04;
        }

        const bodyMat = new THREE.MeshStandardMaterial(matOptions);
        bodyMesh = new THREE.Mesh(sphereGeo, bodyMat);

        if (cfg.oblate) {
          bodyMesh.scale.set(cfg.oblate[0], cfg.oblate[1], cfg.oblate[2]);
        }
      }

      // Axial Tilt
      bodyMesh.rotation.z = THREE.MathUtils.degToRad(cfg.tiltDeg);
      bodyContainer.add(bodyMesh);

      // Clouds (Earth)
      let cloudsMesh: THREE.Mesh | undefined;
      if (cfg.clouds) {
        const cloudTex = textureLoader.load(cfg.clouds);
        cloudTex.colorSpace = THREE.SRGBColorSpace;
        const cloudGeo = new THREE.SphereGeometry(cfg.size * 1.02, 64, 64);
        const cloudMat = new THREE.MeshStandardMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.84,
          blending: THREE.NormalBlending,
          depthWrite: false,
        });
        cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
        cloudsMesh.rotation.z = THREE.MathUtils.degToRad(cfg.tiltDeg);
        bodyContainer.add(cloudsMesh);
      }

      // Rings (Saturn, Uranus)
      let ringsMesh: THREE.Mesh | undefined;
      if (cfg.rings) {
        const ringGeo = new THREE.RingGeometry(cfg.rings.inner, cfg.rings.outer, 64);
        // Map UV radially
        const pos = ringGeo.attributes.position;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          v3.fromBufferAttribute(pos, i);
          ringGeo.attributes.uv.setXY(i, (v3.length() - cfg.rings.inner) / (cfg.rings.outer - cfg.rings.inner), 0);
        }
        const ringTex = textureLoader.load(cfg.rings.texture);
        ringTex.colorSpace = THREE.SRGBColorSpace;
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: cfg.id === 'saturn' ? 0.94 : 0.65,
          roughness: 0.6,
        });
        ringsMesh = new THREE.Mesh(ringGeo, ringMat);
        ringsMesh.rotation.x = Math.PI / 2;
        ringsMesh.rotation.y = THREE.MathUtils.degToRad(cfg.tiltDeg);
        bodyContainer.add(ringsMesh);
      }

      // Moon (Earth)
      if (cfg.hasMoon) {
        const moonGeo = new THREE.SphereGeometry(0.16, 24, 24);
        const moonTex = textureLoader.load('/textures/planets/moon.jpg');
        moonTex.colorSpace = THREE.SRGBColorSpace;
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTex,
          roughness: 0.88,
        });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.set(1.4, 0.2, 0);
        bodyContainer.add(moonMesh);
      }

      // Invisible Raycast Click Target (slightly larger than planet for easy clicking)
      const hitGeo = new THREE.SphereGeometry(Math.max(cfg.size * 1.5, 0.8), 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitSphere = new THREE.Mesh(hitGeo, hitMat);
      hitSphere.userData = { bodyId: cfg.id };
      bodyContainer.add(hitSphere);
      hitMeshes.push(hitSphere);

      bodiesRef.current.set(cfg.id, {
        config: cfg,
        orbitPivot,
        bodyContainer,
        bodyMesh,
        cloudsMesh,
        ringsMesh,
        orbitLine,
        hitSphere,
        angle: startAngle,
      });
    });

    // 4. Raycasting for Clicking Planets
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: MouseEvent) => {
      // Check if it was a click (not a drag)
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitMeshes, false);

      if (intersects.length > 0) {
        const hitId = intersects[0].object.userData.bodyId as string;
        if (hitId) {
          if (viewModeRef.current === 'system') {
            savedSystemCamPos.current = camera.position.clone();
            savedSystemLookAt.current = controls.target.clone();
          }
          onSelectBodyRef.current(hitId);
        }
      } else {
        // Empty space clicked! If in planet view, click background returns to solar system where you were
        if (viewModeRef.current === 'planet') {
          onViewModeChangeRef.current('system');
          if (savedSystemCamPos.current && savedSystemLookAt.current) {
            targetCamPos.current.copy(savedSystemCamPos.current);
            targetLookAt.current.copy(savedSystemLookAt.current);
          } else {
            targetCamPos.current.set(0, 46, 66);
            targetLookAt.current.set(0, 0, 0);
          }
          isTransitioningRef.current = true;
          lastPlanetWorldPos.current = null;
        }
      }
    };

    const handleDblClick = () => {
      onViewModeChangeRef.current('system');
      if (savedSystemCamPos.current && savedSystemLookAt.current) {
        targetCamPos.current.copy(savedSystemCamPos.current);
        targetLookAt.current.copy(savedSystemLookAt.current);
      } else {
        targetCamPos.current.set(0, 46, 66);
        targetLookAt.current.set(0, 0, 0);
      }
      isTransitioningRef.current = true;
      lastPlanetWorldPos.current = null;
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('dblclick', handleDblClick);

    // 5. Expose Navigation API
    const api: SolarViewerApi = {
      zoom: (factor: number) => {
        if (!cameraRef.current) return;
        cameraRef.current.position.multiplyScalar(factor);
        controls.update();
      },
      reset: () => {
        savedSystemCamPos.current = null;
        savedSystemLookAt.current = null;
        onViewModeChangeRef.current('system');
        targetCamPos.current.set(0, 46, 66);
        targetLookAt.current.set(0, 0, 0);
        isTransitioningRef.current = true;
        lastPlanetWorldPos.current = null;
      },
      focusBody: (id: string) => {
        if (viewModeRef.current === 'system' && cameraRef.current && controlsRef.current) {
          savedSystemCamPos.current = cameraRef.current.position.clone();
          savedSystemLookAt.current = controlsRef.current.target.clone();
        }
        const bodyNode = bodiesRef.current.get(id);
        if (bodyNode) {
          const pose = getPlanetFocusPose(bodyNode);
          targetCamPos.current.copy(pose.cam);
          targetLookAt.current.copy(pose.target);
          isTransitioningRef.current = true;
          lastPlanetWorldPos.current = null;
        }
      },
      viewSystem: () => {
        onViewModeChangeRef.current('system');
        if (savedSystemCamPos.current && savedSystemLookAt.current) {
          targetCamPos.current.copy(savedSystemCamPos.current);
          targetLookAt.current.copy(savedSystemLookAt.current);
        } else {
          targetCamPos.current.set(0, 46, 66);
          targetLookAt.current.set(0, 0, 0);
        }
        isTransitioningRef.current = true;
        lastPlanetWorldPos.current = null;
      },
    };
    onReady(api);

    // 6. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      cameraRef.current.aspect = w / h;
      const yOffset = Math.round(h * 0.08);
      cameraRef.current.setViewOffset(w, h, 0, yOffset, w, h);
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animId = 0;
    let lastTime = performance.now();
    const startTime = performance.now();

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const elapsed = (time - startTime) / 1000;

      const curSpeed = speedRef.current;
      const curLayers = layersRef.current;
      const isSystem = viewModeRef.current === 'system';
      const curSelectedId = selectedBodyIdRef.current;

      // Rotate planets & advance orbital revolutions
      bodiesRef.current.forEach((node) => {
        // Orbit revolution around the Sun
        if (curLayers.revolution && node.config.orbitSpeed > 0) {
          node.orbitPivot.rotation.y += delta * node.config.orbitSpeed * 0.08 * curSpeed;
        }

        // Axial spin
        if (autoRotateRef.current) {
          node.bodyMesh.rotation.y += delta * node.config.spinSpeed * 0.8;
          if (node.cloudsMesh) {
            node.cloudsMesh.rotation.y += delta * (node.config.spinSpeed * 1.15);
          }
        }

        // Layer toggles
        if (node.orbitLine) {
          node.orbitLine.visible = curLayers.orbits;
        }
        if (node.cloudsMesh) {
          node.cloudsMesh.visible = curLayers.clouds;
        }
        if (node.ringsMesh) {
          node.ringsMesh.visible = curLayers.rings;
        }
      });

      // Update Sun shaders
      if (sunInnerCoronaMatRef.current) {
        sunInnerCoronaMatRef.current.uniforms.time.value = elapsed;
      }
      if (sunOuterCoronaMatRef.current) {
        sunOuterCoronaMatRef.current.uniforms.time.value = elapsed;
      }

      // Camera Tracking & Smooth Interpolation
      if (isSystem) {
        // In system view, targetCamPos and targetLookAt are set on transition (saved pose or default)
      } else {
        const targetNode = bodiesRef.current.get(curSelectedId);
        if (targetNode) {
          const pose = getPlanetFocusPose(targetNode);
          targetCamPos.current.copy(pose.cam);
          targetLookAt.current.copy(pose.target);
        }
      }

      // Smooth flight transition
      if (isTransitioningRef.current) {
        camera.position.lerp(targetCamPos.current, 0.08);
        controls.target.lerp(targetLookAt.current, 0.08);

        if (
          camera.position.distanceTo(targetCamPos.current) < 0.12 &&
          controls.target.distanceTo(targetLookAt.current) < 0.12
        ) {
          isTransitioningRef.current = false;
          controls.target.copy(targetLookAt.current);
          if (!isSystem) {
            const targetNode = bodiesRef.current.get(curSelectedId);
            if (targetNode) {
              const wp = new THREE.Vector3();
              targetNode.bodyContainer.getWorldPosition(wp);
              lastPlanetWorldPos.current = wp;
            }
          }
        }
      } else if (!isSystem) {
        // While viewing a planet, follow its orbital revolution smoothly without locking OrbitControls!
        const targetNode = bodiesRef.current.get(curSelectedId);
        if (targetNode) {
          const currentPlanetPos = new THREE.Vector3();
          targetNode.bodyContainer.getWorldPosition(currentPlanetPos);

          if (lastPlanetWorldPos.current) {
            const delta = currentPlanetPos.clone().sub(lastPlanetWorldPos.current);
            camera.position.add(delta);
            controls.target.add(delta);
          }
          lastPlanetWorldPos.current = currentPlanetPos;

          // Natural zoom-out threshold:
          // If the user scrolls the mouse wheel backwards past threshold, return to Solar System view
          const distToTarget = camera.position.distanceTo(controls.target);
          const escapeThreshold = targetNode.config.id === 'sun'
            ? 44.0
            : Math.max(targetNode.config.size * 10.5, 18.0);

          if (distToTarget > escapeThreshold) {
            onViewModeChangeRef.current('system');
            if (savedSystemCamPos.current && savedSystemLookAt.current) {
              targetCamPos.current.copy(savedSystemCamPos.current);
              targetLookAt.current.copy(savedSystemLookAt.current);
            } else {
              targetCamPos.current.set(0, 46, 66);
              targetLookAt.current.set(0, 0, 0);
            }
            isTransitioningRef.current = true;
            lastPlanetWorldPos.current = null;
          }
        }
      } else {
        lastPlanetWorldPos.current = null;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('dblclick', handleDblClick);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [onReady]);

  // Update target when selected body or view mode changes
  useEffect(() => {
    isTransitioningRef.current = true;
    lastPlanetWorldPos.current = null;
    const bodyNode = bodiesRef.current.get(selectedBodyId);
    if (viewMode === 'system') {
      if (savedSystemCamPos.current && savedSystemLookAt.current) {
        targetCamPos.current.copy(savedSystemCamPos.current);
        targetLookAt.current.copy(savedSystemLookAt.current);
      } else {
        targetCamPos.current.set(0, 46, 66);
        targetLookAt.current.set(0, 0, 0);
      }
      onStatusRef.current('Heliocentric Orrery · The Complete Solar System');
    } else if (bodyNode) {
      // If we were previously in system mode, save current camera & orbit target
      if (viewModeRef.current === 'system' && cameraRef.current && controlsRef.current) {
        savedSystemCamPos.current = cameraRef.current.position.clone();
        savedSystemLookAt.current = controlsRef.current.target.clone();
      }
      const pose = getPlanetFocusPose(bodyNode);
      targetCamPos.current.copy(pose.cam);
      targetLookAt.current.copy(pose.target);
      onStatusRef.current(`${bodyNode.config.name} · Observation Target Locked`);
    }
  }, [selectedBodyId, viewMode]);

  return (
    <div className="globe-host" tabIndex={0} aria-label="3D Solar System Orrery and Planetary Visualization">
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
        }}
      />
      {loading && (
        <div className="globe-loading">
          <span /> Loading planetary space environment...
        </div>
      )}
    </div>
  );
}

