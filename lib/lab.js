const THREE = require("three");

function generatePlanetMesh(
  icosahedronSubdivision,
  topologyDistortionRate,
  random,
  action
) {
  var mesh;
  mesh = generateSubdividedIcosahedron(icosahedronSubdivision);
  var totalDistortion = Math.ceil(mesh.edges.length * topologyDistortionRate);
  var remainingIterations = 6;

  var iterationDistortion = Math.floor(totalDistortion / remainingIterations);
  totalDistortion -= iterationDistortion;
  distortMesh(mesh, iterationDistortion, random, action);
  relaxMesh(mesh, 0.5, action);
  --remainingIterations;

  if (remainingIterations > 0) action.loop(1 - remainingIterations / 6);

  var initialIntervalIteration = action.intervalIteration;

  var averageNodeRadius = Math.sqrt((4 * Math.PI) / mesh.nodes.length);
  var minShiftDelta = (averageNodeRadius / 50000) * mesh.nodes.length;
  var maxShiftDelta = (averageNodeRadius / 50) * mesh.nodes.length;

  var priorShift;
  var currentShift = relaxMesh(mesh, 0.5, action);
  priorShift = currentShift;
  currentShift = relaxMesh(mesh, 0.5, action);
  var shiftDelta = Math.abs(currentShift - priorShift);
  if (
    shiftDelta >= minShiftDelta &&
    action.intervalIteration - initialIntervalIteration < 300
  ) {
    action.loop(
      Math.pow(
        Math.max(
          0,
          (maxShiftDelta - shiftDelta) / (maxShiftDelta - minShiftDelta)
        ),
        4
      )
    );
  }

  for (var i = 0; i < mesh.faces.length; ++i) {
    var face = mesh.faces[i];
    var p0 = mesh.nodes[face.n[0]].p;
    var p1 = mesh.nodes[face.n[1]].p;
    var p2 = mesh.nodes[face.n[2]].p;
    face.centroid = calculateFaceCentroid(p0, p1, p2).normalize();
  }

  for (var i = 0; i < mesh.nodes.length; ++i) {
    var node = mesh.nodes[i];
    var faceIndex = node.f[0];
    for (var j = 1; j < node.f.length - 1; ++j) {
      faceIndex = findNextFaceIndex(mesh, i, faceIndex);
      var k = node.f.indexOf(faceIndex);
      node.f[k] = node.f[j];
      node.f[j] = faceIndex;
    }
  }

  return mesh;
}

