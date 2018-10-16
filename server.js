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

// fake DB
const messages = {
  chat1: [],
  mapData: data,
  updatedTiles: []
};

// socket.io server
io.on("connection", socket => {
  socket.on("message.chat1", data => {
    messages["chat1"].push(data);
    socket.broadcast.emit("message.chat1", data);
  });
});

io.on("connection", socket => {
  socket.on("game.map.tile.update", data => {
    // messages["chat1"].push(data);
    console.log(data);
    socket.broadcast.emit("game.map.tile.update", data);
  });
});

nextApp.prepare().then(() => {
  app.get("/messages/:chat", (req, res) => {
    res.json(messages[req.params.chat]);
  });

  app.get("/game/map/data", (req, res) => {
    res.json(messages.mapData);
  });

  app.get("*", (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
