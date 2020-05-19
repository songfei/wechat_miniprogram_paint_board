import {WechatCanvasContext} from './canvas_context.js';
import {HitTestStatus, GraffitiShape, LineShape, RectShape, CircleShape, ArrowShape, TextShape} from './drawing_shape.js';

class DrawingBoard {

  constructor(obj) {

    this.width = obj.width;
    this.height = obj.height;

    this.updater = obj.updater;

    this.shapeList = [];

    this.currentShape = null;
    this.currentShapeIndex = 0;

    this.currentSelectedShape = null;
    this.currentSelectedShapeIndex = -1;
    
    this.moveTransform = {
      startPoint: [0, 0],
      startDistance: 0,
      startAngle: 0,
      hitTestStatus: HitTestStatus.none,
    }

    this.drawColor = '#ff0000';
    this.drawSize = 3;

    //画布的变换
    this.transform = {
      dx: 0,
      dy: 0,
      scale: 1,
      angle: 0,
    };
    // 画布的原点位置
    this.centerPoint = [this.width / 2, this.height / 2];

    this.mainContext = new WechatCanvasContext('mainCanvas');
    this.tempContext = new WechatCanvasContext('tempCanvas');
  }

  // 把父坐标系的点坐标转为本坐标系的点坐标
  _reverseTransformPoint(point) {
    var x = point[0];
    var y = point[1];

    x -= this.centerPoint[0];
    y -= this.centerPoint[1];

    x -= this.transform.dx;
    y -= this.transform.dy;

    x /= this.transform.scale;
    y /= this.transform.scale;

    var xx = x * Math.cos(-this.transform.angle) - y * Math.sin(-this.transform.angle);
    var yy = x * Math.sin(-this.transform.angle) + y * Math.cos(-this.transform.angle);

    return [xx, yy];
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
    this.updateAllShape();

    this.notifyOperatingUpdater();
  }

  revoke() {
    if(this.canRevoke) {
      this.currentShapeIndex--;
      this.updateAllShape();

      this.notifyOperatingUpdater();
    }
  }

