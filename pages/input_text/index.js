// pages/input_text/index.js

import {WechatCanvasContext} from '../paint_board/canvas_context.js';
import {TextShape} from '../paint_board/drawing_shape.js';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    screenWidth: 0,
    text: '宋飞卓越',
    style: 1,
    color: {
      name: 'red',
      color: '#ff0000',
      fillColor: '#ff0000',
      strokeColor: '#ffffff'
    },

    colorList: [
      {
        name: 'red',
        color: '#ff0000',
        fillColor: '#ff0000',
        strokeColor: '#ffffff'
      },
      {
        name: 'green',
        color: '#00ff00',
        fillColor: '#00ff00',
        strokeColor: '#000000'
      }, 
      {
        name: 'blue',
        color: '#0000ff',
        fillColor: '#0000ff',
        strokeColor: '#ffffff'
      },
      {
        name: 'yellow',
        color: '#ffff00',
        fillColor: '#ffff00',
        strokeColor: '#000000'
      },
      {
        name: 'cyan',
        color: '#00ffff',
        fillColor: '#00ffff',
        strokeColor: '#000000'
      },
      {
        name: 'magenta',
        color: '#ff00ff',
        fillColor: '#ff00ff',
        strokeColor: '#ffffff'
      },
      // {
      //   name: 'orange',
      //   color: '#ffa500',
      // },
      {
        name: 'black',
        color: '#000000',
        fillColor: '#000000',
        strokeColor: '#ffffff'
      },
      {
        name: 'white',
        color: '#ffffff',
        fillColor: '#ffffff',
        strokeColor: '#000000'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const res = wx.getSystemInfoSync();
    this.setData({
      screenWidth: res.windowWidth,
    });

    this.textShape = new TextShape();

    const eventChannel = this.getOpenerEventChannel()
    console.log('event', eventChannel);
    if(eventChannel && eventChannel.on) {
      eventChannel.on('updateTextInfo', function(data) {
        console.log(data)
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.canvasContext = new WechatCanvasContext('mainCanvas');
    this.updateText();
  },

  updateText: function() {
    this.textShape.text = this.data.text;
    this.textShape.centerPoint = [this.data.screenWidth / 2, 100];
    this.textShape.fillColor = this.data.color.fillColor;
    this.textShape.strokeColor = this.data.color.strokeColor;
    this.textShape.drawShape(this.canvasContext);
    this.canvasContext.draw();
  },

  onInputText: function(e) {
    this.setData({
      text: e.detail.value,
    });
    this.updateText();
  },

  onClickColorButton: function(e) {
    var color = this.data.colorList[e.currentTarget.dataset.index];
    this.setData({
      color: color,
    });
    this.updateText();
  },

  onFinishButton: function(e) {
    const eventChannel = this.getOpenerEventChannel();
    if(eventChannel && eventChannel.emit) {
      eventChannel.emit('editTextFinish', {
        text: this.data.text,
        fillColor: this.data.color.fillColor,
        strokeColor: this.data.color.strokeColor,
        style: this.data.style,
      });
    }

    wx.navigateBack();
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

  }
})