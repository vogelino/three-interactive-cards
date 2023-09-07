import { ImagePlane } from "./ImagePlane";
import { MomentumDraggable } from "./MomentumDraggable";
import "./style.css";
import * as THREE from "three";

const canvas = document.querySelector("#bg") as HTMLCanvasElement;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ canvas });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const momentumDraggable = new MomentumDraggable(canvas);

const DEPTH_OFFSET = 35;

const imagePaths = Array(13)
  .fill(0)
  .map((_, index) => `/image-${index + 1}.jpg`);

const anglePiece = 360 / imagePaths.length;
const images = imagePaths.map(
  (imagePath, index) =>
    new ImagePlane({
      imagePath,
      width: 800,
      height: 800,
      angle: anglePiece * index,
      worldPoint: new THREE.Vector3(0, 0, DEPTH_OFFSET),
    })
);

const boom = new THREE.Group();
boom.add(camera);
scene.add(boom);
camera.position.set(0, 0, DEPTH_OFFSET);
boom.translateZ(10);

function init() {
  images.forEach((image) => scene.add(image.getMesh()));

  scene.background = new THREE.Color(0xffffff);

  const ambientLight = new THREE.AmbientLight(0xffffff);
  ambientLight.intensity = 4.5;
  scene.add(ambientLight);

  camera.lookAt(0, 0, 0);
}

function animate() {
  requestAnimationFrame(animate);
  const dragOffset = momentumDraggable.getScrollLeft() / 1000;

  boom.rotation.y = dragOffset;

  images.forEach((image) => image.update());

  renderer.render(scene, camera);
}

let lastHoveredImage: ImagePlane | null = null;
canvas.addEventListener("mousemove", (event) => {
  event.preventDefault();
  const mesh = getIntersectingObject(event);
  const hoveredImage = images.find((image) => image.getMesh() === mesh);
  if (lastHoveredImage && lastHoveredImage !== hoveredImage) {
    lastHoveredImage.mouseLeave();
  }
  if (hoveredImage && hoveredImage !== lastHoveredImage) {
    hoveredImage.mouseEnter();
  }
  lastHoveredImage = hoveredImage || null;
});

canvas.addEventListener("click", (event) => {
  event.preventDefault();
  const mesh = getIntersectingObject(event);
  if (mesh) {
    images.forEach((image) => image.getMesh() === mesh && image.click());
  }
});

function getIntersectingObject(event: MouseEvent) {
  const vector = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(vector, camera);

  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    return intersects[0].object;
  }
  return null;
}

init();
animate();
