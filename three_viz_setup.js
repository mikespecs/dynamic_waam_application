import * as THREE from '/node_modules/three/build/three.module.js';

const OBJ_PATH = './models/base/propeller/propeller_vert.obj';
const SLIDER_RANGE = 100;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, 0.8, 0.01, 1000);
camera.position.set(0, 0.9, 2);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

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
    updateBuildProgress(value);
  });

  fetch(OBJ_PATH)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${OBJ_PATH}: ${response.statusText}`);
      return response.text();
    })
    .then((text) => {
      const { vertices, indices } = parseObjGeometry(text);
      if (vertices.length === 0 || indices.length === 0) {
        throw new Error('No vertices or faces found in OBJ file');
      }
      setupGeometry(vertices, indices);
      updateBuildProgress(Number(slider.value));
      animate(renderer);
    })
    .catch((error) => {
      console.error('OBJ load/parse error:', error);
    });
}

document.addEventListener('DOMContentLoaded', init);

