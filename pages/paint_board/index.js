// pages/paint_board/index.js
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

    deltaX: 0,
    deltaY: 0,
    angle: 0,
    scale: 1,

    drawMode: '',
    drawColor: '#ff0000',
    drawSize: 3,

    canSubmit: false,
    canRevoke: false,
    canRedo: false,

    drawTools: [
      {
        name: 'graffiti',
      },
      {
        name: 'circle',
      },
      {
        name: 'box',
      },
      {
        name: 'arrow',
      },
      {
        name: 'text',
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
      {
        name: 'orange',
        color: '#ffa500',
      },
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
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
      imageList[currentImageIndex].drawer = new Drawer(imageList[currentImageIndex].imageUrl, this.updater);
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onClickModeButton: function(e) {
    console.log(e);
    var mode = e.currentTarget.dataset.mode;
    this.setData({
      drawMode: mode,
    })
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
})