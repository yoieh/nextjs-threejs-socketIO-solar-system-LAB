import {
  geoEquirectangular,
  geoMercator,
  voronoi,
  geoPath,
  select,
  range
} from "d3";
import * as topojson from "topojson-client";

const drawCell = (cell, ctx) => {
  if (cell && cell[0] && cell[0][0] && cell[0][1]) {
    ctx.moveTo(cell[0][0], cell[0][1]);
    for (var j = 0, m = cell.length; j < m; ++j) {
      if (cell[j]) ctx.lineTo(cell[j][0], cell[j][1]);
    }
    ctx.closePath();
    return true;
  } else {
    return false;
  }
};

export const drawCanvasMap = (location, polygons) => {
  const body = select("#display");

  const canvas = body
    .append("canvas")
    .attr("width", 960)
    .attr("height", 500);

  const width = canvas.property("width");
  const height = canvas.property("height");

  const projection = geoEquirectangular([
    location.split(/,\s?/)[0],
    location.split(/,\s?/)[1]
  ]);

  console.log(polygons);
  // const projection = geoMercator([
  //   location.split(/,\s?/)[0],
  //   location.split(/,\s?/)[1]
  // ]);

  const ctx = canvas.node().getContext("2d");

  // let boundaries = require("./50m.json");

  // const world = require("../data/50m.json");
  // let land = topojson.feature(world, world.objects.countries);

  // let airportProjected = projection([
  //   airport.point.longitude,
  //   airport.point.latitude
  // ]);

  const path = geoPath()
    .projection(projection)
    .context(ctx);

  // ctx.beginPath(), path(land), (ctx.strokeStyle = "#000"), ctx.stroke();

  ctx.beginPath(), path(polygons), (ctx.strokeStyle = "#0F0"), ctx.stroke();

  ctx.beginPath();
  for (var i = 0, n = polygons.length; i < n; ++i) drawCell(polygons[i], ctx);
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // ctx.beginPath();
  // path(topojson.feature(boundaries, boundaries.objects.countries))

  // ctx.stroke();

  // ctx.fillRect(airportProjected[0] - 5, airportProjected[1] - 5, 10, 10);

  return canvas;
};
