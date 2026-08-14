import * as THREE from '/node_modules/three/build/three.module.js';

const DEFAULT_OBJ_PATH = "https://www.dropbox.com/scl/fi/xctklne8w7ci3qkmhdzj1/Meshy_AI_Golden_Propeller_0810004609_texture.obj?rlkey=g9yv9idguza6euc2m4zijub36&st=i0epvubx&dl=0";
const SLIDER_RANGE = 100;

//scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, 0.8, 0.01, 1000);
camera.position.set(0, 0.9, 2);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

//light physics
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(3, 5, 2);
scene.add(directionalLight);

const axesHelper = new THREE.AxesHelper(0.5);
scene.add(axesHelper);

const geometry = new THREE.BufferGeometry();
const meshMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  vertexColors: true,
  shininess: 80,
});
const pointsMaterial = new THREE.PointsMaterial({
  size: 0.02,
  vertexColors: true,
  transparent: true,
  opacity: 0.75,
});
const mesh = new THREE.Mesh(geometry, meshMaterial);
const pointsMesh = new THREE.Points(geometry, pointsMaterial);
scene.add(mesh);
scene.add(pointsMesh);

let totalIndices = 0;
let totalVertices = 0;
let positionsArray = null;
let activeLoadToken = 0;
let currentBuildProgress = 0;

function parseObjGeometry(objText) {
  const vertices = [];
  const indices = [];
  const lines = objText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parts = trimmed.split(/\s+/);
    if (parts[0] === 'v' && parts.length >= 4) {
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const z = parseFloat(parts[3]);
      if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
        vertices.push(x, y, z);
      }
    } else if (parts[0] === 'f' && parts.length >= 4) {
      const faceIndices = parts.slice(1).map((token) => {
        const vertexIndex = token.split('/')[0];
        return parseInt(vertexIndex, 10) - 1;
      }).filter((index) => !Number.isNaN(index));

      for (let i = 1; i + 1 < faceIndices.length; i += 1) {
        indices.push(faceIndices[0], faceIndices[i], faceIndices[i + 1]);
      }
    }
  }

  return { vertices, indices };
}

function heatColor(weight) {
  const color = new THREE.Color();
  color.setHSL(0.66 - weight * 0.66, 1, 0.5);
  return color;
}

function createThermalColors(baseHeat) {
  const colors = [];
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 1; i < positionsArray.length; i += 3) {
    minY = Math.min(minY, positionsArray[i]);
    maxY = Math.max(maxY, positionsArray[i]);
  }
  const range = Math.max(maxY - minY, 0.0001);

  for (let i = 0; i < positionsArray.length; i += 3) {
    const y = positionsArray[i + 1];
    const normalizedHeight = (y - minY) / range;
    const weight = THREE.MathUtils.clamp(normalizedHeight * 0.6 + baseHeat * 0.4, 0, 1);
    const color = heatColor(weight);
    colors.push(color.r, color.g, color.b);
  }

  return new Float32Array(colors);
}