function generateIcosahedron() {
  var phi = (1.0 + Math.sqrt(5.0)) / 2.0;
  var du = 1.0 / Math.sqrt(phi * phi + 1.0);
  var dv = phi * du;

  let nodes = [
    { p: new THREE.Vector3(0, +dv, +du), e: [], f: [] },
    { p: new THREE.Vector3(0, +dv, -du), e: [], f: [] },
    { p: new THREE.Vector3(0, -dv, +du), e: [], f: [] },
    { p: new THREE.Vector3(0, -dv, -du), e: [], f: [] },
    { p: new THREE.Vector3(+du, 0, +dv), e: [], f: [] },
    { p: new THREE.Vector3(-du, 0, +dv), e: [], f: [] },
    { p: new THREE.Vector3(+du, 0, -dv), e: [], f: [] },
    { p: new THREE.Vector3(-du, 0, -dv), e: [], f: [] },
    { p: new THREE.Vector3(+dv, +du, 0), e: [], f: [] },
    { p: new THREE.Vector3(+dv, -du, 0), e: [], f: [] },
    { p: new THREE.Vector3(-dv, +du, 0), e: [], f: [] },
    { p: new THREE.Vector3(-dv, -du, 0), e: [], f: [] }
  ];

  let edges = [
    { n: [0, 1], f: [] },
    { n: [0, 4], f: [] },
    { n: [0, 5], f: [] },
    { n: [0, 8], f: [] },
    { n: [0, 10], f: [] },
    { n: [1, 6], f: [] },
    { n: [1, 7], f: [] },
    { n: [1, 8], f: [] },
    { n: [1, 10], f: [] },
    { n: [2, 3], f: [] },
    { n: [2, 4], f: [] },
    { n: [2, 5], f: [] },
    { n: [2, 9], f: [] },
    { n: [2, 11], f: [] },
    { n: [3, 6], f: [] },
    { n: [3, 7], f: [] },
    { n: [3, 9], f: [] },
    { n: [3, 11], f: [] },
    { n: [4, 5], f: [] },
    { n: [4, 8], f: [] },
    { n: [4, 9], f: [] },
    { n: [5, 10], f: [] },
    { n: [5, 11], f: [] },
    { n: [6, 7], f: [] },
    { n: [6, 8], f: [] },
    { n: [6, 9], f: [] },
    { n: [7, 10], f: [] },
    { n: [7, 11], f: [] },
    { n: [8, 9], f: [] },
    { n: [10, 11], f: [] }
  ];

  let faces = [
    { n: [0, 1, 8], e: [0, 7, 3] },
    { n: [0, 4, 5], e: [1, 18, 2] },
    { n: [0, 5, 10], e: [2, 21, 4] },
    { n: [0, 8, 4], e: [3, 19, 1] },
    { n: [0, 10, 1], e: [4, 8, 0] },
    { n: [1, 6, 8], e: [5, 24, 7] },
    { n: [1, 7, 6], e: [6, 23, 5] },
    { n: [1, 10, 7], e: [8, 26, 6] },
    { n: [2, 3, 11], e: [9, 17, 13] },
    { n: [2, 4, 9], e: [10, 20, 12] },
    { n: [2, 5, 4], e: [11, 18, 10] },
    { n: [2, 9, 3], e: [12, 16, 9] },
    { n: [2, 11, 5], e: [13, 22, 11] },
    { n: [3, 6, 7], e: [14, 23, 15] },
    { n: [3, 7, 11], e: [15, 27, 17] },
    { n: [3, 9, 6], e: [16, 25, 14] },
    { n: [4, 8, 9], e: [19, 28, 20] },
    { n: [5, 11, 10], e: [22, 29, 21] },
    { n: [6, 9, 8], e: [25, 28, 24] },
    { n: [7, 10, 11], e: [26, 29, 27] }
  ];

  for (var i = 0; i < edges.length; ++i)
    for (var j = 0; j < edges[i].n.length; ++j) nodes[j].e.push(i);

  for (var i = 0; i < faces.length; ++i)
    for (var j = 0; j < faces[i].n.length; ++j) nodes[j].f.push(i);

  for (var i = 0; i < faces.length; ++i)
    for (var j = 0; j < faces[i].e.length; ++j) edges[j].f.push(i);

  return { nodes: nodes, edges: edges, faces: faces };
}

