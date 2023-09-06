// Inspired by Ciprian Popescu
// https://dev.to/wolffe/i-created-a-draggable-carousel-with-momentum-scrolling-and-mobile-support-using-vanilla-javascript-17he
export class MomentumDraggable {
  private element: HTMLElement;
  private isDown: boolean = false;
  private startX: number = 0;
  private scrollLeft: number = 0;
  private momentumID: number = 0;
  private velX: number = 0;

  constructor(element: HTMLElement) {
    this.element = element;

    this.element.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.element.addEventListener("mouseleave", this.onMouseLeave.bind(this));
    this.element.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.element.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.element.addEventListener("wheel", this.onWheel.bind(this));
  }

  public getScrollLeft() {
    return this.scrollLeft;
  }

  private onMouseDown(event: MouseEvent) {
    this.isDown = true;
    this.startX = event.pageX;
    this.cancelMomentumTracking();
  }

  private onMouseLeave() {
    this.isDown = false;
    this.beginMomentumTracking();
  }

  private onMouseUp() {
    this.isDown = false;
    this.beginMomentumTracking();
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isDown) return;
    const x = event.pageX;
    const walk = x - this.startX;
    const prevScrollLeft = this.scrollLeft;
    this.scrollLeft += walk;
    this.velX = this.scrollLeft - prevScrollLeft;
  }

  private onWheel(event: WheelEvent) {
    event.preventDefault();
    this.cancelMomentumTracking();
  }

  private beginMomentumTracking() {
    this.cancelMomentumTracking();
    this.momentumID = requestAnimationFrame(this.momentumLoop.bind(this));
  }

  private cancelMomentumTracking() {
    cancelAnimationFrame(this.momentumID);
  }

  private momentumLoop() {
    this.scrollLeft += this.velX * 2;
    this.velX *= 0.95;
    if (Math.abs(this.velX) > 0.5) {
      this.momentumID = requestAnimationFrame(this.momentumLoop.bind(this));
    }
  }
}
