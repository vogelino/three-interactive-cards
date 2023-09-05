import * as THREE from "three";

export class ThreeDObject {
  mesh: THREE.Mesh<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.Material | THREE.Material[]
  >;
  constructor() {
    this.mesh = new THREE.Mesh();
    return this;
  }
  getMesh() {
    return this.mesh;
  }
  update() {
    return this;
  }
}
