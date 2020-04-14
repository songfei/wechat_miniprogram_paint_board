class BaseShape {

  constructor() {
    this.type = 'unknow';
    this.color = '#ff0000';
    this.lineWidth = 3;

    this.angle = 0;
    this.topLeft = [0, 0];
    this.bottomRight = [0, 0];

    this.status = 'init';
    this.touchSession = -1;
  }

  startShape(x, y) {}
  addPoint(x, y) {}
  finishShape() {}

  hitTest(x, y) {
    return false;
  }

  drawShape(context) {}
}

class LineShape extends BaseShape {


}

class RectShape extends BaseShape {
  
}

class CircleShape extends BaseShape {

}

class ArrowShape extends BaseShape {

}

class GraffitiShape extends BaseShape {
  
}

class TextShape extends BaseShape {

}