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
let planets = [];

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

    console.log(selectedPlanet, obj);
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
  planetsData = [
    data.planet,
    data.planet,
    data.planet,
    data.planet,
    data.planet
  ];
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

  // planet = new THREE.Mesh(geometry, material); //initPlanet(data.planet, updatingTiles);
  // planet2 = new THREE.Mesh(geometry, material); //initPlanet(data.planet, updatingTiles);
  // planet3 = new THREE.Mesh(geometry, material);
  // planet4 = new THREE.Mesh(geometry, material);
  // planet5 = new THREE.Mesh(geometry, material);

  moon = initMoon(data.moon, updatingTiles);

  planets = [{}, {}, {}, {}, {}];

  scene.add(camera);

  sun_orbit = new THREE.Object3D();
  planet_orbit = new THREE.Object3D();
  // moon_orbit = new THREE.Object3D();

  let radii = 0;
  let i = 0;
  planets = planets.map((key, i) => {
    geometry = new THREE.SphereGeometry(30, 32, 32);

    material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    let p = new THREE.Mesh(geometry, material);
    p.ID = i;
    p.orbitRadius = Math.random() * 100 + 100 + radii;
    p.rotSpeed = 0.005 + Math.random() * 0.01;
    p.rotSpeed *= Math.random() < 0.1 ? -1 : 1;
    p.rot = Math.random();
    p.orbitSpeed = (0.02 - i * 0.0048) * 0.25;
    p.orbit = Math.random() * Math.PI * 2;
    p.position.set(p.orbitRadius, 0, 0);
    radii = p.orbitRadius + size;
    i = i++;
    sun_orbit.add(p);

    var orbit = new THREE.Line(
      new THREE.CircleGeometry(p.orbitRadius, 90),
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

  // scene.add(scene_orbit);
  // scene_orbit.add(planet);
  // planet.add(planet_orbit);
  // planet.position.set(0, 0, 0);
  // planet_orbit.add(moon);
  // moon.position.set(0, 0, 0);

  // scene.add(Sphere);
  scene.add(sun);
  sun.add(sun_orbit);
  // sun_orbit.add(planets[1]);
  // sun_orbit.add(planets[2]);

  // planet.add(planet_orbit);
  // planet.position.set(0, 0, 0);
  // planet_orbit.add(moon);
  // moon.position.set(0, 0, 0);

  // let plane = new THREE.GridHelper(1000, 100);
  // scene.add(plane);
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

  for (var p in planets) {
    let planet = planets[p];
    planet.rot += planet.rotSpeed;
    planet.rotation.set(0, planet.rot, 0);
    planet.orbit += planet.orbitSpeed;
    planet.position.set(
      Math.cos(planet.orbit) * planet.orbitRadius,
      0,
      Math.sin(planet.orbit) * planet.orbitRadius
    );
  }
  // TWEEN.update();

  // planet.rotation.y -= (delta * 5 * Math.PI) / 180;
  // moon.rotation.y -= (delta * 5 * Math.PI) / 180;

  // pTheta -= dTheta;
  // p2Theta -= dTheta;
  // mTheta -= dTheta;

  // let x = (moon.position.x = r * Math.cos(theta));
  // let z = (moon.position.z = r * Math.sin(theta));
  // let y = moon.position.y;

  // planet.position.x = p1r * Math.cos(pTheta);
  // planet.position.z = p1r * Math.sin(pTheta);

  // planet2.position.x = p2r * Math.cos(p2Theta);
  // planet2.position.z = p2r * Math.sin(p2Theta);

  // moon.position.x = mr * Math.cos(mTheta);
  // moon.position.z = mr * Math.sin(mTheta);

  // Sphere.position.x = sun_orbit.position.x;
  // Sphere.position.y = sun_orbit.position.y;
  // Sphere.position.z = sun_orbit.position.z;

  // if (!lookAround) {
  // cameraControls.target.set(
  //   sun_orbit.position.x,
  //   sun_orbit.position.y,
  //   sun_orbit.position.z
  // );
  // cameraControls.update();

  // }
};

const render = () => {
  stats.begin();

  renderer.render(scene, camera);

  stats.end();
};
