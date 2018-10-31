import * as THREE from "three";

export default (sun_orbit, { planetData, hexData } /*updatingTiles*/) => {
  const planet = tempPlanet(planetData);
  const hexMap = hexPlanet();

  sun_orbit.add(planet);

  function hexPlanet(params) {
    let color, geometry;
    const planetGroup = new THREE.Group();
    for (let i = 0; i < hexData.length; i++) {
      const t = hexData[i];
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

      const material = new THREE.MeshBasicMaterial({ color: color });

      // let material = new THREE.MeshLambertMaterial({
      //   color: color,
      //   transparent: true,
      //   opacity: 1
      //   // emissive: color
      // });

      let mesh = new THREE.Mesh(geometry, material.clone());
      mesh.ID = t.id;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // updatingTiles(mesh);
      planetGroup.add(mesh);
    }
    return planetGroup;
  }

  function tempPlanet(data) {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x55ffff });
    let p = new THREE.Mesh(geometry, material);

    p.ID = data.ID;
    p.orbitRadius = data.orbitRadius;
    p.rotSpeed = data.rotSpeed;
    p.rot = data.rot;
    p.orbitSpeed = data.orbitSpeed;
    p.orbit = data.orbit;
    p.position.set(data.position.x, data.position.y, data.position.z);
    p.size = data.size;
    p.data = {
      rot: p.rot,
      rotation: p.rotation,
      orbit: p.orbit,
      position: {
        ...p.position
      }
    };
    return p;
  }

  function reset() {
    sun_orbit.remove(this.object);

    planet.ID = this.object.ID;
    planet.orbitRadius = this.object.orbitRadius;
    planet.rotSpeed = this.object.rotSpeed;
    planet.rot = this.object.rot;
    planet.orbitSpeed = this.object.orbitSpeed;
    planet.orbit = this.object.orbit;
    planet.position.set(
      this.object.position.x,
      this.object.position.y,
      this.object.position.z
    );
    planet.data = {
      rot: this.object.rot,
      rotation: this.object.rotation,
      orbit: this.object.orbit,
      position: {
        ...this.object.position
      }
    };

    this.object = planet;

    sun_orbit.add(this.object);
  }

  function select(newScene) {
    // sun_orbit.remove(this.object);
    hexMap.ID = this.object.ID;
    hexMap.orbitRadius = this.object.orbitRadius;
    hexMap.rotSpeed = this.object.rotSpeed;
    hexMap.rot = this.object.rot;
    hexMap.orbitSpeed = this.object.orbitSpeed;
    hexMap.orbit = this.object.orbit;
    hexMap.position.set(0, 0, 0);
    hexMap.data = {
      rot: this.object.rot,
      rotation: this.object.rotation,
      orbit: this.object.orbit
      // position: {
      //   ...this.object.position
      // }
    };

    this.hexPlanet = hexMap;

    newScene.add(this.hexPlanet);

    return this;
  }

  function update(time) {
    this.object.rot += this.object.data.rotSpeed;
    this.object.rotation.set(0, this.object.data.rot, 0);

    this.object.orbit = this.object.orbit;
    this.object.position.set(
      this.object.data.position.x,
      this.object.data.position.y,
      this.object.data.position.z
    );
  }

  function updateData(data) {
    this.object.data = data;
  }

  return {
    update,
    updateData,
    ID: planet.ID,
    object: planet,
    planet,
    select,
    reset,
    hexMap
  };
};
