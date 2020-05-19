
// 两点间距离
function pointToPointDistance(point1, point2) {
  return Math.sqrt((point1[0] - point2[0]) * (point1[0] - point2[0]) + (point1[1] - point2[1]) * (point1[1] - point2[1]));
}

// 计算点到线段的距离
function pointToLineSegmentDistance(point, linePoint1, linePoint2) {
  var x = point[0];
  var y = point[1];

  var x1 = linePoint1[0];
  var y1 = linePoint1[1];

  var x2 = linePoint2[0];
  var y2 = linePoint2[1];

  var cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1); //|AB*AP|：矢量乘
  if (cross <= 0) {
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1)); //是|AP|：矢量的大小
  }
  
  var d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1); //|AB|^2：矢量AB的大小的平方
  if (cross >= d2) {
    return Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2)); //是|BP|：矢量的大小
  }
  
  var r = cross / d2;  //相似三角形原理求出c点的坐标
  var px = x1 + (x2 - x1) * r;
  var py = y1 + (y2 - y1) * r;
  return Math.sqrt((x - px) * (x - px) + (py - y) * (py - y));
}

function pointToPointAngle(point1, point2) {
  return Math.atan2(point1[0] - point2[0], point1[1] - point2[1]);
}

module.exports = {
  pointToPointDistance,
  pointToLineSegmentDistance,
  pointToPointAngle,
}