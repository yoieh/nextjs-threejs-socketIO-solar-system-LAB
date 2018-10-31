import * as THREE from "three";

export default (planet, screenDimensions) => {
  const camrasOrbit = new THREE.Object3D();

  const planetCamera = buildPlanetCamera(screenDimensions);

  camrasOrbit.position.set(0, 0, 0);

  camrasOrbit.add(planetCamera);

  planet.add(camrasOrbit);

  planetCamera.lookAt(planet.position);
  // const helper = new THREE.CameraHelper(planetCamera);

  function buildPlanetCamera({ width, height }) {
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

  function update(time) {
    camrasOrbit.position.x = planet.position.x + 100 * Math.cos(0.3 * time);
    camrasOrbit.position.z = planet.position.z + 100 * Math.sin(0.3 * time);
    camrasOrbit.position.setLength(100);

    planetCamera.lookAt(planet.position);
  }

  return { update, planetCamera /*helper*/ };
};
