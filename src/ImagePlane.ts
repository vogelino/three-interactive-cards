import * as THREE from "three";

type ConfigType = {
  imagePath: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function easeInOutExpo(t: number, b: number, c: number, d: number) {
  if (t == 0) return b;
  if (t == d) return b + c;
  if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
  return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
}

export class ImagePlane {
  private mesh: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicMaterial | THREE.MeshBasicMaterial[]
  >;
  private mouseOvered: boolean = false;
  private config: ConfigType;
  private currentAnimationProgressStartTime = Date.now();
  private currentAnimationProgressTime = Date.now();
  private currentAnimationStartWidth = 1;
  private currentAnimationStartRotation = 0;
  private animationPhase: "mouseEnter" | "mouseLeave" | "click" | "none" =
    "none";

  constructor(config: ConfigType) {
    const { imagePath } = config;
    const { x, y } = config;
    this.config = config;
    new THREE.TextureLoader().load(imagePath, (texture) => {
      this.mesh.material = new THREE.MeshBasicMaterial({
        map: texture,
      });
    });
    const { width, height } = this.getOriginalSize();
    const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.setX(x);
    this.mesh.position.setY(y);
    this.mesh.scale.setX(this.currentAnimationStartWidth);
    this.mesh.scale.setY(this.currentAnimationStartWidth);

    return this;
  }

  private getOriginalSize() {
    const { width, height } = this.config;
    const aspectRatio = width / height;
    const imageWidth = 5;
    const imageHeight = imageWidth / aspectRatio;
    return { width: imageWidth, height: imageHeight };
  }

  getMesh() {
    return this.mesh;
  }

  update() {
    const ANIMATION_DURATION = 500;
    const isMouseEnter = this.animationPhase === "mouseEnter";
    const isMouseLeave = this.animationPhase === "mouseLeave";
    const isClick = this.animationPhase === "click";
    const isAnimating = isMouseEnter || isMouseLeave || isClick;

    if (!isAnimating) return;
    this.currentAnimationProgressTime = Math.min(
      Date.now() - this.currentAnimationProgressStartTime,
      ANIMATION_DURATION
    );

    if (isMouseEnter || isMouseLeave) {
      const objectiveValue = isMouseEnter ? 1.5 : 1;
      const diffecence = objectiveValue - this.currentAnimationStartWidth;
      const value = easeInOutExpo(
        this.currentAnimationProgressTime,
        this.currentAnimationStartWidth,
        diffecence,
        ANIMATION_DURATION
      );
      this.mesh.scale.set(value, value, value);
    }

    if (isClick) {
      const objectiveValue =
        this.currentAnimationStartRotation + THREE.MathUtils.degToRad(360);
      const diffecence = objectiveValue - this.currentAnimationStartRotation;
      const value = easeInOutExpo(
        this.currentAnimationProgressTime,
        this.currentAnimationStartRotation,
        diffecence,
        ANIMATION_DURATION
      );
      this.mesh.rotation.z = value;
    }

    if (this.currentAnimationProgressTime === ANIMATION_DURATION) {
      this.animationPhase = "none";
    }
  }

  private triggerAnimation() {
    this.currentAnimationProgressStartTime = Date.now();
    this.currentAnimationProgressTime = 0;
    this.update();
  }

  mouseEnter() {
    if (this.mouseOvered) return;
    this.animationPhase = "mouseEnter";
    this.mouseOvered = true;
    this.currentAnimationStartWidth = this.mesh.scale.x;
    this.triggerAnimation();
  }

  mouseLeave() {
    if (!this.mouseOvered) return;
    this.animationPhase = "mouseLeave";
    this.mouseOvered = false;
    this.currentAnimationStartWidth = this.mesh.scale.x;
    this.triggerAnimation();
  }

  click() {
    this.animationPhase = "click";
    this.currentAnimationStartRotation = this.mesh.rotation.z;
    this.triggerAnimation();
  }
}