  redo() {
    if(this.canRedo) {
      this.currentShapeIndex++;
      this.updateAllShape();

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

  cancelAllSeleted() {
    for(var i=0; i<this.shapeList.length; i++) {
      var shape = this.shapeList[i];
      shape.selected = false;
    }
  }

  touchStart(mode, x, y, session) {
    var localPoint = this._reverseTransformPoint([x,y]);
    var xx = localPoint[0];
    var yy = localPoint[1];

    console.log('board touch start',mode, xx, yy);

    if(mode == 'move') {
      var hasSelected = false;
      var hit = HitTestStatus.none;
      if(this.currentSelectedShape != null) {
        hit = this.currentSelectedShape.hitTest(xx, yy);
        if(hit > 0) {
          hasSelected = true;
        }
      } 
      
      if(!hasSelected) {
        for(var i=this.shapeList.length -1; i>=0; i--) {
          var shape = this.shapeList[i];
          //TODO 先判断外边框再做 hitTest
          hit = shape.hitTest(xx, yy)
          if(hit > 0) {
            this.cancelAllSeleted();
            shape.selected = true;
            this.currentSelectedShape = shape;
            this.currentSelectedShapeIndex = i;
            hasSelected = true;
            break;
          }
        }
      }
      
      if(hasSelected) {
        this.currentSelectedShape.touchSession = session;
        this.currentSelectedShape.startMoveShape(xx, yy, hit);
      } 
      else {
        this.cancelAllSeleted();
        this.currentSelectedShapeIndex = -1;
        this.currentSelectedShape = null;
      }
      this.updateAllShape();
    }
    else {
      if(this.currentShape) {
        if(session == this.currentShape.touchSession) {
          this.removeCurrentObject();
          return;
        }
  
        if(this.currentShape.status !== 'done') {
          this.removeCurrentObject();
        }
      }

      if(mode == 'graffiti') {
        this.currentShape = new GraffitiShape();
      }
      else if(mode == 'circle') {
        this.currentShape = new CircleShape();
      }
      else if(mode == 'rect') {
        this.currentShape = new RectShape();
      }
      else if(mode == 'arrow') {
        this.currentShape = new ArrowShape();
      }
  
      if(this.currentShape != null) {
        this.addShape(this.currentShape);
  
        this.currentShape.touchSession = session;
        if(this.currentShape.isReserveDraw) {
          // this.tempContext.translate(this.centerPoint[0], this.centerPoint[1]);
        }
        this.currentShape.startShape(xx, yy);
        this.currentShape.prepareDrawShape(this.tempContext);
      }
    }
  }

  touchMove(mode, x, y, session) {

    var localPoint = this._reverseTransformPoint([x,y]);
    var xx = localPoint[0];
    var yy = localPoint[1];

    // console.log('board touch move',mode, xx, yy);


    if(mode == 'move') {
      if(this.currentSelectedShape != null) {
        
        if(this.currentSelectedShape.touchSession == session) {
          this.tempContext.translate(this.centerPoint[0], this.centerPoint[1]);

          this.currentSelectedShape.moveShape(xx, yy);
          this.currentSelectedShape.drawShape(this.tempContext);
          this.currentSelectedShape.drawPoints(this.tempContext);
          this.currentSelectedShape.drawCenterPoint(this.tempContext);
          this.currentSelectedShape.drawSelectedBorder(this.tempContext);
          this.tempContext.draw(false);
        }
      }
    }
    else if(this.currentShape != null) {
      if(this.currentShape.type !== mode || this.currentShape.touchSession !== session) {
        this.removeCurrentShape();
      }
      this.currentShape.addPoint(xx, yy);
      if(this.currentShape.isReserveDraw) {
        // this.tempContext.translate(this.centerPoint[0], this.centerPoint[1]);

        this.currentShape.drawLastStroke(this.tempContext);
        this.tempContext.draw(true);
      }
      else {
        this.tempContext.translate(this.centerPoint[0], this.centerPoint[1]);
        this.currentShape.drawShape(this.tempContext);
        this.tempContext.draw(false);
      }
    }
  }

  touchEnd(mode, session) {
    if(this.currentShape) {
      if(this.currentShape.type !== mode || this.currentShape.touchSession !== session) {
        this.removeCurrentShape();
      }

      this.currentShape.finishShape();
      this.currentShape = null;
      this.updateAllShape();
    }
    console.log('shape list:', this.shapeList);
  }

  addTextShape(object) {
    var textShape = new TextShape();

    textShape.text = object.text;
    textShape.updateTextRect(this.tempContext);

    textShape.fillColor = object.fillColor;
    textShape.strokeColor = object.strokeColor;
    textShape.style = object.style;
    textShape.centerPoint = [187.5, 300];
    
    this.cancelAllSeleted();
    textShape.selected = true;
    this.currentSelectedShape = textShape;
    this.currentSelectedShapeIndex = this.shapeList.length;

    this.addShape(textShape);
    this.updateAllShape();
  }

  updateAllShape() {
    this.mainContext.translate(this.centerPoint[0], this.centerPoint[1])
    this.tempContext.translate(this.centerPoint[0], this.centerPoint[1])

    for(var i=0; i<this.shapeList.length; i++) {
      if(i >= this.currentShapeIndex) {
        break;
      }
      var shape = this.shapeList[i];
      if(shape.selected) {
        shape.drawShape(this.tempContext);
        shape.drawCenterPoint(this.tempContext);
        shape.drawPoints(this.tempContext);
        shape.drawSelectedBorder(this.tempContext); 
      }
      else {
        shape.drawShape(this.mainContext);
      }
    }
    this.mainContext.draw();

    this.tempContext.beginPath();
    this.tempContext.draw();
  }

}

module.exports = {
  DrawingBoard,
}