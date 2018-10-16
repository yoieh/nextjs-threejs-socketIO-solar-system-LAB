import * as THREE from "three";

const OrbitControls = require("three-orbit-controls")(THREE);

let SocketIO;
let display;

let camera, scene, seenTiles, currentTiles, renderer, controls;
let geometry, material;

let raycaster,
  mouse = { x: 0, y: 0 };
let oceanMaterial = [];

let updatingTiles = [];

let ambientLight, pointLight, directionalLight;

export default (window, data, socket) => {
  SocketIO = socket;

  init(window, data);
  animate();
};

export const updateTile = data => {
  updatingTiles.map(t => t.ID == data && t.material.color.setRGB(1, 0, 0));
};

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

const onMouseUp = e => {
  e.preventDefault();

  var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  var raycaster = new THREE.Raycaster(
    camera.position,
    vector.sub(camera.position).normalize()
  );
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(updatingTiles);
  for (var i = 0; i < intersects.length; i++) {
    let obj = intersects[i].object;
    obj.material.color.setRGB(1, 0, 0);
    SocketIO.emit("game.map.tile.update", obj.ID);
  }
};

const init = (window, data) => {
  scene = new THREE.Scene();
  ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  pointLight = new THREE.PointLight(0xffffff, 2.0, 600);
  let pointLightHelper = new THREE.PointLightHelper(pointLight);
  // let directionalLightHelper = new THREE.DirectionalLightHelper(10, 0xffffff);

  let mesh;

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 5, 1.5).setLength(100);

  var plane = new THREE.GridHelper(100, 10);
  scene.add(plane);

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

    // LIGHTS!!!!!!!!!!!!!!
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    let color;

    let onePrecent = 255 / 100;

    let water = onePrecent * 50;
    let sand = water + onePrecent * 3;
    let forest = sand + onePrecent * 23;
    let mounten = forest + onePrecent * 12;
    let ice = mounten + onePrecent * 12;

    // console.log({ water, sand, forest, mounten, ice });

    let noise = t.noise;
    // water
    if (noise > 0 && noise < water) {
      color = color = new THREE.Color("rgb(	0, 105, 148 )"); // 0x0f1e38
      // sand
    } else if (noise > water && noise < sand) {
      color = new THREE.Color("rgb(	237, 201, 175 )");
      // forest
    } else if (noise > sand && noise < forest) {
      color = color = new THREE.Color("rgb(	34, 139, 34 )");
      // mounten
    } else if (noise > forest && noise < mounten) {
      color = color = new THREE.Color("rgb(	134, 126, 112 )");
      // ICE
    } else if (noise > mounten && noise < ice) {
      color = color = new THREE.Color("rgb(	255, 255, 255 )");
    }

    material = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 1
      // emissive: color
    });

    mesh = new THREE.Mesh(geometry, material.clone());
    mesh.ID = data.tiles[i].id;

    scene.add(mesh);
    updatingTiles.push(mesh);
  }
  // directionalLight.target = mesh;
  // directionalLight.add(directionalLightHelper);
  // scene.add(directionalLight);
  pointLight.position.set(100, 0, 0);

  scene.add(pointLight);
  scene.add(pointLightHelper);

  scene.add(ambientLight);

  renderer = new THREE.WebGLRenderer();
  controls = new OrbitControls(camera, renderer.domElement);

  renderer.setSize(window.innerWidth, window.innerHeight);
  display = document.body.appendChild(renderer.domElement);
  display.setAttribute("id", "display");
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("mouseup", onMouseUp, false);
};

const animate = () => {
  requestAnimationFrame(animate);
  scene.rotation.y -= 0.001;
  render();
};

const render = () => {
  renderer.render(scene, camera);
};
