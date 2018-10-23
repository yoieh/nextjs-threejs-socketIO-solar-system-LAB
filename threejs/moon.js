import * as THREE from "three";

export default (moonData, updatingTiles) => {
  let color;
  let moon = new THREE.Group();
  let geometry = new THREE.Geometry();

  for (let i = 0; i < moonData.length; i++) {
    let t = moonData[i];
    // var latLon = t.getLatLon(data.radius);
    geometry = new THREE.Geometry();

    for (let j = 0; j < t.boundary.length; j++) {
      let bp = t.boundary[j];
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

    let onePrecent = 255 / 100;
    let sand = onePrecent * 55;
    let mounten = sand + onePrecent * 65;

    let noise = t.noise;
    if (noise > 0 && noise < sand) {
      color = new THREE.Color("rgb(	237, 201, 175 )");
      // mounten
    } else if (noise > sand && noise < mounten) {
      color = color = new THREE.Color("rgb(	134, 126, 112 )");
    }

    let material = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 1
      // emissive: color
    });

    let mesh = new THREE.Mesh(geometry, material.clone());
    mesh.ID = t.id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    updatingTiles(mesh);

    moon.add(mesh);
  }

  return moon;
};