function generateSubdividedIcosahedron(degree) {
  var icosahedron = generateIcosahedron();

  var nodes = [];
  for (var i = 0; i < icosahedron.nodes.length; ++i) {
    nodes.push({ p: icosahedron.nodes[i].p, e: [], f: [] });
  }

  var edges = [];
  for (var i = 0; i < icosahedron.edges.length; ++i) {
    var edge = icosahedron.edges[i];
    edge.subdivided_n = [];
    edge.subdivided_e = [];
    var n0 = icosahedron.nodes[edge.n[0]];
    var n1 = icosahedron.nodes[edge.n[1]];
    var p0 = n0.p;
    var p1 = n1.p;
    var delta = p1.clone().sub(p0);
    nodes[edge.n[0]].e.push(edges.length);
    var priorNodeIndex = edge.n[0];
    for (var s = 1; s < degree; ++s) {
      var edgeIndex = edges.length;
      var nodeIndex = nodes.length;
      edge.subdivided_e.push(edgeIndex);
      edge.subdivided_n.push(nodeIndex);
      edges.push({ n: [priorNodeIndex, nodeIndex], f: [] });
      priorNodeIndex = nodeIndex;
      nodes.push({
        p: slerp(p0, p1, s / degree),
        e: [edgeIndex, edgeIndex + 1],
        f: []
      });
    }
    edge.subdivided_e.push(edges.length);
    nodes[edge.n[1]].e.push(edges.length);
    edges.push({ n: [priorNodeIndex, edge.n[1]], f: [] });
  }

  var faces = [];
  for (var i = 0; i < icosahedron.faces.length; ++i) {
    var face = icosahedron.faces[i];
    var edge0 = icosahedron.edges[face.e[0]];
    var edge1 = icosahedron.edges[face.e[1]];
    var edge2 = icosahedron.edges[face.e[2]];
    var point0 = icosahedron.nodes[face.n[0]].p;
    var point1 = icosahedron.nodes[face.n[1]].p;
    var point2 = icosahedron.nodes[face.n[2]].p;
    var delta = point1.clone().sub(point0);

    var getEdgeNode0 =
      face.n[0] === edge0.n[0]
        ? function(k) {
            return edge0.subdivided_n[k];
          }
        : function(k) {
            return edge0.subdivided_n[degree - 2 - k];
          };
    var getEdgeNode1 =
      face.n[1] === edge1.n[0]
        ? function(k) {
            return edge1.subdivided_n[k];
          }
        : function(k) {
            return edge1.subdivided_n[degree - 2 - k];
          };
    var getEdgeNode2 =
      face.n[0] === edge2.n[0]
        ? function(k) {
            return edge2.subdivided_n[k];
          }
        : function(k) {
            return edge2.subdivided_n[degree - 2 - k];
          };

    var faceNodes = [];
    faceNodes.push(face.n[0]);
    for (var j = 0; j < edge0.subdivided_n.length; ++j)
      faceNodes.push(getEdgeNode0(j));
    faceNodes.push(face.n[1]);
    for (var s = 1; s < degree; ++s) {
      faceNodes.push(getEdgeNode2(s - 1));
      var p0 = nodes[getEdgeNode2(s - 1)].p;
      var p1 = nodes[getEdgeNode1(s - 1)].p;
      for (var t = 1; t < degree - s; ++t) {
        faceNodes.push(nodes.length);
        nodes.push({ p: slerp(p0, p1, t / (degree - s)), e: [], f: [] });
      }
      faceNodes.push(getEdgeNode1(s - 1));
    }
    faceNodes.push(face.n[2]);

    var getEdgeEdge0 =
      face.n[0] === edge0.n[0]
        ? function(k) {
            return edge0.subdivided_e[k];
          }
        : function(k) {
            return edge0.subdivided_e[degree - 1 - k];
          };
    var getEdgeEdge1 =
      face.n[1] === edge1.n[0]
        ? function(k) {
            return edge1.subdivided_e[k];
          }
        : function(k) {
            return edge1.subdivided_e[degree - 1 - k];
          };
    var getEdgeEdge2 =
      face.n[0] === edge2.n[0]
        ? function(k) {
            return edge2.subdivided_e[k];
          }
        : function(k) {
            return edge2.subdivided_e[degree - 1 - k];
          };

    var faceEdges0 = [];
    for (var j = 0; j < degree; ++j) faceEdges0.push(getEdgeEdge0(j));
    var nodeIndex = degree + 1;
    for (var s = 1; s < degree; ++s) {
      for (var t = 0; t < degree - s; ++t) {
        faceEdges0.push(edges.length);
        var edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + 1]],
          f: []
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      ++nodeIndex;
    }

    var faceEdges1 = [];
    nodeIndex = 1;
    for (var s = 0; s < degree; ++s) {
      for (var t = 1; t < degree - s; ++t) {
        faceEdges1.push(edges.length);
        var edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s]],
          f: []
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      faceEdges1.push(getEdgeEdge1(s));
      nodeIndex += 2;
    }

    var faceEdges2 = [];
    nodeIndex = 1;
    for (var s = 0; s < degree; ++s) {
      faceEdges2.push(getEdgeEdge2(s));
      for (var t = 1; t < degree - s; ++t) {
        faceEdges2.push(edges.length);
        var edge = {
          n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s + 1]],
          f: []
        };
        nodes[edge.n[0]].e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push(edge);
        ++nodeIndex;
      }
      nodeIndex += 2;
    }

    nodeIndex = 0;
    edgeIndex = 0;
    for (var s = 0; s < degree; ++s) {
      for (t = 1; t < degree - s + 1; ++t) {
        var subFace = {
          n: [
            faceNodes[nodeIndex],
            faceNodes[nodeIndex + 1],
            faceNodes[nodeIndex + degree - s + 1]
          ],
          e: [
            faceEdges0[edgeIndex],
            faceEdges1[edgeIndex],
            faceEdges2[edgeIndex]
          ]
        };
        nodes[subFace.n[0]].f.push(faces.length);
        nodes[subFace.n[1]].f.push(faces.length);
        nodes[subFace.n[2]].f.push(faces.length);
        edges[subFace.e[0]].f.push(faces.length);
        edges[subFace.e[1]].f.push(faces.length);
        edges[subFace.e[2]].f.push(faces.length);
        faces.push(subFace);
        ++nodeIndex;
        ++edgeIndex;
      }
      ++nodeIndex;
    }

    nodeIndex = 1;
    edgeIndex = 0;
    for (var s = 1; s < degree; ++s) {
      for (t = 1; t < degree - s + 1; ++t) {
        var subFace = {
          n: [
            faceNodes[nodeIndex],
            faceNodes[nodeIndex + degree - s + 2],
            faceNodes[nodeIndex + degree - s + 1]
          ],
          e: [
            faceEdges2[edgeIndex + 1],
            faceEdges0[edgeIndex + degree - s + 1],
            faceEdges1[edgeIndex]
          ]
        };
        nodes[subFace.n[0]].f.push(faces.length);
        nodes[subFace.n[1]].f.push(faces.length);
        nodes[subFace.n[2]].f.push(faces.length);
        edges[subFace.e[0]].f.push(faces.length);
        edges[subFace.e[1]].f.push(faces.length);
        edges[subFace.e[2]].f.push(faces.length);
        faces.push(subFace);
        ++nodeIndex;
        ++edgeIndex;
      }
      nodeIndex += 2;
      edgeIndex += 1;
    }
  }

  return { nodes: nodes, edges: edges, faces: faces };
}

