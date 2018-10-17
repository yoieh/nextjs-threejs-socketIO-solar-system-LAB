const FastSimplexNoise = require("fast-simplex-noise");

const noiseGen = new FastSimplexNoise.default({
  frequency: 0.03,
  max: 255,
  min: 0,
  octaves: 3
});

const Hexasphere = require("hexasphere.js");

module.exports = (radius = 10) => {
  // var radius = 30; // Radius used to calculate position of tiles
  var subDivisions = radius / 2; // Divide each edge of the icosohedron into this many segments
  var tileWidth = 1.0; // Add padding (1.0 = no padding; 0.1 = mostly padding)

  var hexasphere = new Hexasphere(radius, subDivisions, tileWidth);

  const tiles = [];
  // for (var i = 0; i < hexasphere.tiles.length; i++) {
  // const t = hexasphere.tiles[i];
  // hexasphere.tiles[i].centerPoint contains x,y,z of the tile
  // hexasphere.tiles[i].boundary contains an ordered array of the boundary points
  // hexasphere.tiles[i].neighbors contains a list of all the neighboring tiles
  // }

  const obj = JSON.parse(hexasphere.toJson());

  return (obj.tiles = obj.tiles.map((t, i) => {
    return {
      ...t,
      id: i,
      neighborIds: hexasphere.tiles[i].neighborIds,
      neighbors: hexasphere.tiles[i].neighbors.map(n => ({
        centerPoint: {
          x: n.centerPoint.x,
          y: n.centerPoint.y,
          z: n.centerPoint.z
        },
        boundary: {
          x: n.boundary.x,
          y: n.boundary.y,
          z: n.boundary.z
        }
      })),
      noise: noiseGen.spherical3D(
        radius,
        t.centerPoint.x,
        t.centerPoint.y,
        t.centerPoint.z
      )
    };
  }));

  return;
};
