type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

const DEFAULT_ANIMATION_DURATION = 500;

interface AnimationOptions {
  startValue: number;
  endValue: number;
  easingFunction: (t: number, b: number, c: number, d: number) => number;
  duration: number;
}

function easeInOutExpo(t: number, b: number, c: number, d: number) {
  if (t == 0) return b;
  if (t == d) return b + c;
  if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
  return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
}

export class Animation {
  startValue: AnimationOptions["startValue"];
  endValue: AnimationOptions["endValue"];
  easingFunction: AnimationOptions["easingFunction"];
  duration: AnimationOptions["duration"];
  private currentValue: AnimationOptions["startValue"];
  private isAnimating: boolean = true;
  private startTime: number;
  private direction: "forward" | "backwards" = "forward";

  constructor(
    animationOptions: Optional<AnimationOptions, "duration" | "easingFunction">
  ) {
    this.startValue = animationOptions.startValue;
    this.endValue = animationOptions.endValue;
    this.currentValue = animationOptions.startValue;
    this.easingFunction = animationOptions.easingFunction || easeInOutExpo;
    this.duration = animationOptions.duration || DEFAULT_ANIMATION_DURATION;
    this.isAnimating = false;
    this.startTime = Date.now() + this.duration;
  }

  update(updateFn: (newValue: number) => void) {
    if (!this.isAnimating) return this;
    const endValue =
      this.direction === "forward" ? this.endValue : this.startValue;
    const progress = Date.now() - this.startTime;
    const difference = endValue - this.currentValue;
    const value = this.easingFunction(
      progress,
      this.currentValue,
      difference,
      this.duration
    );
    if (progress > this.duration) {
      this.isAnimating = false;
      return this;
    }
    this.currentValue = value;
    updateFn(this.currentValue);
    return this;
  }

  forwards() {
    this.direction = "forward";
    return this;
  }

  backwards() {
    this.direction = "backwards";
    return this;
  }

  start() {
    this.startTime = Date.now();
    if (this.isAnimating) return;
    this.isAnimating = true;
    const startValue =
      this.direction === "forward" ? this.startValue : this.endValue;
    this.currentValue = startValue;
    return this;
  }
}
