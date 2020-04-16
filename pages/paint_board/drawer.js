import {WechatCanvasContext} from './canvas_context.js';
import {LineShape, RectShape, CircleShape, ArrowShape, TextShape} from './shape.js';

class Drawer {

  constructor(imageUrl, updater) {

    this.imageUrl = imageUrl;
    this.localImageUrl = '';
    this.imageWidth = 0;
    this.imageHeight = 0;

    this.updater = updater;

    this.shapeList = [];
    this.currentShape = null;
    this.currentShapeIndex = 0;

    this.drawColor = '#ff0000';
    this.drawSize = 3;

    //画布的变换
    this.transform = {
      dx: 0,
      dy: 0,
      scale: 1,
      angle: 0,
    };

    this.mainContext = new WechatCanvasContext('mainCanvas');
    this.tempContext = new WechatCanvasContext('tempCanvas');

  }

  notifyUpdater(obj) {
    if(this.updater != null) {
      this.updater(obj);
    }
  }

  get isEmpty() {
    return (this.currentShapeIndex <= 0);
  }

  get canRevoke() {
    return (this.currentShapeIndex > 0);
  }

  get canRedo() {
    return (this.currentShapeIndex < this.shapeList.length);
  }

  notifyOperatingUpdater() {
    this.notifyUpdater({
      isEmpty: this.isEmpty,
      canRevoke: this.canRevoke,
      canRedo: this.canRedo,
    });
  }

  addShape(object) {
    this.shapeList.splice(this.currentShapeIndex, this.shapeList.length - this.currentShapeIndex);
    this.shapeList.push(object);
    this.currentShapeIndex++;

    this.notifyOperatingUpdater();
  }

  removeCurrentShape() {
    if(this.currentShape && this.currentShapeIndex > 0) {
      this.currentShapeIndex--;
      this.shapeList.splice(this.currentShapeIndex, 1);
      this.currentShape = null;

      this.notifyUpdater({
        isEmpty: this.isEmpty,
        canRevoke: this.canRevoke,
        canRedo: this.canRedo,
      });
    }
  }

  reset() {
    this.shapeList = [];
    this.currentShapeIndex = 0;
    this.currentShape = null;
  }

  revoke() {
    if(this.canRevoke) {
      this.currentShapeIndex--;
      this.updateAllObject();

      this.notifyOperatingUpdater();
    }
  }

  redo() {
    if(this.canRedo) {
      this.currentShapeIndex++;
      this.updateAllObject();

      this.notifyOperatingUpdater();
    }
  }

  setTransform(obj) {
    var needUpdate = false;
    if(obj.dx != null) {
      if(obj.dx !== this.transform.dx) {
        this.transform.dx = obj.dx;
        needUpdate = true;
      }
    }

    if(obj.dy != null) {
      if(obj.dy !== this.transform.dy) {
        this.transform.dy = obj.dy;
        needUpdate = true;
      }
    }

    if(obj.angle != null) {
      if(obj.angle !== this.transform.angle) {
        this.transform.angle = obj.angle;
        needUpdate = true;
      }
    }

    if(obj.scale != null) {
      if(obj.scale !== this.transform.scale) {
        this.transform.scale = obj.scale;
        needUpdate = true;
      }
    }
    
    if(needUpdate) {
        this.updateAllShape();
    }
  }

  touchBegin(mode, x, y, session) {
    console.log('touch begin',mode);

    if(this.currentShape) {
      if(session == this.currentShape.touchSession) {
        this.removeCurrentObject();
        return;
      }

      if(this.currentShape.status !== 'done') {
        this.removeCurrentObject();
      }
    }

    if(mode == 'circle') {
      this.currentShape = new CircleShape();
    }
    else if(mode == 'rect') {
      this.currentShape = new RectShape();
    }
    else if(mode == 'arrow') {
      this.currentShape = new ArrowShape();
    }


    this.currentShape.touchSession = session;
    this.currentShape.startShape(x, y);

    this.addShape(this.currentShape);

  }

  touchMove(mode, x, y, session) {
    if(this.currentShape) {
      if(this.currentShape.type !== mode || this.currentShape.touchSession !== session) {
        this.removeCurrentShape();
      }

      this.currentShape.addPoint(x, y);
      this.currentShape.drawShape(this.tempContext);
      // this.currentShape.drawSelectedBorder(this.tempContext);
      this.tempContext.draw();
    }
  }

  touchEnd(mode, session) {
    if(this.currentShape) {
      if(this.currentShape.type !== mode || this.currentShape.touchSession !== session) {
        this.removeCurrentShape();
      }

      this.currentShape.finishShape();
      this.currentShape = null;
    }
    console.log('shape list:', this.shapeList);
  }

  updateAllShape() {

  }

}

module.exports = {
  Drawer,
}