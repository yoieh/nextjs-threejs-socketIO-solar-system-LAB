const SimplexNoise = require("simplex-noise");

const simplex = new SimplexNoise();

const Hexasphere = require("hexasphere.js");

var radius = 30; // Radius used to calculate position of tiles
var subDivisions = 30; // Divide each edge of the icosohedron into this many segments
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

const terrain = [];

let inc = 0.03;
let d = radius - radius * 2;
let xoff = 0;
for (let x = d; x < radius; x++) {
  let yoff = 0;

  for (let y = d; y < radius; y++) {
    let zoff = 0;

    for (let z = d; z < radius; z++) {
      let r = simplex.noise3D(xoff, yoff, zoff) * 255;
      terrain[`${x}${y}${z}`] = r;
      zoff += inc;
    }
    yoff += inc;
  }
  xoff += inc;
}

obj.tiles = obj.tiles.map((t, i) => {
  return {
    ...t,
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
    noise:
      terrain[
        `${Math.round(t.centerPoint.x)}${Math.round(
          t.centerPoint.y
        )}${Math.round(t.centerPoint.z)}`
      ]
  };
});

module.exports = obj; //hexasphere.toJson(); // export it as a json object
