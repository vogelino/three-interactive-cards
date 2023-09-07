import * as THREE from "three";
import { Animation } from "./Animation";
import { Freezable } from "./Freezable";

type ConfigType = {
  imagePath: string;
  width: number;
  height: number;
  angle: number;
  worldPoint?: THREE.Vector3;
};

export class ImagePlane extends Freezable {
  private mesh: THREE.Mesh<
    THREE.CylinderGeometry,
    THREE.MeshBasicMaterial | THREE.MeshBasicMaterial[]
  >;
  private scaleAnimation: Animation;
  private isHovered: boolean = false;

  constructor(config: ConfigType) {
    super();
    const { imagePath } = config;
    new THREE.TextureLoader().load(imagePath, (texture) => {
      this.mesh.material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
    });
    const geometry = new THREE.CylinderGeometry(
      1,
      1,
      0.4,
      8,
      1,
      true,
      0,
      360 / 13 / 70
    );
    geometry.rotateY(Math.PI / 1);

    const material = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.rotateMeshFromWorldPoint(config.angle, "y");

    this.scaleAnimation = new Animation({
      startValue: 1,
      endValue: 1.2,
      duration: 2000,
      easingFunction: function easeOutExpo(
        t: number,
        b: number,
        c: number,
        d: number
      ) {
        return (c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024) / 1023 + b;
      },
    });

    return this;
  }

  public getMesh() {
    return this.mesh;
  }

  public update() {
    if (this.isFrozen) return;
    this.scaleAnimation.update((val) => {
      this.mesh.scale.setX(val);
      this.mesh.scale.setY(val);
    });
    return this;
  }

  public onMouseMove(intersectingObject: THREE.Object3D | null) {
    if (this.isFrozen) return;
    if (!this.isHovered && intersectingObject === this.mesh) {
      this.mouseEnter();
    }
    if (
      this.isHovered &&
      intersectingObject &&
      intersectingObject !== this.mesh
    ) {
      this.mouseLeave();
    }
    return this;
  }

  public onClick() {
    return this;
  }

  private mouseEnter() {
    if (this.isFrozen) return;
    this.isHovered = true;
    this.scaleAnimation.forwards().start();
  }

  private mouseLeave() {
    if (this.isFrozen) return;
    this.isHovered = false;
    this.scaleAnimation.backwards().start();
  }

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
