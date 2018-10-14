const { geoEquirectangular, voronoi } = require("d3");

exports.nearestVoronoi = (location, points) => {
  let nearest = {};
  const projection = geoEquirectangular();

  location = location && location.split(/,\s?/);

  let test = points.map(point => {
    let projected = projection([point[0], point[1]]);
    return [projected[0], projected[1]];
  });
  let myVoronoi = voronoi(); //.extent([[-1, -1], [960 + 1, 500 + 1]]);
  let diagram = myVoronoi(test),
    polygons = diagram.polygons();
  return polygons;

  // myVoronoi.forEach(region => {
  //   if (isInside(projection([location[1], location[0]]), region)) {
  //     nearest = {
  //       point: region.point[2],
  //       region
  //     };
  //   }
  // });

  // if (nearest === {}) throw new Error("Nearest not findable");
  // else return nearest;
};

exports.isInside = (point, polygon) => {
  let x = Number(point[0]),
    y = Number(point[1]);
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i][0],
      yi = polygon[i][1];
    let xj = polygon[j][0],
      yj = polygon[j][1];

    let intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
};
