
class BaseCanvasContext {

  constructor(canvasId) {
    this.canvasId = canvasId;
  }

  setFillStyle(style) {}
  setStrokeStyle(style) {}
  setLineWidth(width) {} 
  setLineCap(cap) {}
  setLineJoin(join) {}

  beginPath() {}
  closePath() {}

  moveTo(x, y) {}
  lineTo(x, y) {}
  quadraticCurveTo(cpx, cpy, x, y) {}
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {}

  stroke() {}
  fill() {}
  strokeRect(x, y, w, h) {}

  rotate(angle) {}
  scale(x, y) {}
  translate(dx, dy) {}

  drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {}

  draw(reserve, finishCallback) {}
}

class WechatCanvasContext extends BaseCanvasContext {
  
  constructor(canvasId) {
    super(canvasId);
    this.context = wx.createCanvasContext(canvasId);
  }

  setFillStyle(style) {
    wx.setFillStyle(style);
  }
  setStrokeStyle(style) {
    wx.setStrokeStyle(style);
  }
  setLineWidth(width) {
    wx.setLineWidth(width);
  }
  setLineCap(cap) {
    wx.setLineCap(cap);
  }
  setLineJoin(join) {
    wx.setLineJoin(join);
  }

  beginPath() {
    wx.beginPath();
  }
  closePath() {
    wx.closePath();
  }

  moveTo(x, y) {
    wx.moveTo(x, y);
  }
  lineTo(x, y) {
    wx.lineTo(x, y);
  }
  quadraticCurveTo(cpx, cpy, x, y) {
    wx.quadraticCurveTo(cpx, cpy, x, y);
  }
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    wx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  stroke() {
    wx.stroke();
  }
  fill() {
    wx.fill();
  }
  strokeRect(x, y, w, h) {
    wx.strokeRect(x, y, w, h);
  }

  rotate(angle) {
    wx.rotate(angle);
  }
  scale(x, y) {
    wx.scale(x, y);
  }
  translate(dx, dy) {
    wx.translate(dx, dy);
  }

  drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    wx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  draw(reserve, finishCallback) {
    wx.draw(reserve, finishCallback);
  }
}

module.exports = {
  BaseCanvasContext,
  WechatCanvasContext,
}