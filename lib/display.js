import * as THREE from "three";

const OrbitControls = require("three-orbit-controls")(THREE);

let camera, scene, seenTiles, currentTiles, renderer, controls;
let geometry, material;

let cameraDistance;

let sphere, cube;
let oceanMaterial = [];

export default (window, data) => {
  init(window, data);
  animate();
};

const init = (window, data) => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 5, 1.5).setLength(100);

  var plane = new THREE.GridHelper(100, 10);
  scene.add(plane);

  oceanMaterial.push(
    new THREE.MeshBasicMaterial({ color: 0x0f1e38, transparent: true })
  );

  geometry = new THREE.Geometry();

  for (var i = 0; i < data.tiles.length; i++) {
    var t = data.tiles[i];
    // var latLon = t.getLatLon(data.radius);
    geometry = new THREE.Geometry();

    for (var j = 0; j < t.boundary.length; j++) {
      var bp = t.boundary[j];
      geometry.vertices.push(new THREE.Vector3(bp.x, bp.y, bp.z));
    }

    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(0, 2, 3));
    geometry.faces.push(new THREE.Face3(0, 3, 4));
    if (geometry.vertices.length > 5) {
      geometry.faces.push(new THREE.Face3(0, 4, 5));
    }

    let color;

    if (t.noise > 0 && t.noise < 20) {
      // sand
      color = new THREE.Color("rgb(	237, 201, 175 )");
    } else if (t.noise > 20 && t.noise < 150) {
      // forest
      color = color = new THREE.Color("rgb(	34, 139, 34 )");
    } else if (t.noise > 150 && t.noise < 220) {
      // mounten
      color = color = new THREE.Color("rgb(	134, 126, 112 )");
    } else if (t.noise > 220) {
      // ICE
      color = color = new THREE.Color("rgb(	255, 255, 255 )");
    } else {
      color = color = new THREE.Color("rgb(	0, 105, 148 )"); // 0x0f1e38
    }

    material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true
    });
    // if (t.noise > 20 && t.noise < 50) {
    //   material = new THREE.MeshBasicMaterial({
    //     color: new THREE.Color(1, 0, 0),
    //     transparent: true
    //   });
    // } else if (t.noise > 50) {
    //   material = new THREE.MeshBasicMaterial({
    //     color: new THREE.Color(0, 1, 0),
    //     transparent: true
    //   });
    // } else {
    //   material = new THREE.MeshBasicMaterial({
    //     color: 0x0f1e38,
    //     transparent: true
    //   });
    // }

    material.opacity = 1;

    var mesh = new THREE.Mesh(geometry, material.clone());

    scene.add(mesh);

    data.tiles[i].mesh = mesh;
  }

  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  controls = new OrbitControls(camera, renderer.domElement);

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
};

const animate = () => {
  requestAnimationFrame(animate);
  render();
};

const render = () => {
  renderer.render(scene, camera);
};
