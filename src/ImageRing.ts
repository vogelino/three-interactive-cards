import { ImagePlane } from "./ImagePlane";
import * as THREE from "three";

interface ConfigType {
  angleOffset: number;
  imagePaths: string[];
  yPosition: number;
  depthOffset: number;
}

export class ImageRing {
  private group: THREE.Group;
  private images: ImagePlane[];

  constructor({ angleOffset, imagePaths, yPosition, depthOffset }: ConfigType) {
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
  }

  public getGroup() {
    return this.group;
  }

  public update() {
    this.images.forEach((image) => image.update());
  }

  public onMouseMove(intersectingObject: THREE.Object3D | null) {
    this.images.forEach((image) => image.onMouseMove(intersectingObject));
  }

  public onClick() {
    this.images.forEach((image) => image.onClick());
  }
}
