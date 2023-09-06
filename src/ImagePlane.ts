import * as THREE from "three";
import { Animation } from "./Animation";

type ConfigType = {
  imagePath: string;
  width: number;
  height: number;
  angle: number;
  worldPoint: THREE.Vector3;
};

export class ImagePlane {
  private mesh: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicMaterial | THREE.MeshBasicMaterial[]
  >;
  private config: ConfigType;
  private scaleAnimation: Animation;
  private currentAngle: number = 0;

  constructor(config: ConfigType) {
    const { imagePath } = config;
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
    this.rotateMeshFromAnchorPoint(config.worldPoint, config.angle, "y");
    this.currentAngle = config.angle;

    this.scaleAnimation = new Animation({
      startValue: 1,
      endValue: 1.2,
    });

    return this;
  }

  private getOriginalSize() {
    const { width, height } = this.config;
    const aspectRatio = width / height;
    const imageWidth = 15;
    const imageHeight = imageWidth / aspectRatio;
    return { width: imageWidth, height: imageHeight };
  }

  getMesh() {
    return this.mesh;
  }

  update(newAngle: number) {
    this.scaleAnimation.update((val) => {
      this.mesh.scale.setX(val);
      this.mesh.scale.setY(val);
    });
    const angleDifference = newAngle + this.config.angle - this.currentAngle;
    if (angleDifference !== 0) {
      this.rotateMeshFromAnchorPoint(
        this.config.worldPoint,
        angleDifference,
        "y"
      );
    }
    this.currentAngle = newAngle + this.config.angle;
  }

  mouseEnter() {
    this.scaleAnimation.forwards().start();
  }

  mouseLeave() {
    this.scaleAnimation.backwards().start();
  }

  click() {}

  private rotateMeshFromAnchorPoint(
    point: THREE.Vector3,
    angle: number,
    axis: "x" | "y" | "z" = "y",
    pointIsWorld = false
  ) {
    const obj = this.mesh;

    if (pointIsWorld) {
      obj.parent?.localToWorld(obj.position);
    }

    const theta = THREE.MathUtils.degToRad(angle);
    obj.position.add(point);
    const vectorAxis = new THREE.Vector3(
      axis === "x" ? 1 : 0,
      axis === "y" ? 1 : 0,
      axis === "z" ? 1 : 0
    );
    obj.position.applyAxisAngle(vectorAxis, theta);
    obj.position.sub(point);

    if (pointIsWorld) {
      obj.parent?.worldToLocal(obj.position);
    }

    obj.rotateOnAxis(vectorAxis, theta);
  }
}
