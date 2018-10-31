import * as THREE from "three";

export default (scene /*updatingTiles*/) => {
  // let color;
  // let planetGroup = new THREE.Group();
  // let geometry = new THREE.Geometry();

  const geometry = new THREE.SphereGeometry(80, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(geometry, material);

  scene.add(sun);

  function update(time) {}

  return { update, object: sun };
};
