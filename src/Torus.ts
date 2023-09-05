import * as THREE from "three";
import { ThreeDObject } from "./ThreeDObject";

export class Torus extends ThreeDObject {
  constructor() {
    super();
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshStandardMaterial({
      color: 0xc52a1e,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    return this;
  }

  update() {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;
    this.mesh.rotation.z += 0.03;

    return this;
  }
}
