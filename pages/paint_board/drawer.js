
const Drawer = function(imageUrl, updater) {
  this.mainContext = wx.createCanvasContext('mainCanvas')
  this.tempContext = wx.createCanvasContext('tempCanvas')

  this.updater = updater;

  this.imageUrl = imageUrl;
  this.localImageUrl = '';
  this.imageWidth = 0;
  this.imageHeight = 0;

  this.objectList = [];
  this.currentObject = null;
  this.objectIndex = 0;

  this.drawColor = '#ff0000';
  this.drawSize = 3;

  this.canvasWidth = 0;
  this.canvasHeight = 0;
  this.canvasTop = 0;
  this.canvasLeft = 0;

  this.topPadding = 0;
  this.bottomPadding = 0;

  this.deltaX = 0;
  this.deltaY = 0;
  this.angle = 0;
  this.scale = 1;

  this.outputWidth = function() {
    if(this.angle == 90 || this.angle == 270) {
      return this.imageHeight;
    }
    else {
      return this.imageWidth;
    }
  }

  this.outputHeight = function() {
    if(this.angle == 90 || this.angle == 270) {
      return this.imageWidth;
    }
    else {
      return this.imageHeight;
    }
  }

  this.notifyUpdater = function(obj) {
    if(this.updater != null) {
      this.updater(obj);
    }
  }

  this.active = function() {
    this.scale = 1;
    this.deltaX = 0;
    this.deltaY = 0;

    this.updateCanvasSize();
    this.updateAllObject();

    this.notifyUpdater({
      canRevoke: this.canRevoke(),
      canRedo: this.canRedo(),
      drawColor: this.drawColor,
      drawSize: this.drawSize,
    });
  }

  this.isEmpty = function() {
    return (this.objectIndex <= 0);
  }

  this.addObject = function(object) {
    this.objectList.splice(this.objectIndex, this.objectList.length - this.objectIndex);
    this.objectList.push(object);
    this.objectIndex++;

    this.notifyUpdater({
      isEmpty: this.isEmpty(),
      canRevoke: this.canRevoke(),
      canRedo: this.canRedo(),
    });
  }

  this.removeCurrentObject = function() {
    if(this.currentObject && this.objectIndex > 0) {
      this.objectIndex--;
      this.objectList.splice(this.objectIndex, 1);
      this.currentObject = null;

      this.notifyUpdater({
        isEmpty: this.isEmpty(),
        canRevoke: this.canRevoke(),
        canRedo: this.canRedo(),
      });
    }
  }

  this.reset = function() {
    this.objectList = [];
    this.objectIndex = 0;
    this.currentObject = null;
  }

  this.canRevoke = function() {
    return (this.objectIndex > 0);
  }

  this.revoke = function() {
    if(this.canRevoke()) {
      this.objectIndex--;
      this.updateAllObject();

      this.notifyUpdater({
        isEmpty: this.isEmpty(),
        canRevoke: this.canRevoke(),
        canRedo: this.canRedo(),
      });
    }
  }

  this.canRedo = function() {
    return (this.objectIndex < this.objectList.length);
  }
  
  this.redo = function() {
    if(this.canRedo()) {
      this.objectIndex++;
      this.updateAllObject();

      this.notifyUpdater({
        isEmpty: this.isEmpty(),
        canRevoke: this.canRevoke(),
        canRedo: this.canRedo(),
      });
    }
  }

  this.touchBegin = function(mode, x, y, session) {
    if(this.currentObject) {
      if(session == this.currentObject.session) {
        this.removeCurrentObject();
        return;
      }

      if(this.currentObject.status !== 'done') {
        this.removeCurrentObject();
      }
    }

    this.currentObject = {
      type: mode,
      color: this.drawColor,
      size: this.drawSize,
      angle: this.angle,
      status: 'begin',
      session: session,
    };
    this.addObject(this.currentObject);

    if (mode === 'graffiti') {
      this.beginGraffiti(x, y);
    }
    else if (mode === 'box') {
      this.startBox(x, y);
    }
    else if (mode === 'circle') {
      this.startCircle(x, y);
    }
    else if (mode === 'arrow') {
      this.startArrow(x, y);
    }
  }

  this.touchMove = function(mode, x, y, session) {
    if(this.currentObject) {
      if(this.currentObject.session !== session && this.currentObject.status !== 'done') {
        this.removeCurrentObject();
      }

      if (mode === 'graffiti') {
        this.addGraffitiPoint(x, y);
      }
      else if (mode === 'box') {
        this.updateBoxPoint(x, y);
      }
      else if (mode === 'circle') {
        this.updateCirclePoint(x, y);
      }
      else if (mode === 'arrow') {
        this.updateArrowPoint(x, y);
      }
    }
  }

  this.touchEnd = function(mode, session) {
    if(this.currentObject) {

      if(this.currentObject.session !== session && this.currentObject.status !== 'done') {
        this.removeCurrentObject();
      }

      if (mode === 'graffiti') {
        this.finishGraffiti();
      }
      else if (mode === 'box') {
        this.finishBox();
      }
      else if (mode === 'circle') {
        this.finishCircle();
      }
      else if (mode === 'arrow') {
        this.finishArrow();
      }

      if(this.currentObject.status === 'empty') {
        this.removeCurrentObject();
      }

      this.updateAllObject();
      this.currentObject = null;
      console.log(this.objectList);
    }
  }

  this.loadImage = function() {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
    });

    wx.downloadFile({
      url: this.imageUrl,
      complete: function (res) {
        console.log('download complete:', res);
        wx.hideLoading();
        if (res != null && res.errMsg != null && res.errMsg === 'downloadFile:ok' && res.statusCode != null && res.statusCode === 200) {
          that.localImageUrl = res.tempFilePath;
          that.updateImageSize();
        }
      }
    })
  };

  this.updateImageSize = function() {
    var that = this;
    wx.getImageInfo({
      src: this.localImageUrl,
      success: function(res) {
        that.imageWidth = res.width;
        that.imageHeight = res.height;
        that.imageOrientation = res.orientation;
        
        //限制图片最大宽高
        var maxSize = 1200;
        if(that.imageWidth > maxSize || that.imageHeight > maxSize) {
          if(that.imageWidth > that.imageHeight){
            that.imageHeight = maxSize * that.imageHeight / that.imageWidth;
            that.imageWidth = maxSize;
          }
          else {
            that.imageWidth = maxSize * that.imageWidth / that.imageHeight;
            that.imageHeight = maxSize;
          }
        }

        that.updateCanvasSize();
      }
    });
  }

  this.updateCanvasSize = function() {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.canvasWidth = res.windowWidth;
        that.canvasHeight = that.imageHeight * res.windowWidth / that.imageWidth;
        that.canvasTop = that.topPadding + ((res.windowHeight - that.canvasHeight - that.topPadding - that.bottomPadding) / 2);
        that.canvasLeft = 0;

        if(that.canvasHeight > res.windowHeight){
          that.canvasHeight = res.windowHeight;
          that.canvasWidth = that.imageWidth * res.windowHeight / that.imageHeight;
          that.canvasTop = 0;
          that.canvasLeft = (res.windowWidth - that.canvasWidth) / 2;
        }

        that.updateAllObject();

        that.notifyUpdater({
          imageUrl: that.imageUrl,
          localImageUrl: that.localImageUrl,
          imageWidth: that.imageWidth,
          imageHeight: that.imageHeight,
          canvasWidth: that.canvasWidth,
          canvasHeight: that.canvasHeight,
          canvasTop: that.canvasTop,
          canvasLeft: that.canvasLeft,

          angle: that.angle,
          scale: that.scale,
          deltaX: that.deltaX,
          deltaY: that.deltaY,
        });
      }
    });
  }

  this.setTransform = function(obj) {
    var needUpdate = false;
    if(obj.deltaX != null) {
      if(obj.deltaX !== this.deltaX) {
        this.deltaX = obj.deltaX;
        needUpdate = true;
      }
    }

    if(obj.deltaY != null) {
      if(obj.deltaY !== this.deltaY) {
        this.deltaY = obj.deltaY;
        needUpdate = true;
      }
    }

    if(obj.angle != null) {
      if(obj.angle !== this.angle) {
        this.angle = obj.angle;
        needUpdate = true;
      }
    }

    if(obj.scale != null) {
      if(obj.scale !== this.scale) {
        this.scale = obj.scale;
        needUpdate = true;
      }
    }
    
    if(needUpdate) {
        this.updateAllObject();
    }
  }

  this.setDrawColor = function(color) {
    this.drawColor = color;
  }

  this.setDrawSize = function(size) {
    this.drawSize = size;
  }

  this.transformInputPoint = function(xx,yy) {
    var x = (xx - this.canvasLeft + this.canvasWidth * ( this.scale -1) / 2 - this.deltaX) / this.scale;
    var y = (yy - this.canvasTop + this.canvasHeight * ( this.scale -1) / 2 - this.deltaY) / this.scale;
    // console.log(`(${Math.floor(xx)},${Math.floor(yy)}) -> (${Math.floor(x)},${Math.floor(y)})`);
    return {x, y};
  }


  /// 涂鸦
  this.drawGraffiti = function(context, object, transform) {
    var tX = this.canvasWidth / 2;
    var tY = this.canvasHeight / 2;
    context.beginPath();
    context.setLineWidth(object.size * this.scale);
    context.setStrokeStyle(object.color);
    context.setLineCap('round');
    context.setLineJoin('round');

    var pX = object.points[0][0];
    var pY = object.points[0][1];
    var mX = object.points[0][0];
    var mY = object.points[0][1];

    for (var j = 0; j < object.points.length; j++) {
      var point = object.points[j];
      context.moveTo(mX - tX, mY - tY);
      context.quadraticCurveTo(pX - tX, pY - tY, ((point[0] + pX) / 2) - tX, ((point[1] + pY) / 2) - tY);

      mX = (point[0] + pX) / 2;
      mY = (point[1] + pY) / 2;
      pX = point[0];
      pY = point[1];
    }
    context.stroke();
  }

  this.beginGraffiti = function(xx,yy) {
    let {x, y} = this.transformInputPoint(xx, yy);

    this.currentObject.points = [[x,y]];
    this.currentObject.movePoint = [x,y];
    this.currentObject.previouPoint = [x,y];

    this.tempContext.beginPath();
    this.tempContext.setLineWidth(this.drawSize * this.scale);
    this.tempContext.setStrokeStyle(this.drawColor);
    this.tempContext.setLineCap('round');
    this.tempContext.setLineJoin('round');

    this.tempContext.translate(this.canvasLeft + this.deltaX, this.canvasTop + this.deltaY);
    this.tempContext.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.tempContext.scale(this.scale, this.scale);
  }

  this.addGraffitiPoint = function(xx,yy) {

    let {x, y} = this.transformInputPoint(xx, yy);
    var tX = this.canvasWidth / 2;
    var tY = this.canvasHeight / 2;

    var pX = this.currentObject.previouPoint[0];
    var pY = this.currentObject.previouPoint[1];

    var distance = (pX - x) * (pX - x) + (pY - y) * (pY - y);
    if(distance > 25){
      this.tempContext.moveTo(this.currentObject.movePoint[0] - tX, this.currentObject.movePoint[1] - tY);
      this.tempContext.quadraticCurveTo(pX - tX, pY - tY, (x + pX) / 2 - tX, (y + pY) / 2 - tY);
      this.tempContext.stroke();
      this.tempContext.draw(true);

      this.currentObject.previouPoint = [x, y];
      this.currentObject.movePoint = [(x + pX) / 2, (y + pY) / 2];
      this.currentObject.points.push([x,y]);
      this.currentObject.status = 'move';
    }
    else {
      // console.log('skip')
    }
  }

  this.finishGraffiti = function() {
    if(this.currentObject.points.length < 2) {
      this.currentObject.status = 'empty';
    }
    else {
      this.currentObject.status = 'done';
    }
  }

  /// 矩形
  this.drawBox = function(context, object, transform) {
    var tX = this.canvasWidth / 2;
    var tY = this.canvasHeight / 2;
    context.beginPath();
    context.setLineWidth(object.size * this.scale);
    context.setStrokeStyle(object.color);
    context.setLineCap('round');
    context.setLineJoin('round');

    var lX = Math.min(object.startPoint[0], object.endPoint[0]);
    var lY = Math.min(object.startPoint[1], object.endPoint[1]);
    var boxWidth = Math.abs(object.startPoint[0] - object.endPoint[0]);
    var boxHeight = Math.abs(object.startPoint[1] - object.endPoint[1]);

    context.strokeRect(lX - tX, lY - tY, boxWidth, boxHeight);
  }

  this.startBox = function(xx, yy) {
    let {x, y} = this.transformInputPoint(xx, yy);

    this.currentObject.startPoint = [x, y];
    this.currentObject.endPoint = [x, y];
  }

  this.updateBoxPoint = function(xx, yy) {
    let {x, y} = this.transformInputPoint(xx, yy);
    this.currentObject.endPoint = [x, y];
    this.currentObject.status = 'move';

    this.tempContext.translate(this.canvasLeft + this.deltaX, this.canvasTop + this.deltaY);
    this.tempContext.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.tempContext.scale(this.scale, this.scale);

    this.drawBox(this.tempContext, this.currentObject);
    this.tempContext.draw(false);
  }

  this.currentObjectDistance = function() {
    var sX = this.currentObject.startPoint[0];
    var sY = this.currentObject.startPoint[1];
    var eX = this.currentObject.endPoint[0];
    var eY = this.currentObject.endPoint[1];
    var distance = ( sX - eX) * (sX - eX) + (sY - eY) * (sY - eY);
    return distance;
  }

  this.finishBox = function (){
    if(this.currentObjectDistance() < 9) {
      this.currentObject.status = 'empty';
    }
    else {
      this.currentObject.status = 'done';
    }    
  }

  /// 圆形
  this.drawCircle = function(context, object, transform) {
    var tX = this.canvasWidth / 2;
    var tY = this.canvasHeight / 2;
    context.beginPath();
    context.setLineWidth(object.size * this.scale);
    context.setStrokeStyle(object.color);
    context.setLineCap('round');
    context.setLineJoin('round');

    var xx = Math.min(object.startPoint[0], object.endPoint[0]);
    var yy = Math.min(object.startPoint[1], object.endPoint[1]);
    var aa = Math.abs(object.startPoint[0] - object.endPoint[0]);
    var bb = Math.abs(object.startPoint[1] - object.endPoint[1]);

    var x = (2 * xx + aa) / 2;
    var y = (2 * yy + bb) / 2;
    var a = aa /2;
    var b = bb /2;
    var ox = 0.5 * a, oy = 0.6 * b;

    context.moveTo(x - tX, y + b - tY);
    context.bezierCurveTo(x + ox - tX, y + b - tY, x + a - tX, y + oy - tY, x + a - tX, y - tY);
    context.bezierCurveTo(x + a - tX, y - oy - tY, x + ox - tX, y - b - tY, x - tX, y - b - tY);
    context.bezierCurveTo(x - ox - tX, y - b - tY, x - a - tX, y - oy - tY, x - a - tX, y - tY);
    context.bezierCurveTo(x - a - tX, y + oy - tY, x - ox - tX, y + b - tY, x - tX, y + b - tY);
    context.closePath();
    context.stroke();
  }

  this.startCircle = function(xx, yy) {
    let {x, y} = this.transformInputPoint(xx, yy);

    this.currentObject.startPoint = [x, y];
    this.currentObject.endPoint = [x, y];
  }

  this.updateCirclePoint = function(xx, yy) {
    let {x, y} = this.transformInputPoint(xx, yy);
    this.currentObject.endPoint = [x, y];
    this.currentObject.status = 'move';

    this.tempContext.translate(this.canvasLeft + this.deltaX, this.canvasTop + this.deltaY);
    this.tempContext.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.tempContext.scale(this.scale, this.scale);
    this.drawCircle(this.tempContext, this.currentObject);
    this.tempContext.draw(false);
  }

  this.finishCircle = function() {
    if(this.currentObjectDistance() < 9) {
      this.currentObject.status = 'empty';
    }
    else {
      this.currentObject.status = 'done';
    }    
  }


  /// 箭头
  this.arrowHeadPoint = function(a, b, alpha, d){
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

  this.drawArraw = function(context, object, transform) {
    var tX = this.canvasWidth / 2;
    var tY = this.canvasHeight / 2;

    var option = {
      d1: object.size * 8 * this.scale,
      angle1: 30 / 180 * Math.PI,
      d2: object.size * 8 * 0.7 * this.scale,
      angle2: 15 / 180 * Math.PI
    };
    var distance = (object.startPoint[0] - object.endPoint[0]) * (object.startPoint[0] - object.endPoint[0]) + (object.startPoint[1] - object.endPoint[1]) * (object.startPoint[1] - object.endPoint[1]);

    if (distance < (object.size * 5 * 1.2) * (object.size * 5 * 1.2)) {
      // context.draw(false);
      return;
    }
    context.beginPath();
    context.setFillStyle(object.color);
    context.setLineCap('round');
    context.setLineJoin('round');

    var h1 = this.arrowHeadPoint(object.startPoint, object.endPoint, option.angle1, option.d1);
    var h2 = this.arrowHeadPoint(object.startPoint, object.endPoint, -option.angle1, option.d1);
    var h3 = this.arrowHeadPoint(object.startPoint, object.endPoint, option.angle2, option.d2);
    var h4 = this.arrowHeadPoint(object.startPoint, object.endPoint, -option.angle2, option.d2);

    context.moveTo(object.startPoint[0] - tX, object.startPoint[1] - tY);
    context.lineTo(h3[0] - tX, h3[1] - tY);
    context.lineTo(h1[0] - tX, h1[1] - tY);
    context.lineTo(object.endPoint[0] - tX, object.endPoint[1] - tY);
    context.lineTo(h2[0] - tX, h2[1] - tY);
    context.lineTo(h4[0] - tX, h4[1] - tY);
    context.closePath();
    context.fill();
  }

  this.startArrow = function(xx, yy) {
    let {x, y} = this.transformInputPoint(xx, yy);
    
    this.currentObject.startPoint = [x, y];
    this.currentObject.endPoint = [x, y];
  }

  this.updateArrowPoint = function(xx, yy) {
    let {x, y} = this.transformInputPoint(xx, yy);
    this.currentObject.endPoint = [x, y];
    this.currentObject.status = 'move';
    this.tempContext.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.tempContext.translate(this.canvasLeft + this.deltaX, this.canvasTop + this.deltaY);
    this.tempContext.scale(this.scale, this.scale);
    this.drawArraw(this.tempContext, this.currentObject);
    this.tempContext.draw(false);
  }

  this.finishArrow = function () {
    if(this.currentObjectDistance() < 9) {
      this.currentObject.status = 'empty';
    }
    else {
      this.currentObject.status = 'done';
    }    
  }

  /// 所有的
  this.drawAllObject = function(context) {
    for(var i=0; i<this.objectList.length; i++) {
      if(i >= this.objectIndex) {
        break;
      }
      var object = this.objectList[i];
      context.rotate(-object.angle * Math.PI / 180);
      if (object.type === 'graffiti') {
        this.drawGraffiti(context, object);
      }
      else if(object.type === 'box') {
        this.drawBox(context, object);
      }
      else if (object.type === 'circle') {
        this.drawCircle(context, object);
      }
      else if (object.type === 'arrow') {
        this.drawArraw(context, object);
      }
      context.rotate(object.angle * Math.PI / 180);
    }
  }
  
  this.updateAllObject = function (){
    this.mainContext.translate(this.canvasLeft + this.deltaX, this.canvasTop + this.deltaY);
    this.mainContext.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.mainContext.rotate(this.angle * Math.PI / 180);
    this.mainContext.scale(this.scale, this.scale);
    
    this.drawAllObject(this.mainContext);
    this.mainContext.draw(false);
    this.tempContext.draw(false);
  }

  this.outputImage = function(obj) {
    console.log('start output');
    var that = this;
    var context = wx.createCanvasContext('outputCanvas');
    
    context.translate(this.outputWidth() / 2, this.outputHeight() / 2);
    context.rotate(this.angle * Math.PI / 180);
    context.drawImage(this.localImageUrl, -this.imageWidth / 2, -this.imageHeight / 2, this.imageWidth, this.imageHeight);
    context.rotate(-this.angle * Math.PI / 180);
    context.translate(-this.outputWidth() / 2, -this.outputHeight() / 2);

    var scale = this.imageWidth / this.canvasWidth;
    context.scale(scale, scale);

    if(this.angle == 90 || this.angle == 270) {
      context.translate(this.canvasHeight / 2, this.canvasWidth / 2);
    }
    else {
      context.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    }
    context.rotate(this.angle * Math.PI / 180);

    this.drawAllObject(context);
    context.draw(false, function(){
      console.log('draw finish', that.outputWidth(), that.outputHeight());
      setTimeout(function(){
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: that.outputWidth(),
          height: that.outputHeight(),
          destWidth: that.outputWidth(),
          destHeight: that.outputHeight(),
          canvasId: 'outputCanvas',
          fileType: 'jpg',
          quality: 0.7,
          success(res) {
            console.log(res);
            if(obj && obj.success) {
              obj.success(res.tempFilePath);
            }
          },
          fail(res) {
            console.log(res);
            wx.showToast({
              icon: 'none',
              title: '保存图片出错',
            });
            if(obj && obj.fail) {
              obj.fail();
            }
          }
        });
      }, 300);
    });
  }

  this.loadImage();
  this.updateAllObject();
  this.notifyUpdater({
    canRevoke: this.canRevoke(),
    canRedo: this.canRedo(),
    drawColor: this.drawColor,
    drawSize: this.drawSize,
  });
}

module.exports = Drawer;