// pages/paint_board/index.js

import {WechatCanvasContext} from './canvas_context.js';
import {LineShape, RectShape, CircleShape, ArrowShape, TextShape} from './drawing_shape.js';
import WxTouch from './wx-touch.js';
import {Drawer} from './drawer.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '标题',
    menuButtonRect: null,
    topPadding: 0,
    bottomPadding: 0,

    imageList: [],
    currentImageIndex: 0,

    imageUrl: '',
    localImageUrl: '',
    imageWidth: 0,
    imageHeight: 0,

    outputWidth: 0,
    outputHeight: 0,
    
    canvasWidth: 0,
    canvasHeight: 0,
    canvasTop: 0,
    canvasLeft: 0,

    dx: 0,
    dy: 0,
    angle: 0,
    scale: 1,

    drawMode: '',
    drawColor: '#ff0000',
    drawSize: 3,

    canSubmit: false,
    isEmpty: true,
    canRevoke: false,
    canRedo: false,

    drawTools: [
      {
        name: 'move',
      },
      {
        name: 'graffiti',
      },
      {
        name: 'circle',
      },
      {
        name: 'rect',
      },
      {
        name: 'arrow',
      },
   
    ],
    colorList: [
      {
        name: 'red',
        color: '#ff0000',
      },
      {
        name: 'green',
        color: '#00ff00',
      }, 
      {
        name: 'blue',
        color: '#0000ff',
      },
      {
        name: 'yellow',
        color: '#ffff00',
      },
      {
        name: 'cyan',
        color: '#00ffff',
      },
      {
        name: 'magenta',
        color: '#ff00ff',
      },
      // {
      //   name: 'orange',
      //   color: '#ffa500',
      // },
      {
        name: 'black',
        color: '#000000',
      },
      {
        name: 'white',
        color: '#ffffff',
      }
    ],
    showColorBar: false,
    sizeList: [
      {
        name: '1',
        size: 1,
      },
      {
        name: '2',
        size: 2,
      },
      {
        name: '4',
        size: 4,
      },
      {
        name: '6',
        size: 6,
      },
      {
        name: '8',
        size: 8,
      },
      {
        name: '10',
        size: 10,
      },
    ],
    showSizeBar: false,
    showOutputCanvas: true,

    consoleTexts: ['hello, world!'],
  },

  touchTransform: {
    dx: 0,
    dy: 0,
    angle: 0,
    scale: 1,
  },
  
  onLoad: function (options) {
    var currentImageIndex = 0;
    if(options && options.imageUrls) {
      var imageList = options.imageUrls.split('|').map(function(v) {
        return {
          imageUrl: decodeURIComponent(v)
        };
      });
      if(imageList.length > 0) {
        currentImageIndex = parseInt(options.index) || 0;
        if(currentImageIndex >= imageList.length) {
          currentImageIndex = 0;
        }
      }

      var systemInfo = wx.getSystemInfoSync();
      console.log(systemInfo);
      imageList[currentImageIndex].drawer = new Drawer({
        imageUrl: imageList[currentImageIndex].imageUrl, 
        updater: this.updater, 
        width: systemInfo.windowWidth,
        height: systemInfo.windowHeight,
        loger: this.addLog,
      });
      console.log('image list:', imageList);

      this.setData({
        imageList: imageList,
        currentImageIndex: currentImageIndex,
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;

    setTimeout(function () {
      that.setData({ drawMode: 'graffiti'});
    }, 100); 

    var res = wx.getMenuButtonBoundingClientRect();
    this.setData({
      menuButtonRect: res,
    });
  },

  onShow: function () {
    wx.hideShareMenu();

    // var context = new WechatCanvasContext('mainCanvas', 'tempCanvas');
    
    // context.setStrokeStyle('#00ff00');
    // context.setLineWidth(1);
    // context.moveTo(187.5, 0);
    // context.lineTo(187.5, 600);
    // context.moveTo(0, 350);
    // context.lineTo(375, 350);
    // context.stroke();

    // var shape = new CircleShape();
    // shape.centerPoint = [187.5,350];
    // shape.points[0] = [ -50, -30];
    // shape.points[1] = [50, 30];
    // shape.transform.angle = 30 * 2 * Math.PI / 360;
    // shape.drawShape(context);
    // shape.drawSelectedBorder(context);

    // shape.transform.angle = 60 * 2 * Math.PI / 360;
    // shape.transform.scale = 3;
    // shape.drawShape(context);
    // shape.drawSelectedBorder(context);
    // shape.transform.scale = 1;
    // shape.transform.dx = 50;
    // shape.transform.dy = 50;
    // shape.transform.angle = 0;
    // shape.drawShape(context);
    // shape.drawSelectedBorder(context);


    // var textShape = new TextShape();
    // textShape.centerPoint = [187.5,350];
    // textShape.text = '宋飞卓越';
    // textShape.strokeColor = "#ffffff";
    // textShape.transform.scale = 2;
    // textShape.transform.angle = 30 * 2 * Math.PI / 360;
    // textShape.updateTextRect(context);
    // textShape.drawShape(context);
    // textShape.drawSelectedBorder(context);

    // context.draw();
  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onShareAppMessage: function () {

  },

  updater(obj) {
    console.log('update:', obj)

    let canSubmit = false
    for (let i = 0; i < this.data.imageList.length; i++) {
      const imageItem = this.data.imageList[i]
      if (imageItem.drawer && !imageItem.drawer.isEmpty) {
        canSubmit = true
      }
    }
    this.setData({ canSubmit, ...obj })
  },

  currentDrawer: function() {
    return this.data.imageList[this.data.currentImageIndex].drawer;
  },

  onClickModeButton: function(e) {
    console.log(e);
    var mode = e.currentTarget.dataset.mode;
    this.setData({
      drawMode: mode,
    })
    this.currentDrawer().drawMode = mode;
  },
  onClickModeColorButton: function() {
    this.setData({
      showSizeBar: false,
      showColorBar: !this.data.showColorBar,
    })
  },
  onClickColorButton: function(e) {
    var color = e.currentTarget.dataset.color;
    // this.currentDrawer().setDrawColor(color);
    this.setData({
      drawColor: color,
      showColorBar: false,
    })
  },
  onClickModeSizeButton: function() {
    this.setData({
      showSizeBar: !this.data.showSizeBar,
      showColorBar: false,
    })
  },
  onClickSizeButton: function(e) {
    var size = e.currentTarget.dataset.size;
    // this.currentDrawer().setDrawSize(size);
    this.setData({
      drawSize: size,
      showSizeBar: false,
    })
  },
  onClickCleanButton: function() {
    var that = this;
    if (!this.currentDrawer().isEmpty) {
      wx.showModal({
        content: '确定清除所有绘制？',
        success (res) {
          if (res.confirm) {
            that.currentDrawer().reset();
          }
        },
      });
    }
  },
  onClickRevokeButton: function() {
    if(this.data.canRevoke) {
      this.currentDrawer().revoke();
    }
  },
  onClickRedoButton: function() {
    if(this.data.canRedo) {
      this.currentDrawer().redo();
    }
  },
  onClickTextButton: function() {
    var that = this;
    wx.navigateTo({
      url: '/pages/input_text/index',
      events: {
        editTextFinish: function(data) {
          setTimeout(function(){
            console.log(data)
            that.currentDrawer().addTextShape(data);
            that.setData({
              drawMode: 'move',
            });
          }, 500);
        },
      },
      success: function(res) {
        // res.eventChannel.emit('updateText', { data: 'test' })
      }
    });
  },
  touchStart: function(e) {
    // console.log('touch start', e)
    this.currentDrawer().touch.touchStart({
      timestamp: e.timeStamp,
      touches: e.touches.map(function(v){
        return {
          id: v.identifier,
          x: v.clientX,
          y: v.clientY,
        };
      }),
    });
  },
  touchMove: function(e) {
    // console.log('touch move', e);
    this.currentDrawer().touch.touchMove({
      timestamp: e.timeStamp,
      touches: e.touches.map(function(v){
        return {
          id: v.identifier,
          x: v.clientX,
          y: v.clientY,
        };
      }),
    });
  },
  touchEnd: function(e) {
    // console.log('touch end', e);
    this.currentDrawer().touch.touchEnd({
      timestamp: e.timeStamp,
      touches: e.touches.map(function(v){
        return {
          id: v.identifier,
          x: v.clientX,
          y: v.clientY,
        };
      }),
    });
  },


  ...WxTouch("Touch", {
    touchstart(evt) {
      // this.log('start touch!' + evt.sessionId);
      this.touchTransform.dx = this.data.dx;
      this.touchTransform.dy  = this.data.dy;
      this.touchTransform.angle = this.data.angle;
      this.touchTransform.scale = this.data.scale;

      this.currentDrawer().touchBegin(this.data.drawMode, evt.touches[0].clientX, evt.touches[0].clientY, evt.sessionId);
      
    },

    touchmove(evt) {
      // console.log(evt);

      // 屏蔽回退手势
      if(evt.touches[0].clientY < 0) {
        return;
      }

      let undef, data = {};

      // var realCanvasWidth = (this.data.transform.scale.angle == 90 || this.data.transform.scale.angle == 270) ? this.data.canvasHeight : this.data.canvasWidth;
      // var realCanvasHeight = (this.data.transform.scale.angle == 90 || this.data.transform.scale.angle == 270) ? this.data.canvasWidth : this.data.canvasHeight;

      if (evt.scale !== undef) {
        data.scale = evt.scale;

        if(data.scale < 1) {
          data.scale = 1;
        }
  
        if(data.scale > 3) {
          data.scale = 3;
        }
      }

      if (evt.deltaX !== undef) {
        data.dx = evt.deltaX;
        data.dy = evt.deltaY;

        // var maxDeltaX =  Math.abs(realCanvasWidth * ( data.scale - 1) / 2);
        // var maxDeltaY =  Math.abs(realCanvasHeight * ( data.scale.scale - 1) / 2);

        // if(data.dx > maxDeltaX) {
        //   data.dx = maxDeltaX;
        // }
        // if(data.dx < -maxDeltaX) {
        //   data.dx = -maxDeltaX;
        // }

        // if(data.dy > maxDeltaY) {
        //   data.dy = maxDeltaY;
        // }
        // if(data.dy < -maxDeltaY) {
        //   data.dy = -maxDeltaY;
        // } 
      }

      // if (evt.angle !== undef) {
      //   data.angle = evt.angle;
      // }

      // this.log('dx,xy:' + Math.floor(data.deltaX) + ',' + Math.floor(data.deltaY) + '   scale:' + data.scale);
      // 一次性调用 setData
      this.setData(data);
      this.currentDrawer().setTransform(data);

      if(evt.touches.length === 1) {
        this.currentDrawer().touchMove(this.data.drawMode, evt.touches[0].clientX, evt.touches[0].clientY, evt.sessionId);
      }
    },

    touchend(evt) {
      // console.log(evt);
      // this.log('end touch!' + evt.sessionId)

      if (evt.touches.length) {
        this.touchTransform.dx = this.data.transform.dx;
        this.touchTransform.dy = this.data.transform.dy;
      }

      this.currentDrawer().touchEnd(this.data.drawMode, evt.sessionId);
    },

    touchcancel(evt) {
      // this.log('cancel touch!' + evt.sessionId)

    },

    pressmove(evt) {
      // console.log(evt);
      evt.deltaX += store.deltaX;
      evt.deltaY += store.deltaY;
    },

    // rotate(evt) {
    //   // console.log(evt);

    //   // 仅仅设置数据，统一到 touchmove 处理器中调用 setData
    //   // evt.angle += store.angle;
    // },

    pinch(evt) {
      evt.scale *= store.scale;
    },
  })
})