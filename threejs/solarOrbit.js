import * as THREE from "three";

export default (sun /*updatingTiles*/) => {
  const solarOrbit = new THREE.Object3D();

  sun.add(solarOrbit);

  function update(time) {}

  return { update, object: solarOrbit };
};
