
class BaseShape {

  constructor() {
    this.type = 'unknow';

    //关键顶点 （对于不同形状，表示的意义不同）
    this.points = [];

    //样式
    this.strokeColor = '#ff0000';
    this.fillColor = '#ff0000';
    this.lineWidth = 3;

    //位置
    this.centerPoint = [0, 0];

    // 每个形状有个变换
    this.transform = {
      dx: 0,
      dy: 0,
      scale: 1,
      angle: 0,
    };

    //外框（一定是方框）
    this.topLeft = [0, 0];
    this.bottomRight = [0, 0];

    //额外信息
    this.status = 'init';
    this.touchSession = -1;
    this.isReserveDraw = false;
  }

  setCenter(x, y) {
    this.centerPoint = [x, y];
    this.updateRect();
  }

  setTranslate(dx, dy) {
    this.transform.dx = dx;
    this.transform.dy = dy;
    this.updateRect();
  }

  setRotate(angle) {
    this.transform.angle = angle;
    this.updateRect();
  }

  setScale(scale) {
    this.transform.scale = scale;
    this.updateRect();
  }

  updateRect() {}

  startShape(x, y) {
    this.status = 'start';
  }
  addPoint(x, y) {
    this.status = 'move';
  }
  finishShape() {
    this.status = 'done';
  }

  hitTest(x, y) {
    return false;
  }

  prepareDrawShape(context) {}

  drawShape(context) {}

  // 画最后一笔， 给涂鸦用的
  drawLastStroke(context) {}

  drawSelectedBorder(context) {}

  _startTransform(context) {
    context.save();

    context.translate(this.centerPoint[0], this.centerPoint[1]);

    context.translate(this.transform.dx, this.transform.dy);
    context.rotate(this.transform.angle);
    context.scale(this.transform.scale, this.transform.scale);
  }

  _startDraw(context) {
    context.setLineWidth(this.lineWidth);
    context.setStrokeStyle(this.strokeColor);
    context.setFillStyle(this.fillColor);
    context.setLineCap('round');
    context.setLineJoin('round');
  }

  _finishDraw(context) {
    context.beginPath();
    context.moveTo(2, 0);
    context.setStrokeStyle('#ffff00');
    context.setLineWidth(3);
    context.arc(0, 0, 2, 0, 2 * Math.PI);
    context.stroke();
  }
  
  _finishTransform(context) {
    context.scale(1 / this.transform.scale, 1 / this.transform.scale);
    context.rotate(-this.transform.angle);
    context.translate(-this.transform.dx, -this.transform.dy);

    context.translate(-this.centerPoint[0], -this.centerPoint[1]);

    context.restore();
  }
}

class TowControlPointsShape extends BaseShape {
  constructor() {
    super();
    this.points = [[0,0],[0,0]];
  }

  _updateCenter() {
    var dx = (this.points[0][0] + this.points[1][0] ) / 2;
    var dy = (this.points[0][1] + this.points[1][1] ) / 2;

    this.centerPoint[0] += dx;
    this.centerPoint[1] += dy;

    this.points[0][0] -= dx;
    this.points[0][1] -= dy;
    this.points[1][0] -= dx;
    this.points[1][1] -= dy;
  }

  startShape(x, y) {
    super.startShape(x, y);
    this.centerPoint = [0, 0];
    this.points[0] = [x, y];
    this.updateRect();
  }

  addPoint(x, y) {
    super.addPoint(x, y);
    
    var xx = x - this.centerPoint[0];
    var yy = y - this.centerPoint[1];

    this.points[1] = [xx, yy];
    this._updateCenter();
    this.updateRect();
  }

  finishShape() {
    super.finishShape();
    this.updateRect();
  }

  pointsDistance() {
    return Math.sqrt((this.points[0][0] - this.points[1][0]) * (this.points[0][0] - this.points[1][0]) + (this.points[0][1] - this.points[1][1]) * (this.points[0][1] - this.points[1][1]));
  }

  drawSelectedBorder(context) {
    super.drawSelectedBorder(context);
    this._startTransform(context);

    context.setLineWidth(1 / this.transform.scale);
    context.setStrokeStyle('#84CBFF');

    var lX = Math.min(this.points[0][0], this.points[1][0]);
    var lY = Math.min(this.points[0][1], this.points[1][1]);
    var width = Math.abs(this.points[0][0]- this.points[1][0]);
    var height = Math.abs(this.points[0][1]- this.points[1][1]);

    context.strokeRect(lX - this.lineWidth, lY - this.lineWidth, width + 2 * this.lineWidth, height + 2 * this.lineWidth);

    context.beginPath();
    context.setFillStyle('#84CBFF');
    context.setStrokeStyle('#093555');
    context.setLineWidth(2 / this.transform.scale);
    context.arc(lX + width + this.lineWidth, lY + height + this.lineWidth, 5 / this.transform.scale, 0, 2 * Math.PI);
    context.moveTo(lX - this.lineWidth + 5  / this.transform.scale, lY - this.lineWidth);
    context.arc(lX - this.lineWidth, lY - this.lineWidth, 5 / this.transform.scale, 0, 2 * Math.PI);
    context.fill();
    context.stroke();


    this._finishTransform(context);
  }

