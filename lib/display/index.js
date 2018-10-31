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
let planetsData = [];
let planets = [],
  updatedPlantes = [];

let ambientLight, pointLight, directionalLight;

let planet, planet2, planet3, planet4, planet5, moon, Sphere;

let sun_orbit, planet_orbit, moon_orbit;

let start = false;
let selectedPlanet = false;

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

export const updatePlantsPositions = data => {
  updatedPlantes = data;
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

  let intersects1 = raycaster.intersectObjects(updatingTilesArray);
  for (var i = 0; i < intersects1.length; i++) {
    let obj = intersects1[i].object;

    if (selectedPlanet !== false) {
      obj.material.color.setRGB(1, 0, 0);
      start = true;
      SocketIO.emit("game.map.tile.update", obj.ID);
    }
  }

  let intersects2 = raycaster.intersectObjects(planets);
  for (var i = 0; i < intersects2.length; i++) {
    let obj = intersects2[i].object;
    if (selectedPlanet) {
      planets = planets.map(p => {
        if (p.ID == selectedPlanet.ID) {
          console.log(p.ID, selectedPlanet.ID);
          geometry = new THREE.SphereGeometry(30, 32, 32);
          material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

          let newPlanet = new THREE.Mesh(geometry, material);

          sun_orbit.remove(p);

          newPlanet.ID = p.ID;
          newPlanet.orbitRadius = p.orbitRadius;
          newPlanet.rotSpeed = p.rotSpeed;
          newPlanet.rot = p.rot;
          newPlanet.orbitSpeed = p.orbitSpeed;
          newPlanet.orbit = p.orbit;
          newPlanet.position.set(p.position.x, p.position.y, p.position.z);

          sun_orbit.add(newPlanet);

          return newPlanet;
        } else {
          return p;
        }
      });
    }

    let newPlanet = initPlanet(planetsData[obj.ID], updatingTiles);
    sun_orbit.remove(obj);

    newPlanet.ID = obj.ID;
    newPlanet.orbitRadius = obj.orbitRadius;
    newPlanet.rotSpeed = obj.rotSpeed;
    newPlanet.rot = obj.rot;
    newPlanet.orbitSpeed = obj.orbitSpeed;
    newPlanet.orbit = obj.orbit;
    newPlanet.position.set(obj.position.x, obj.position.y, obj.position.z);

    sun_orbit.add(newPlanet);

    selectedPlanet = newPlanet;

    planets = planets.map(p => {
      if (p.ID == newPlanet.ID) {
        return newPlanet;
      } else {
        return p;
      }
    });
  }
};

const init = (window, data) => {
  planetsData = data.planets;
  let moonData = data.moon;

  let size = 50;

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

  geometry = new THREE.SphereGeometry(50, 32, 32);
  material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  let sun = new THREE.Mesh(geometry, material);

  geometry = new THREE.SphereGeometry(2, 2, 2);
  material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  Sphere = new THREE.Mesh(geometry, material);

  moon = initMoon(data.moon, updatingTiles);

  scene.add(camera);

  sun_orbit = new THREE.Object3D();
  planet_orbit = new THREE.Object3D();
  // moon_orbit = new THREE.Object3D();

  let i = 0;
  planetsData.map((key, i) => {
    // geometry = new THREE.SphereGeometry(30, 32, 32);
    // material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    // let p = new THREE.Mesh(geometry, material);

    // p.ID = key.ID;
    // p.orbitRadius = key.orbitRadius;
    // p.rotSpeed = key.rotSpeed;
    // p.rot = key.rot;
    // p.orbitSpeed = key.orbitSpeed;
    // p.orbit = key.orbit;
    // p.position.set(key.position.x, key.position.y, key.position.z);
    sun_orbit.add(p);
    planets[p.ID] = p;

    var orbit = new THREE.Line(
      new THREE.CircleGeometry(key.orbitRadius, 90),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
      })
    );
    orbit.geometry.vertices.shift();
    orbit.rotation.x = THREE.Math.degToRad(90);
    scene.add(orbit);

    return p;
  });

  scene.add(sun);
  sun.add(sun_orbit);

  // EVENTS.
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("mousedown", onMouseDown, false);
  document.addEventListener("mouseup", onMouseUp, false);
};

const animate = () => {
  requestAnimationFrame(animate);
  update();
  render();
};

let p1r = 300;
let p2r = 100;
let mr = 75;

let pTheta = 0;
let p2Theta = 0;
let mTheta = 0;

let dTheta = (2 * Math.PI) / 1000;

let time, speed;

const update = () => {
  let delta = clock.getDelta(); // seconds.

  updatedPlantes.map(p => {
    let planet = planets[p.ID];
    planet.rot += p.rotSpeed;
    planet.rotation.set(0, p.rot, 0);
    planet.orbit = p.orbit;
    planet.position.set(
      Math.cos(p.orbit) * p.orbitRadius,
      0,
      Math.sin(p.orbit) * p.orbitRadius
    );

    planets[p.ID] = planet;
  });
};

const render = () => {
  stats.begin();

  renderer.render(scene, camera);

  stats.end();
};
