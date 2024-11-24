import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.12;
controls.enableZoom = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.noRotate = true;
controls2.noPan = true;
controls2.noZoom = false;
controls2.zoomSpeed = 1.5;

camera.position.set(6, 6, 6);

const loadingManager = new THREE.LoadingManager();

const loadingContainer = document.querySelector('.progress-bar-container');
const loadingLabel = document.querySelector('label');
const loadingMessage = document.querySelector('p');

loadingManager.onLoad = function () {
  loadingContainer.style.display = 'none';
};

loadingManager.onError = function () {
  loadingLabel.innerText = 'Error';
  loadingLabel.style.color = 'red';
  loadingMessage.innerText =
    'Oops, something went wrong. Please refresh the page.';
};

//renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;

const rgbeLoader = new RGBELoader(loadingManager);

rgbeLoader.load('/rosendal_plains_1_1k.hdr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;

  const mouse = new THREE.Vector2();
  const intersectionPoint = new THREE.Vector3();
  const planeNormal = new THREE.Vector3();
  const plane = new THREE.Plane();
  const raycaster = new THREE.Raycaster();
  const sphereGeometry = new THREE.SphereGeometry(0.3);

  window.addEventListener('click', function (e) {
    mouse.x = (e.clientX / this.window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersectionPoint);

    const sphere = new THREE.Mesh(
      sphereGeometry,
      new THREE.MeshStandardMaterial({
        metalness: 0.5,
        roughness: 0,
        envMap: texture,
        color: Math.random() * 0xffffff,
      })
    );
    sphere.position.copy(intersectionPoint);
    scene.add(sphere);
  });
});

function animate() {
  const target = controls.target;
  controls.update();
  controls2.target.set(target.x, target.y, target.z);
  controls2.update();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