  drawShape(context) {
    super.drawShape(context);
  }

}

class LineShape extends TowControlPointsShape {

  constructor() {
    super();
    this.type = 'line';
  }
  
  drawShape(context) {
    super.drawShape(context);
    this._startTransform(context);
    this._startDraw(context);

    context.beginPath();

    context.moveTo(this.points[0][0], this.points[0][1]);
    context.lineTo(this.points[1][0], this.points[1][1]);
    context.stroke();

    this._finishDraw(context);
    this._finishTransform(context);
  }

}

class RectShape extends TowControlPointsShape {

  constructor() {
    super();
    this.type = 'rect';
  }

  drawShape(context) {
    super.drawShape(context);
    this._startTransform(context);
    this._startDraw(context);

    context.beginPath();

    var lX = Math.min(this.points[0][0], this.points[1][0]);
    var lY = Math.min(this.points[0][1], this.points[1][1]);
    var width = Math.abs(this.points[0][0]- this.points[1][0]);
    var height = Math.abs(this.points[0][1]- this.points[1][1]);

    context.strokeRect(lX, lY, width, height);

    this._finishDraw(context);
    this._finishTransform(context);
  }
}

class CircleShape extends TowControlPointsShape {
  constructor() {
    super();
    this.type = 'circle';
  }

  drawShape(context) {
    super.drawShape(context);
    this._startTransform(context);
    this._startDraw(context);

    context.beginPath();
  
    var xx = Math.min(this.points[0][0], this.points[1][0]);
    var yy = Math.min(this.points[0][1], this.points[1][1]);
    var aa = Math.abs(this.points[0][0] - this.points[1][0]);
    var bb = Math.abs(this.points[0][1] - this.points[1][1]);

    var x = (2 * xx + aa) / 2;
    var y = (2 * yy + bb) / 2;
    var a = aa /2;
    var b = bb /2;
    var ox = 0.5 * a, oy = 0.6 * b;

    context.moveTo(x, y + b);
    context.bezierCurveTo(x + ox, y + b, x + a, y + oy, x + a, y);
    context.bezierCurveTo(x + a, y - oy, x + ox, y - b, x, y - b);
    context.bezierCurveTo(x - ox, y - b, x - a, y - oy, x - a, y);
    context.bezierCurveTo(x - a, y + oy, x - ox, y + b, x, y + b);
    context.closePath();
    context.stroke();

    this._finishDraw(context);
    this._finishTransform(context);
  }
}

class ArrowShape extends TowControlPointsShape {
  constructor() {
    super();
    this.type = 'arrow';
  }

  _calculateHeadPoint(a, b, alpha, d){
    var sX = a[0];
    var sY = a[1];
    var eX = b[0];
    var eY = b[1];

    var a = Math.atan2((eY - sY) , (eX - sX));
    var bX = eX - Math.cos(a) * d;
    var bY = eY - Math.sin(a) * d;

    var pX = bX - eX;
    var pY = bY - eY;
    var rX = pX * Math.cos(alpha) - pY * Math.sin(alpha) + eX;
    var rY = pY * Math.cos(alpha) + pX * Math.sin(alpha) + eY;

    return [rX, rY];
  }

  drawShape(context) {
    super.drawShape(context);
    this._startTransform(context);
    this._startDraw(context);

    context.beginPath();

    var d1 = this.lineWidth * 8 * this.transform.scale * context.transform.scale;
    var angle1 = 30 / 180 * Math.PI;
    var d2 = d1 * 0.7;
    var angle2 = 15 / 180 * Math.PI;
    
    if(this.pointsDistance() < this.lineWidth * 8) {
      return;
    }

    var h1 = this._calculateHeadPoint(this.points[0], this.points[1], angle1, d1);
    var h2 = this._calculateHeadPoint(this.points[0], this.points[1], -angle1, d1);
    var h3 = this._calculateHeadPoint(this.points[0], this.points[1], angle2, d2);
    var h4 = this._calculateHeadPoint(this.points[0], this.points[1], -angle2, d2);

    context.moveTo(this.points[0][0], this.points[0][1]);
    context.lineTo(h3[0], h3[1]);
    context.lineTo(h1[0], h1[1]);
    context.lineTo(this.points[1][0], this.points[1][1]);
    context.lineTo(h2[0], h2[1]);
    context.lineTo(h4[0], h4[1]);
    context.closePath();
    context.fill();

    this._finishDraw(context);
    this._finishTransform(context);
  }
}

class GraffitiShape extends BaseShape {
  constructor() {
    super();
    this.type = 'graffiti';
    this.isReserveDraw = true;
  }

  _updateCenter() {
    var dx = (this.minX + this.maxX) / 2 - this.centerPoint[0];
    var dy = (this.minY + this.maxY) / 2 - this.centerPoint[1];

    this.centerPoint[0] += dx;
    this.centerPoint[1] += dy;

    for(var i=0; i<this.points.length; i++) {
      this.points[i][0] -= dx;
      this.points[i][1] -= dy;
    }
  }

