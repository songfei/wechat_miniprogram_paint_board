import { WechatCanvasContext } from './canvas_context.js';
import { HitTestStatus, GraffitiShape, LineShape, RectShape, CircleShape, ArrowShape, TextShape } from './drawing_shape.js';
import { DrawingBoard } from './drawing_board.js';
import { DrawingTouch } from './drawing_touch.js';

class Drawer {

  constructor(obj) {
    var that = this;
    this.loger = obj.loger;
    this.width = obj.width;
    this.height = obj.height;

    this.imageUrl = obj.imageUrl;
    this.localImageUrl = '';
    this.imageWidth = 0;
    this.imageHeight = 0;

    this.drawMode = 'graffiti';

    this.updater = obj.updater;
    this.board = new DrawingBoard({
      updater: obj.updater, 
      width: obj.width, 
      height: obj.height,
    });
    this.touch = new DrawingTouch({
      touchTransform: function(event) {
        console.log('touch transform', event);
      },
      touchStart: function(event) {
        that.board.touchStart(that.drawMode, event.x, event.y, event.session);
      },
      touchMove: function(event) {
        that.board.touchMove(that.drawMode, event.x, event.y, event.session);
      },
      touchEnd: function(event) {
        that.board.touchEnd(that.drawMode, event.session);

      },
      touchCancel: function(event) {

      },
    });

  }
}

module.exports = {
  Drawer,
}