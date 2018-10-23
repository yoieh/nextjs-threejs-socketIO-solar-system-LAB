const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// const { geoVoronoiData } = require("./data/geoVoronoiData");

const data = require("./lib/hexSphere");
// const { getRandomInRangeNoise } = require("./data/geoVoronoiData");

// const { nearestVoronoi, isInside } = require("./lib/voronoi");

// , {smallData}
// let polygons = nearestVoronoi("0, 0", smallData);

const planets = () => {
  let max = 30,
    min = 10,
    planetsArray = [],
    planetHexData = {};
  for (let i = 0, radii = 0; i < 5; i++) {
    const size = Math.floor((Math.random() * (max - min)) / 2) * 2 + min;
    let planet = {
      ID: i,
      orbitRadius: Math.random() * 100 + 100 + radii,
      rotSpeed: 0.005 + Math.random() * 0.01,
      rot: Math.random(),
      orbitSpeed: (0.02 - i * 0.0048) * 0.25,
      orbit: Math.random() * Math.PI * 2
    };
    planet.radii = planet.orbitRadius + size;
    planet.rotSpeed *= Math.random() < 0.1 ? -1 : 1;
    planet.position = {
      x: planet.orbitRadius,
      y: 0,
      z: 0
    };
    radii = planet.orbitRadius + size;

    planetHexData[planet.ID] = data(size);
    planetsArray.push(planet);
  }
  return { planetsArray, planetHexData };
};

const { planetHexData, planetsArray } = planets();

// fake DB
const packages = {
  chat1: [],
  mapData: {
    planet: data(30),
    moon: data(6),
    planets: planetsArray,
    hexData: planetHexData
  },
  updatedTiles: [],
  SOCKET_LIST: {}
};

io.sockets.on("connection", socket => {
  socket.id = Math.random();
  packages.SOCKET_LIST[socket.id] = socket;
});

// socket.io server
io.on("connection", socket => {
  socket.on("message.chat1", data => {
    packages["chat1"].push(data);
    socket.broadcast.emit("message.chat1", data);
  });

  socket.on("game.map.tile.update", data => {
    // packages["chat1"].push(data);
    console.log(data);
    socket.broadcast.emit("game.map.tile.update", data);
  });
});

const update = () => {
  let pack = {};
  for (let i = 0; i < packages.mapData.planets.length; i++) {
    let planet = packages.mapData.planets[i];
    let newPlanet = {
      rot: planet.rot + planet.rotSpeed,
      rotation: { x: 0, y: planet.rot, z: 0 },
      orbit: planet.orbit + planet.orbitSpeed
    };
    newPlanet.position = {
      x: Math.cos(newPlanet.orbit) * planet.orbitRadius,
      y: 0,
      z: Math.sin(newPlanet.orbit) * planet.orbitRadius
    };
    packages.mapData.planets[i] = { ...planet, ...newPlanet };
    pack[planet.ID] = newPlanet;
  }
  setTimeout(socket => {
    for (const i in packages.SOCKET_LIST) {
      const socket = packages.SOCKET_LIST[i];
      socket.emit("game.map.planets.position", pack);
    }

    update();
  }, 1000 / 60);
};

nextApp.prepare().then(() => {
  app.get("/packages/:chat", (req, res) => {
    res.json(packages[req.params.chat]);
  });

  app.get("/game/map/data", (req, res) => {
    res.json(packages.mapData);
  });

  app.get("*", (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

update();