function relaxMesh(mesh, multiplier, action) {
  var totalSurfaceArea = 4 * Math.PI;
  var idealFaceArea = totalSurfaceArea / mesh.faces.length;
  var idealEdgeLength = Math.sqrt((idealFaceArea * 4) / Math.sqrt(3));
  var idealDistanceToCentroid = ((idealEdgeLength * Math.sqrt(3)) / 3) * 0.9;

  var pointShifts = new Array(mesh.nodes.length);
  action.executeSubaction(function(action) {
    for (var i = 0; i < mesh.nodes.length; ++i)
      pointShifts[i] = new Vector3(0, 0, 0);
  }, 1);

  var i = 0;
  action.executeSubaction(function(action) {
    if (i >= mesh.faces.length) return;

    var face = mesh.faces[i];
    var n0 = mesh.nodes[face.n[0]];
    var n1 = mesh.nodes[face.n[1]];
    var n2 = mesh.nodes[face.n[2]];
    var p0 = n0.p;
    var p1 = n1.p;
    var p2 = n2.p;
    var e0 = p1.distanceTo(p0) / idealEdgeLength;
    var e1 = p2.distanceTo(p1) / idealEdgeLength;
    var e2 = p0.distanceTo(p2) / idealEdgeLength;
    var centroid = calculateFaceCentroid(p0, p1, p2).normalize();
    var v0 = centroid.clone().sub(p0);
    var v1 = centroid.clone().sub(p1);
    var v2 = centroid.clone().sub(p2);
    var length0 = v0.length();
    var length1 = v1.length();
    var length2 = v2.length();
    v0.multiplyScalar(
      (multiplier * (length0 - idealDistanceToCentroid)) / length0
    );
    v1.multiplyScalar(
      (multiplier * (length1 - idealDistanceToCentroid)) / length1
    );
    v2.multiplyScalar(
      (multiplier * (length2 - idealDistanceToCentroid)) / length2
    );
    pointShifts[face.n[0]].add(v0);
    pointShifts[face.n[1]].add(v1);
    pointShifts[face.n[2]].add(v2);

    ++i;
    action.loop(i / mesh.faces.length);
  }, mesh.faces.length);

  var origin = new Vector3(0, 0, 0);
  var plane = new THREE.Plane();
  action.executeSubaction(function(action) {
    for (var i = 0; i < mesh.nodes.length; ++i) {
      plane.setFromNormalAndCoplanarPoint(mesh.nodes[i].p, origin);
      pointShifts[i] = mesh.nodes[i].p
        .clone()
        .add(plane.projectPoint(pointShifts[i]))
        .normalize();
    }
  }, mesh.nodes.length / 10);

  var rotationSupressions = new Array(mesh.nodes.length);
  for (var i = 0; i < mesh.nodes.length; ++i) rotationSupressions[i] = 0;

  var i = 0;
  action.executeSubaction(function(action) {
    if (i >= mesh.edges.length) return;

    var edge = mesh.edges[i];
    var oldPoint0 = mesh.nodes[edge.n[0]].p;
    var oldPoint1 = mesh.nodes[edge.n[1]].p;
    var newPoint0 = pointShifts[edge.n[0]];
    var newPoint1 = pointShifts[edge.n[1]];
    var oldVector = oldPoint1
      .clone()
      .sub(oldPoint0)
      .normalize();
    var newVector = newPoint1
      .clone()
      .sub(newPoint0)
      .normalize();
    var suppression = (1 - oldVector.dot(newVector)) * 0.5;
    rotationSupressions[edge.n[0]] = Math.max(
      rotationSupressions[edge.n[0]],
      suppression
    );
    rotationSupressions[edge.n[1]] = Math.max(
      rotationSupressions[edge.n[1]],
      suppression
    );

    ++i;
    action.loop(i / mesh.edges.length);
  });

  var totalShift = 0;
  action.executeSubaction(function(action) {
    for (var i = 0; i < mesh.nodes.length; ++i) {
      var node = mesh.nodes[i];
      var point = node.p;
      var delta = point.clone();
      point
        .lerp(pointShifts[i], 1 - Math.sqrt(rotationSupressions[i]))
        .normalize();
      delta.sub(point);
      totalShift += delta.length();
    }
  }, mesh.nodes.length / 20);

  return totalShift;
}