function setupGeometry(vertices, indices) {
  totalVertices = Math.floor(vertices.length / 3);
  totalIndices = indices.length;
  positionsArray = new Float32Array(vertices);

  geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
  geometry.setIndex(indices);
  geometry.setAttribute('color', new THREE.BufferAttribute(createThermalColors(0), 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.setDrawRange(0, 0);
}

function updateBuildProgress(value) {
  if (totalIndices === 0) return;
  const drawCount = Math.floor((value / SLIDER_RANGE) * totalIndices);
  geometry.setDrawRange(0, drawCount);
  geometry.setAttribute('color', new THREE.BufferAttribute(createThermalColors(value / SLIDER_RANGE), 3));
  geometry.attributes.color.needsUpdate = true;
}

function resizeRenderer(renderer, viewer) {
  if (!viewer) return;
  const width = viewer.clientWidth;
  const height = Math.max(viewer.clientHeight, Math.round(window.innerHeight * 0.45));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate(renderer) {
  requestAnimationFrame(() => animate(renderer));
  mesh.rotation.y += 0.002;
  pointsMesh.rotation.y += 0.002;
  renderer.render(scene, camera);
}

function init() {
  const viewer = document.querySelector('#viewer3d');
  const slider = document.getElementById('time_slider');
  const output = document.getElementById('slider-value');
  const canvas = document.getElementById('threeCanvas');

  if (!viewer || !slider || !output || !canvas) {
    console.warn('Three.js viewer or slider elements are missing');
    return;
  }

  //render inside external index.html canvas kind of similiar to chart.js 'new Chart(ctx)'
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0f1d33);
  resizeRenderer(renderer, viewer);
  window.addEventListener('resize', () => resizeRenderer(renderer, viewer));

  slider.max = SLIDER_RANGE;
  output.textContent = slider.value;

  slider.addEventListener('input', (event) => {
    const value = Number(event.target.value);
    output.textContent = value;
    currentBuildProgress = value;
    updateBuildProgress(value);
  });

  //crucial for attaining Firestore objects containing DROPBOX path
  window.addEventListener('three-model-source-changed', (event) => {
    const objPath = event.detail?.objPath;
    if (!objPath) return;
    loadObjFromSource(objPath, currentBuildProgress || Number(slider.value));
  });

  // Normalize common shared-link hosts to raw downloadable forms
  function normalizeDownloadUrl(urlStr) {
    try {
      const url = new URL(urlStr);
      const host = url.hostname.toLowerCase();

      // Dropbox share links -> force raw download
      if (host.includes('dropbox.com')) {
        // prefer dl=1 which instructs Dropbox to serve raw file
        url.searchParams.set('dl', '1');
        return url.toString();
      }

      // GitHub blob links -> convert to raw.githubusercontent.com
      if (host.includes('github.com') && url.pathname.includes('/blob/')) {
        return urlStr.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      }

      return urlStr;
    } catch (e) {
      return urlStr;
    }
  }

  async function fetchObjText(src) {
    const tried = new Set();

    async function attempt(u) {
      if (tried.has(u)) return null;
      tried.add(u);
      try {
        const res = await fetch(u, { mode: 'cors', redirect: 'follow' });
        if (!res.ok) {
          console.warn(`Fetch ${u} returned ${res.status}`);
          return null;
        }

        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();

        // If we get an HTML page back, it's probably a preview page treated as failure
        if (contentType.includes('text/html') || text.trim().startsWith('<!DOCTYPE html') || text.includes('<html')) {
          console.warn(`Fetched HTML preview from ${u}`);
          return null;
        }

        return text;
      } catch (err) {
        console.warn(`Fetch failed for ${u}:`, err);
        return null;
      }
    }

    // Try normalized URL first
    const first = normalizeDownloadUrl(src);
    let txt = await attempt(first);
    if (txt) return txt;

    // If original differs, try original
    if (first !== src) {
      txt = await attempt(src);
      if (txt) return txt;
    }

    // Dropbox alternate raw host
    try {
      const url = new URL(src);
      if (url.hostname.includes('dropbox.com')) {
        const alt = src.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
        txt = await attempt(alt);
        if (txt) return txt;
      }
    } catch (e) {
      // ignore
    }

    return null;
  }

  async function loadObjFromSource(objPath, sliderValue = Number(slider.value)) {
    const loadId = ++activeLoadToken;
    try {
      const text = await fetchObjText(objPath);
      if (!text) throw new Error(`Unable to download raw OBJ from ${objPath}`);

      const { vertices, indices } = parseObjGeometry(text);
      if (vertices.length === 0 || indices.length === 0) {
        throw new Error('No vertices or faces found in OBJ file');
      }

      if (loadId !== activeLoadToken) return;
      setupGeometry(vertices, indices);
      updateBuildProgress(sliderValue);
    } catch (error) {
      if (loadId === activeLoadToken) {
        console.error('OBJ load/parse error:', error);
      }
    }
  }

  (async () => {
    await loadObjFromSource(DEFAULT_OBJ_PATH, Number(slider.value));
    animate(renderer);
  })();
}

document.addEventListener('DOMContentLoaded', init);

