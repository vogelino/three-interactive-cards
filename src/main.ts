import { ImagePlane } from "./ImagePlane";
import "./style.css";
import * as THREE from "three";

const canvas = document.querySelector("#bg") as HTMLCanvasElement;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ canvas });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const images = [
  new ImagePlane({
    imagePath: "/canyon.jpeg",
    x: -10,
    y: 10,
    width: 8870,
    height: 5914,
  }),
  new ImagePlane({
    imagePath: "/growhouse.jpeg",
    x: 10,
    y: 10,
    width: 3648,
    height: 5472,
  }),
  new ImagePlane({
    imagePath: "/mountains.jpeg",
    x: -10,
    y: -10,
    width: 5372,
    height: 3357,
  }),
];

function init() {
  images.forEach((image) => scene.add(image.getMesh()));

  scene.background = new THREE.Color(0xffffff);

  const ambientLight = new THREE.AmbientLight(0xffffff);
  ambientLight.intensity = 4.5;
  scene.add(ambientLight);
}

let millisecondsPassed = 0;
let oldTimeStamp = 0;
function animate(timeStamp: number) {
  millisecondsPassed = timeStamp - oldTimeStamp;
  oldTimeStamp = timeStamp;

  requestAnimationFrame(animate);

  images.forEach((image) => image.update());

  renderer.render(scene, camera);
}

canvas.addEventListener("mousemove", (event) => {
  event.preventDefault();

  const vector = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(vector, camera);

  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    images.forEach((image) => image.getMesh() === mesh && image.mouseEnter());
  } else {
    images.forEach((image) => image.mouseLeave());
  }
});

init();
animate(Date.now());