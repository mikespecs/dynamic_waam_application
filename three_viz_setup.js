import * as THREE from '/node_modules/three/build/three.module.js';
import {getFirestoreDoc} from './external_datasource/client/firestore_client_db_proc.js';

const OBJ_PATH = ""; //empty string for now, will be set after fetching from Firestore
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
const pointsMaterial = new THREE.PointsMaterial({ size: 0.03, color: 0x48d1ff });
const pointsMesh = new THREE.Points(geometry, pointsMaterial);
scene.add(pointsMesh);

let vertexCount = 0;
let totalVertices = 0;

//verification example
function parseObjVertices(objText) {
  const vertices = [];
  const lines = objText.split('\n'); // newline escape character
  for (const line of lines) {
    const trimmed = line.trim(); //delete whitespace (START AND THE END ONLY)

    if (!trimmed || trimmed.startsWith('#')) 
		continue; //if whitespace "surrounding" or comment present, skip
    const parts = trimmed.split(/\s+/); // split by inner whitespace

	//if vertex line (v) + ensuring xyz values present
    if (parts[0] === 'v' && parts.length >= 4) { 
      const x = parseFloat(parts[1]); //x
      const y = parseFloat(parts[2]); //y
      const z = parseFloat(parts[3]); //z
      if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
        vertices.push(x, y, z);
      }
    }
  }
  return vertices;
}

function setupGeometry(vertices) {
  totalVertices = Math.floor(vertices.length / 3); 
  const positions = new Float32Array(vertices); 
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setDrawRange(0, 0);
  geometry.computeBoundingSphere();
  geometry.attributes.position.needsUpdate = true;
}

function updateBuildProgress(value) {
  if (totalVertices === 0) return;
  const drawCount = Math.floor((value/SLIDER_RANGE)* totalVertices); // Calculate the number of vertices to draw based on slider value
  geometry.setDrawRange(0, drawCount);
  geometry.attributes.position.needsUpdate = true;
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
      const parsedVertices = parseObjVertices(text);
      if (parsedVertices.length === 0) {
        throw new Error('No vertices found in OBJ file'); //no further processing if empty 
      }
      setupGeometry(parsedVertices); 
      updateBuildProgress(Number(slider.value));
      animate(renderer);
    })
    .catch((error) => {
      console.error('OBJ load/parse error:', error);
    });
}

document.addEventListener('DOMContentLoaded', init);

