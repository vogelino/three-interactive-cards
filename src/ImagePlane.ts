import * as THREE from "three";
import { Animation } from "./Animation";

type ConfigType = {
  imagePath: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export class ImagePlane {
  private mesh: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicMaterial | THREE.MeshBasicMaterial[]
  >;
  private config: ConfigType;
  private currentAnimationStartWidth = 1;
  private scaleAnimation: Animation;
  private rotateAnimation: Animation;

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

    this.scaleAnimation = new Animation({
      startValue: 1,
      endValue: 1.5,
    });
    this.rotateAnimation = new Animation({
      startValue: 0,
      endValue: THREE.MathUtils.degToRad(360),
    });

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
    this.scaleAnimation.update((val) => {
      this.mesh.scale.setX(val);
      this.mesh.scale.setY(val);
    });
    this.rotateAnimation.update((val) => {
      this.mesh.rotation.z = val;
    });
  }

  mouseEnter() {
    this.scaleAnimation.forwards().start();
  }

  mouseLeave() {
    this.scaleAnimation.backwards().start();
  }

  click() {
    this.rotateAnimation.start();
  }
}