function distortMesh(mesh, degree, random, action) {
  var totalSurfaceArea = 4 * Math.PI;
  var idealFaceArea = totalSurfaceArea / mesh.faces.length;
  var idealEdgeLength = Math.sqrt((idealFaceArea * 4) / Math.sqrt(3));
  var idealFaceHeight = (idealEdgeLength * Math.sqrt(3)) / 2;

  var rotationPredicate = function(oldNode0, oldNode1, newNode0, newNode1) {
    if (
      newNode0.f.length >= 7 ||
      newNode1.f.length >= 7 ||
      oldNode0.f.length <= 5 ||
      oldNode1.f.length <= 5
    )
      return false;
    var oldEdgeLength = oldNode0.p.distanceTo(oldNode1.p);
    var newEdgeLength = newNode0.p.distanceTo(newNode1.p);
    var ratio = oldEdgeLength / newEdgeLength;
    if (ratio >= 2 || ratio <= 0.5) return false;
    var v0 = oldNode1.p
      .clone()
      .sub(oldNode0.p)
      .divideScalar(oldEdgeLength);
    var v1 = newNode0.p
      .clone()
      .sub(oldNode0.p)
      .normalize();
    var v2 = newNode1.p
      .clone()
      .sub(oldNode0.p)
      .normalize();
    if (v0.dot(v1) < 0.2 || v0.dot(v2) < 0.2) return false;
    v0.negate();
    var v3 = newNode0.p
      .clone()
      .sub(oldNode1.p)
      .normalize();
    var v4 = newNode1.p
      .clone()
      .sub(oldNode1.p)
      .normalize();
    if (v0.dot(v3) < 0.2 || v0.dot(v4) < 0.2) return false;
    return true;
  };

  var i = 0;
  action.executeSubaction(function(action) {
    if (i >= degree) return;

    var consecutiveFailedAttempts = 0;
    var edgeIndex = random.integerExclusive(0, mesh.edges.length);
    while (!conditionalRotateEdge(mesh, edgeIndex, rotationPredicate)) {
      if (++consecutiveFailedAttempts >= mesh.edges.length) return false;
      edgeIndex = (edgeIndex + 1) % mesh.edges.length;
    }

    ++i;
    action.loop(i / degree);
  });

  return true;
}

function slerp(p0, p1, t) {
  var omega = Math.acos(p0.dot(p1));
  return p0
    .clone()
    .multiplyScalar(Math.sin((1 - t) * omega))
    .add(p1.clone().multiplyScalar(Math.sin(t * omega)))
    .divideScalar(Math.sin(omega));
}

export default {
  generatePlanetMesh,
  generateSubdividedIcosahedron
};