  prepareDrawShape(context) {
    context.beginPath();
    context.setLineWidth(this.lineWidth);
    context.setStrokeStyle(this.strokeColor);
    context.setLineCap('round');
    context.setLineJoin('round');
  }

  drawLastStroke(context) {
    if(this.needUpdateLastStorke && this.points.length >0) {
      var x = this.points[this.points.length - 1][0];
      var y = this.points[this.points.length - 1][1];
      
      var pX = x;
      var pY = y;
      var ppX = x;
      var ppY = y;
      
      if(this.points.length > 1) {
        pX = this.points[this.points.length - 2][0];
        pY = this.points[this.points.length - 2][1];
        ppX = pX;
        ppY = pY;
      }

      if(this.points.length > 2) {
        ppX = this.points[this.points.length - 3][0];
        ppY = this.points[this.points.length - 3][1];
      }
      
      context.moveTo((pX + ppX) / 2, (pY + ppY) / 2);
      context.quadraticCurveTo(pX, pY, (x + pX) / 2, (y + pY) / 2);
      context.stroke();
    }
  }

  drawShape(context) {
    if(this.points.length < 1) {
      return;
    }

    super.drawShape(context);
    this._startTransform(context);
    this._startDraw(context);
    
    context.beginPath();

    var pX = this.points[0][0];
    var pY = this.points[0][1];
    var mX = this.points[0][0];
    var mY = this.points[0][1];

    for (var j = 1; j < this.points.length; j++) {
      var point = this.points[j];
      context.moveTo(mX, mY);
      context.quadraticCurveTo(pX, pY, ((point[0] + pX) / 2), ((point[1] + pY) / 2));

      mX = (point[0] + pX) / 2;
      mY = (point[1] + pY) / 2;
      pX = point[0];
      pY = point[1];
    }
    context.stroke();

    this._finishDraw(context);
    this._finishTransform(context);
  }

  startShape(x, y) {
    super.startShape(x, y);
    this.centerPoint = [0, 0];
    this.points = [[x, y]];
    this.minX = x;
    this.maxX = x;
    this.minY = y;
    this.maxY = y;

    this.needUpdateLastStorke = false;
    this.updateRect();
  }

  addPoint(x, y) {
    super.addPoint(x, y);
    
    var pX = this.points[this.points.length - 1][0];
    var pY = this.points[this.points.length - 1][1];

    var distance = (pX - x) * (pX - x) + (pY - y) * (pY - y);
    if(distance > 25) {
      this.minX = Math.min(this.minX, x);
      this.maxX = Math.max(this.maxX, x);
      this.minY = Math.min(this.minY, y);
      this.maxY = Math.max(this.maxY, y);

      this.points.push([x,y]);
      this.needUpdateLastStorke = true;
    }
    
    this.updateRect();
  }

  finishShape() {
    super.finishShape();
    this._updateCenter();
    this.updateRect();
  }
}

class TextShape extends BaseShape {
  constructor() {
    super();
    this.type = 'circle';
    this.text = '';
    this.fontSize = 30;
    this.textAlign = 'center';
    this.textWidth = 0;
  }

  updateTextRect(context) {
    context.save();
    context.setFontSize(this.fontSize);
    context.setTextAlign(this.textAlign);
    this.textWidth = context.measureText(this.text).width;

    context.restore();
  }

  drawSelectedBorder(context) {
    this._startTransform(context);

    context.setLineWidth(1 / this.transform.scale);
    context.setStrokeStyle('#84CBFF');
    context.strokeRect(- this.textWidth / 2 - 5, -this.fontSize/ 2 - 5, this.textWidth + 10, this.fontSize + 10);

    context.beginPath();
    context.setStrokeStyle('#84CBFF');
    context.setFillStyle('#093555');
    context.setLineWidth(2 / this.transform.scale);
    context.arc(- this.textWidth / 2 - 5, -this.fontSize/ 2 - 5, 5 / this.transform.scale, 0, 2 * Math.PI);
    context.moveTo(- this.textWidth / 2 + 5 + this.textWidth + 5 / this.transform.scale, -this.fontSize/ 2 + 5 + this.fontSize);
    context.arc(- this.textWidth / 2 + 5 + this.textWidth, -this.fontSize/ 2 + 5 + this.fontSize, 5 / this.transform.scale, 0, 2 * Math.PI);
    context.fill();
    context.stroke();

    this._finishTransform(context);
  }

  drawShape(context) {
    super.drawShape(context);
    this._startTransform(context);
    this._startDraw(context);

    console.log('text Width: ' , this.textWidth);
    context.setFontSize(this.fontSize);
    context.setTextAlign(this.textAlign);
    context.setTextBaseline('middle');
    context.strokeText(this.text, 0, 0);
    context.fillText(this.text, 0, 0);
    
    this._finishDraw(context);
    this._finishTransform(context);
  }
}

module.exports = {
  BaseShape,
  GraffitiShape,
  LineShape,
  RectShape,
  CircleShape,
  ArrowShape,
  TextShape,
}