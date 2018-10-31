import * as THREE from "three";
import SceneSubject from "./SceneSubject";
import GeneralLights from "./GeneralLights";
const OrbitControls = require("three-orbit-controls")(THREE);

import Planet from "./planet";
import Sun from "./sun";
import SolarOrbit from "./solarOrbit";

export default (canvas, packages) => {
  let selected = false;
  const clock = new THREE.Clock();
  const origin = new THREE.Vector3(0, 0, 0);

  const screenDimensions = {
    width: canvas.width,
    height: canvas.height
  };

  const mousePosition = {
    x: 0,
    y: 0
  };

  const scene = buildScene();
  const scene2 = buildScene();

  const renderer = buildRender(screenDimensions);
  const camera = buildCamera(screenDimensions);
  const cameraControls = buildCameraControls(camera, renderer);

  // scene.add(camera);

  const sun = new Sun(scene);

  const solar_orbit = new SolarOrbit(scene);
  const planets = createPlanets(solar_orbit.object, {
    planetData: packages.planets,
    hexData: packages.hexData
  });

  const planetsObjs = planets.map(p => p.object);

  sun.object.add(solar_orbit.object);

  function buildScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000");

    return scene;
  }

  function buildRender({ width, height }) {
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(DPR);
    renderer.setSize(width, height);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // renderer.gammaInput = true;
    // renderer.gammaOutput = true;

    return renderer;
  }

  function buildCamera({ width, height }) {
    const aspectRatio = width / height;
    const fieldOfView = 60;
    const nearPlane = 1;
    const farPlane = 10000;
    const camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );

    return camera;
  }

  function buildCameraControls(camera, renderer) {
    const cameraControls = new OrbitControls(camera, renderer.domElement);
    // cameraControls.target.set(0, 0, 0);
    camera.position.set(0, 20, 100);

    cameraControls.update();
    cameraControls.enablePan = false;
    return cameraControls;
  }

  function createPlanets(sun_orbit, { planetData, hexData }) {
    return planetData.map(
      p =>
        new Planet(sun_orbit, {
          planetData: p,
          hexData: hexData[p.ID]
        })
    );
  }

  function update() {
    const elapsedTime = clock.getElapsedTime();
    cameraControls.update();

    if (selected) {
      // selected.update(elapsedTime);

      renderer.render(scene2, camera);
    } else {
      planets.forEach(p => {
        p.update(elapsedTime);
      });
      renderer.render(scene, camera);
    }
  }

  // function updateCameraPositionRelativeToMouse() {
  //   camera.position.x += (mousePosition.x * 0.01 - camera.position.x) * 0.01;
  //   camera.position.y += (-(mousePosition.y * 0.01) - camera.position.y) * 0.01;
  //   camera.lookAt(origin);
  // }

  function onWindowResize() {
    const { width, height } = canvas;

    screenDimensions.width = width;
    screenDimensions.height = height;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  function onMouseMove(x, y) {
    mousePosition.x = x;
    mousePosition.y = y;
  }

  function onMouseUp(x, y) {
    const vector = new THREE.Vector3(mousePosition.x, mousePosition.y, 0.5);
    const raycaster = new THREE.Raycaster(
      camera.position,
      vector.sub(camera.position).normalize()
    );
    raycaster.setFromCamera(mousePosition, camera);

    // let intersects = raycaster.intersectObjects(solar_orbit);
    let intersects = raycaster.intersectObjects(planetsObjs);
    if (intersects.length > 0) {
      const palnet = planets.find(p => p.ID === intersects[0].object.ID);

      for (const planet of planets) {
        if (planet.object.ID !== intersects[0].object.ID) {
          planet.reset();
        } else {
          selected = palnet.select(scene2);
        }
      }
    }
  }

  function updateData(data) {
    planets.map(p => p.updateData(data[p.ID]));
  }

  return {
    update,
    onWindowResize,
    onMouseMove,
    onMouseUp,
    updateData
  };
};
