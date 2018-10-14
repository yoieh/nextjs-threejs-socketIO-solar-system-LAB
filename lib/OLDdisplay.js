// import { THREE } from "three";

const THREE = require("three");

var camera, cameraDistance, scene, renderer;
var geometry, material, mesh;

let seenTiles, currentTiles;
var oceanMaterial = [];

export default (window, data) => {
  init(window, data);
  animate();
};

function init(window, data) {
  cameraDistance = 65;
  camera = new THREE.PerspectiveCamera(
    cameraDistance,
    window.width / window.height,
    1,
    200
  );
  camera.position.z = -cameraDistance;

  scene = new THREE.Scene();
  // oceanMaterial.push(
  //   new THREE.MeshBasicMaterial({ color: 0x0f1e38, transparent: true })
  // );

  // for (var i = 0; i < data.tiles.length; i++) {
  //   var t = data.tiles[i];
  //   // var latLon = t.getLatLon(data.radius);

  //   var geometry = new THREE.Geometry();

  //   for (var j = 0; j < t.boundary.length; j++) {
  //     var bp = t.boundary[j];
  //     geometry.vertices.push(new THREE.Vector3(bp.x, bp.y, bp.z));
  //   }

  //   geometry.faces.push(new THREE.Face3(0, 1, 2));
  //   // geometry.faces.push(new THREE.Face3(0, 2, 3));
  //   // geometry.faces.push(new THREE.Face3(0, 3, 4));
  //   // if (geometry.vertices.length > 5) {
  //   //   geometry.faces.push(new THREE.Face3(0, 4, 5));
  //   // }

  //   console.log(geometry);

  //   // material = oceanMaterial[Math.floor(Math.random() * oceanMaterial.length)];
  //   material = new THREE.MeshNormalMaterial();
  //   material.opacity = 1;
  //   var mesh = new THREE.Mesh(geometry, material.clone());
  //   console.log(mesh);
  //   scene.add(mesh);

  //   data.tiles[i].mesh = mesh;
  // }

  // seenTiles = {};

  // currentTiles = data.tiles.slice().splice(0, 12);
  // // console.log(currentTiles);
  // currentTiles.forEach(function(item) {
  //   seenTiles[item.toString()] = 1;
  //   item.mesh.material.opacity = 1;
  // });

  // geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  // material = new THREE.MeshNormalMaterial();

  // mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  var geometry = new THREE.Geometry();

  geometry.vertices.push(
    new THREE.Vector3(-10, 10, 0),
    new THREE.Vector3(-10, -10, 0),
    new THREE.Vector3(10, -10, 0)
  );

  geometry.faces.push(new THREE.Face3(0, 1, 2));

  geometry.computeBoundingSphere();

  // var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

  // var mesh = new THREE.Mesh(geometry, material);

  // scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

var startTime = Date.now();
var lastTime = Date.now();
var cameraAngle = -Math.PI / 1.5;

function animate() {
  var dt = Date.now() - lastTime;

  var rotateCameraBy = (2 * Math.PI) / (200000 / dt);
  cameraAngle += rotateCameraBy;

  lastTime = Date.now();

  camera.position.x = cameraDistance * Math.cos(cameraAngle);
  camera.position.y = Math.sin(cameraAngle) * 10;
  camera.position.z = cameraDistance * Math.sin(cameraAngle);
  camera.lookAt(scene.position);

  renderer.render(scene, camera);

  var nextTiles = [];

  // currentTiles.forEach(function(item) {
  //   item.neighbors.forEach(function(neighbor) {
  //     if (!seenTiles[neighbor.toString()]) {
  //       neighbor.mesh.material.opacity = 1;
  //       nextTiles.push(neighbor);
  //       seenTiles[neighbor] = 1;
  //     }
  //   });
  // });

  currentTiles = nextTiles;

  requestAnimationFrame(animate);
}
