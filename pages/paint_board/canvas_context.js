
class BaseCanvasContext {

  constructor(canvasId) {
    this.canvasId = canvasId;

    this.transform = {
      dx: 0,
      dy: 0,
      scale: 1,
      angle: 0,
    };
  }

  setFillStyle(style) {}
  setStrokeStyle(style) {}
  setLineWidth(width) {} 
  setLineCap(cap) {}
  setLineJoin(join) {}

  save() {}
  restore() {}

  beginPath() {}
  closePath() {}

  moveTo(x, y) {}
  lineTo(x, y) {}
  quadraticCurveTo(cpx, cpy, x, y) {}
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {}
  arc(x, y ,r, sa, ea) {}

  stroke() {}
  fill() {}
  strokeRect(x, y, w, h) {}

  rotate(angle) {}
  scale(x, y) {}
  translate(dx, dy) {}

  drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {}

  setFontSize(size) {}
  setTextAlign(align) {}
  setTextBaseline(baseline) {}

  fillText(text, x, y) {}
  strokeText(text, x, y) {}

  draw(reserve, finishCallback) {}
}

class WechatCanvasContext extends BaseCanvasContext {
  
  constructor(canvasId) {
    super(canvasId);
    this.context = wx.createCanvasContext(canvasId);
  }

  setFillStyle(style) {
    this.context.setFillStyle(style);
  }
  setStrokeStyle(style) {
    this.context.setStrokeStyle(style);
  }
  setLineWidth(width) {
    this.context.setLineWidth(width);
  }
  setLineCap(cap) {
    this.context.setLineCap(cap);
  }
  setLineJoin(join) {
    this.context.setLineJoin(join);
  }

  beginPath() {
    this.context.beginPath();
  }
  closePath() {
    this.context.closePath();
  }

  moveTo(x, y) {
    this.context.moveTo(x, y);
  }
  lineTo(x, y) {
    this.context.lineTo(x, y);
  }
  quadraticCurveTo(cpx, cpy, x, y) {
    this.context.quadraticCurveTo(cpx, cpy, x, y);
  }
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }
  arc(x, y ,r, sa, ea) {
    this.context.arc(x, y, r, sa, ea);
  }

  stroke() {
    this.context.stroke();
  }
  fill() {
    this.context.fill();
  }
  strokeRect(x, y, w, h) {
    this.context.strokeRect(x, y, w, h);
  }

  rotate(angle) {
    this.context.rotate(angle);
  }
  scale(x, y) {
    this.context.scale(x, y);
  }
  translate(dx, dy) {
    this.context.translate(dx, dy);
  }

  drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    this.context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  setFontSize(size) {
    this.context.setFontSize(size);
  }

  setTextAlign(align) {
    this.context.setTextAlign(align);
  }

  setTextBaseline(baseline) {
    this.context.setTextBaseline(baseline);
  }

  fillText(text, x, y) {
    this.context.fillText(text, x, y);
  }

  strokeText(text, x, y) {
    this.context.strokeText(text, x, y);
  }

  measureText(text) {
    return this.context.measureText(text);
  }

  draw(reserve, finishCallback) {
    this.context.draw(reserve, finishCallback);
  }
}

module.exports = {
  BaseCanvasContext,
  WechatCanvasContext,
}