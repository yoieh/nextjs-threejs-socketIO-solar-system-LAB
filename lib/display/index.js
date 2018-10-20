import * as THREE from "three";
import Stats from "stats-js";

import initPlanet from "./planet";
import initMoon from "./moon";

const TWEEN = require("@tweenjs/tween.js");
let stats;

var AU = 149597871; // Astronomical unit in kilometers

const OrbitControls = require("three-orbit-controls")(THREE);

let SocketIO;
let display;

let camera, scene, scene2, seenTiles, currentTiles, renderer, controls;
let geometry, material;

let raycaster,
  mouse = { x: 0, y: 0 };
let oceanMaterial = [];

let updatingTilesArray = [];

let ambientLight, pointLight, directionalLight;

let planet, moon;

let scene_orbit, planet_orbit, moon_orbit;

let start = false;

let container,
  clock = new THREE.Clock();
// keyboard = new THREEx.KeyboardState();

let player,
  cameraControls,
  lookAround = false;

export default (window, data, socket) => {
  SocketIO = socket;

  init(window, data);
  animate();
};

export const updateTile = data => {
  updatingTilesArray.map(t => t.ID == data && t.material.color.setRGB(1, 0, 0));
};

const updatingTiles = tile => updatingTilesArray.push(tile);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
}

function onMouseMove(e) {
  e.preventDefault();

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event) {
  event.preventDefault();
  lookAround = true;
  // cameraControls.center.copy(moon.position);
  // document.addEventListener("mouseup", onMouseUp, false);
}

const onMouseUp = e => {
  e.preventDefault();
  lookAround = false;
  // document.removeEventListener("mouseup", onMouseUp);

  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  var raycaster = new THREE.Raycaster(
    camera.position,
    vector.sub(camera.position).normalize()
  );
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(updatingTilesArray);
  for (var i = 0; i < intersects.length; i++) {
    let obj = intersects[i].object;
    obj.material.color.setRGB(1, 0, 0);
    start = true;
    SocketIO.emit("game.map.tile.update", obj.ID);
  }
};

const init = (window, data) => {
  let planetData = data.planet;
  let moonData = data.moon;

  // SCENE
  scene = new THREE.Scene();

  // CAMERA
  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  // camera = new THREE.OrthographicCamera(
  //   window.innerWidth / -2,
  //   window.innerWidth / 2,
  //   window.innerHeight / 2,
  //   window.innerHeight / -2,
  //   -1000,
  //   1000
  // );

  camera.position.set(0, 5, 1.5).setLength(500);
  // scene.add(camera);

  // RENDERER
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  display = document.body.appendChild(renderer.domElement);
  display.setAttribute("id", "display");

  // CONTROLS
  cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, 0, 0);
  // cameraControls.enablePan = false;
  // cameraControls.maxDistance = 4000;
  // cameraControls.minDistance = 1 / AU;
  // cameraControls.update();

  // console.log(cameraControls);

  // STATS
  stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0px";
  stats.domElement.style.top = "0px";
  document.body.appendChild(stats.domElement);

  // LIGHT
  ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  pointLight = new THREE.PointLight(0xffffff, 2.0, 1000);
  let pointLightHelper = new THREE.PointLightHelper(pointLight);
  pointLight.position.set(0, 0, 0);
  pointLight.castShadow = true;
  scene.add(pointLight);
  scene.add(pointLightHelper);
  scene.add(ambientLight);

  planet = initPlanet(data.planet, updatingTiles);
  moon = initMoon(data.moon, updatingTiles);

  scene.add(camera);

  scene_orbit = new THREE.Object3D();
  planet_orbit = new THREE.Object3D();
  // moon_orbit = new THREE.Object3D();

  scene.add(scene_orbit);
  scene_orbit.add(planet);
  planet.add(planet_orbit);
  planet.position.set(0, 0, 0);
  planet_orbit.add(moon);
  moon.position.set(0, 0, 0);

  let plane = new THREE.GridHelper(100, 10);
  scene.add(plane);
  // camera.rotation.set(Math.PI / 2, 0, 0);

  // EVENTS.
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("mousedown", onMouseDown, false);
  document.addEventListener("mouseup", onMouseUp, false);
};

const rotate = (heading, rotate) => {
  const radians = heading > 0 ? heading : 2 * Math.PI + heading;
  const degrees = THREE.Math.radToDeg(radians);
  const degreesRounded = Math.floor(degrees);

  if (degrees <= rotate) {
    return (degrees + (360 - rotate)) * (Math.PI / 180);
  } else {
    return heading - rotate * (Math.PI / 180);
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  update();
  render();
};

let sr = 100;
let pr = 50;
let theta = 0;
let dTheta = (2 * Math.PI) / 1000;

let time, speed;

const update = () => {
  let delta = clock.getDelta(); // seconds.
  var moveDistance = 200 * delta; // 200 pixels per second
  var rotateAngle = (Math.PI / 2) * delta; // pi/2 radians (90 degrees) per second

  // TWEEN.update();

  planet.rotation.y = rotate(planet.rotation.y, 0.04);
  moon.rotation.y = rotate(moon.rotation.y, 0.2);

  theta -= dTheta;
  // let x = (moon.position.x = r * Math.cos(theta));
  // let z = (moon.position.z = r * Math.sin(theta));
  // let y = moon.position.y;
  scene_orbit.position.x = sr * Math.cos(theta);
  scene_orbit.position.z = sr * Math.sin(theta);

  planet_orbit.position.x = pr * Math.cos(theta);
  planet_orbit.position.z = pr * Math.sin(theta);

  // if (!lookAround) {
  cameraControls.target.set(
    planet_orbit.position.x,
    planet_orbit.position.y,
    planet_orbit.position.z
  );
  cameraControls.update();

  // }
};

const render = () => {
  stats.begin();

  renderer.render(scene, camera);

  stats.end();
};
