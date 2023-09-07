import { Freezable } from "./Freezable";
import { ImagePlane } from "./ImagePlane";
import * as THREE from "three";

interface ConfigType {
  angleOffset: number;
  imagePaths: string[];
  yPosition: number;
  depthOffset: number;
  isOdd?: boolean;
}

export class ImageRing extends Freezable {
  private group: THREE.Group;
  private images: ImagePlane[];
  private lastOffset: number = 0;
  private isOdd: boolean = false;

  constructor({
    angleOffset,
    imagePaths,
    isOdd,
    yPosition,
    depthOffset,
  }: ConfigType) {
    super();
    const anglePiece = 360 / imagePaths.length;
    this.images = imagePaths.map(
      (imagePath, index) =>
        new ImagePlane({
          imagePath,
          width: 800,
          height: 800,
          angle: anglePiece * index,
          worldPoint: new THREE.Vector3(0, 0, depthOffset),
        })
    );
    this.group = new THREE.Group();
    this.images.forEach((image) => this.group.add(image.getMesh()));
    this.group.position.set(0, yPosition, 0);
    this.group.rotation.y = angleOffset;
    this.isOdd = isOdd || false;
  }

  public onWheel(event: WheelEvent) {
    if (this.isFrozen) return;
    const direction = event.deltaY > 0 ? "down" : "up";
    this.group.rotation.y += direction === "down" ? -0.01 : 0.01;
  }

  public getGroup() {
    return this.group;
  }

  public update(offset: number) {
    if (this.isFrozen) return;
    this.images.forEach((image) => image.update());
    const newOffset = offset / 3;
    this.group.rotation.y +=
      (newOffset - this.lastOffset) * (this.isOdd ? -1 : 1);
    this.lastOffset = newOffset;
  }

  public onMouseMove(intersectingObject: THREE.Object3D | null) {
    if (this.isFrozen) return;
    this.images.forEach((image) => image.onMouseMove(intersectingObject));
  }

  public onClick() {
    this.images.forEach((image) => image.onClick());
  }
}
