import * as THREE from "three";
import { Animation } from "./Animation";

type ConfigType = {
  imagePath: string;
  width: number;
  height: number;
  angle: number;
  worldPoint?: THREE.Vector3;
};

export class ImagePlane {
  private mesh: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicMaterial | THREE.MeshBasicMaterial[]
  >;
  private config: ConfigType;
  private scaleAnimation: Animation;

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
    const { worldPoint } = config;
    this.mesh.position.set(
      -(worldPoint?.x || 0),
      -(worldPoint?.y || 0),
      -(worldPoint?.z || 0)
    );
    this.rotateMeshFromWorldPoint(config.angle, "y");

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

  update() {
    this.scaleAnimation.update((val) => {
      this.mesh.scale.setX(val);
      this.mesh.scale.setY(val);
    });
  }

  mouseEnter() {
    this.scaleAnimation.forwards().start();
  }

  mouseLeave() {
    this.scaleAnimation.backwards().start();
  }

  click() {}

  private rotateMeshFromWorldPoint(
    angle: number,
    axis: "x" | "y" | "z" = "y",
    pointIsWorld = false
  ) {
    const obj = this.mesh;
    const point = new THREE.Vector3(0, 0, 0);

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
