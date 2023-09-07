// Inspired by Ciprian Popescu
// https://dev.to/wolffe/i-created-a-draggable-carousel-with-momentum-scrolling-and-mobile-support-using-vanilla-javascript-17he
export class MomentumDraggable {
  private element: HTMLElement;
  private isDown: boolean = false;
  private startX: number = 0;
  private dragXOffset: number = 0;
  private startY: number = 0;
  private dragYOffset: number = 0;
  private xMomentumID: number = 0;
  private yMomentumID: number = 0;
  private xVelocity: number = 0;
  private yVelocity: number = 0;

  constructor(element: HTMLElement) {
    this.element = element;

    this.element.addEventListener("mousedown", this.onPressDown.bind(this));
    this.element.addEventListener("mouseleave", this.onPressRelease.bind(this));
    this.element.addEventListener("mouseup", this.onPressRelease.bind(this));
    this.element.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.element.addEventListener("touchstart", this.onPressDown.bind(this));
    this.element.addEventListener("touchend", this.onPressRelease.bind(this));
    this.element.addEventListener("touchmove", this.onMouseMove.bind(this));
    this.element.addEventListener(
      "touchcancel",
      this.onPressRelease.bind(this)
    );
  }

  public getOffset() {
    return {
      x: this.dragXOffset,
      y: this.dragYOffset,
    };
  }

  private onPressDown(event: MouseEvent | TouchEvent) {
    this.isDown = true;
    const { x, y } = this.getPageOffsetFromMouseOrTouchEvent(event);
    this.startX = x;
    this.startY = y;
    this.cancelMomentumTracking();
  }

  private onPressRelease() {
    this.isDown = false;
    this.beginMomentumTracking();
  }

  private onMouseMove(event: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const { x, y } = this.getPageOffsetFromMouseOrTouchEvent(event);
    const walkX = x - this.startX;
    const walkY = y - this.startY;
    const prevXOffset = this.dragXOffset;
    const prevYOffset = this.dragYOffset;
    this.dragXOffset += walkX;
    this.dragYOffset += walkY;
    this.xVelocity = this.dragXOffset - prevXOffset;
    this.yVelocity = this.dragYOffset - prevYOffset;
  }

  private beginMomentumTracking() {
    this.cancelMomentumTracking();
    this.xMomentumID = requestAnimationFrame(this.xMomentumLoop.bind(this));
    this.yMomentumID = requestAnimationFrame(this.yMomentumLoop.bind(this));
  }

  private cancelMomentumTracking() {
    cancelAnimationFrame(this.xMomentumID);
    cancelAnimationFrame(this.yMomentumID);
  }

  private xMomentumLoop() {
    this.dragXOffset += this.xVelocity * 2;
    this.xVelocity *= 0.95;
    if (Math.abs(this.xVelocity) > 0.5) {
      this.xMomentumID = requestAnimationFrame(this.xMomentumLoop.bind(this));
    }
  }

  private yMomentumLoop() {
    this.dragYOffset += this.yVelocity * 2;
    this.yVelocity *= 0.95;
    if (Math.abs(this.yVelocity) > 0.5) {
      this.yMomentumID = requestAnimationFrame(this.yMomentumLoop.bind(this));
    }
  }

  private getPageOffsetFromMouseOrTouchEvent(event: MouseEvent | TouchEvent) {
    const obj = event instanceof TouchEvent ? event.touches[0] : event;
    return { x: obj.pageX, y: obj.pageY };
  }
}
