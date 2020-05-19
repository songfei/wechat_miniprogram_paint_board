
class DrawingTouch {

  constructor(obj) {
    this.touchTransformEvent = obj.touchTransform;

    this.touchStartEvent = obj.touchStart;
    this.touchMoveEvent = obj.touchMove;
    this.touchEndEvent = obj.touchEnd;
    this.touchCancelEvent = obj.touchCancel;

    this.touched = false;

    this.startPoint = [0, 0];
    this.startDistance = 0;

    this.sessionCounter = 0;
    this.session = -1;
    this.isSendTouchStart = false;
  }

  calcuateCenterPoint(touches) {
    var x = 0;
    var y = 0;
    for(var i=0; i < touches.length; i++) {
      var touch = touches[i];
      x += touch.x;
      y += touch.y;
    }
    return [x / touches.length, y / touches.length];
  }

  calcuateTowPointDistance(touches) {
    if(touches.length == 2) {
      return Math.sqrt((touches[0].x - touches[1].x) * (touches[0].x - touches[1].x) + (touches[0].y - touches[1].y) * (touches[0].y - touches[1].y));
    }
    return 0;
  }

  touchStart(event) {
    // console.log('touch start', event);

    if(!this.touched) {
      this.sessionCounter++;
      this.session = this.sessionCounter;
    }
    event.session = this.session;

    if(this.session >= 0) {
      
      this.touched = true;
    
      if(event.touches.length == 1) {
        event.x = event.touches[0].x;
        event.y = event.touches[0].y;

        if(this.touchStartEvent) {
          this.isSendTouchStart = true;
          this.touchStartEvent(event);
        }
      }
      else {
        if(this.isSendTouchStart) {
          if(this.touchCancelEvent) {
            this.touchCancelEvent(event);
          }
          this.isSendTouchStart = false;
        }

        if(event.touches.length == 2) {
          this.startPoint = this.calcuateCenterPoint(event.touches);
          this.startDistance = this.calcuateTowPointDistance(event.touches);
        }
        else {
          this.session = -1;
          if(this.touchEndEvent) {
            this.touchEndEvent(event);
          }
        }
      }
    }
  }

  touchMove(event) {
    // console.log('touch move', event);
    event.session = this.session;
    if(this.touched && this.session >=0) {
      if(event.touches.length === 1) {
        event.x = event.touches[0].x;
        event.y = event.touches[0].y;

        if(this.touchMoveEvent) {
          this.touchMoveEvent(event);
        }
      }
      else if(event.touches.length === 2) {
        var point = this.calcuateCenterPoint(event.touches);
        var distance = this.calcuateTowPointDistance(event.touches);

        event.dx = point[0] - this.startPoint[0];
        event.dy = point[1] - this.startPoint[1];
        event.scale = distance / this.startDistance;

        if(this.touchTransformEvent) {
          this.touchTransformEvent(event);
        }
      }
    }
  }

  touchEnd(event) {
    // console.log('touch end', event);
    event.session = this.session;
    if(this.touched && this.session >=0) {
      if(event.touches.length === 0) {
        this.touched = false;
        if(this.touchEndEvent) {
          this.touchEndEvent(event);
        }
      }
    }
  }
}

module.exports = {
  DrawingTouch,
}