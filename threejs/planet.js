import * as THREE from "three";

export default (sun_orbit, planetData /*updatingTiles*/) => {
  let color;
  let planetGroup = new THREE.Group();
  let geometry = new THREE.Geometry();

  const planet = tempPlanet(planetData);

  sun_orbit.add(planet);

  const hexPlanet = () => {
    for (let i = 0; i < planetData.length; i++) {
      const t = planetData[i];
      const noise = t.noise;

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

      const water = onePrecent * 50;
      const sand = water + onePrecent * 3;
      const forest = sand + onePrecent * 23;
      const ice = mounten + onePrecent * 12;
      const mounten = forest + onePrecent * 12;

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

      planetGroup.add(mesh);
    }
  };

  function tempPlanet(key) {
    const geometry = new THREE.SphereGeometry(30, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    let p = new THREE.Mesh(geometry, material);

    p.ID = key.ID;
    p.orbitRadius = key.orbitRadius;
    p.rotSpeed = key.rotSpeed;
    p.rot = key.rot;
    p.orbitSpeed = key.orbitSpeed;
    p.orbit = key.orbit;
    p.position.set(key.position.x, key.position.y, key.position.z);
    p.data = {
      rot: p.rot,
      rotation: p.rotation,
      orbit: p.orbit,
      position: {
        ...p.position
      }
    };
    p.lastData = { ...p.data };
    return p;
  }

  function update(time) {
    planet.rot += planet.data.rotSpeed;
    planet.rotation.set(0, planet.data.rot, 0);

    planet.orbit = planet.orbit;
    planet.position.set(
      planet.data.position.x,
      planet.data.position.y,
      planet.data.position.z
    );

    planet.lastData = planet.data;
  }

  function updateData(data) {
    planet.data = data;
  }

  return { update, updateData, ID: planet.ID, object: planet };
};
