# ThreeJS Learning Week
This interactive ThreeJS image gallery is the result of a learning week done at Berlin's Technological Foundation, more specifically at CityLAB, Berlin's innovation laboratory. There, every year, we dedicate a full week to learning a new tech skill. I chose to learn ThreeJS.

### Objective

My initial interest was to learn web canvas technologies such as WebGL as a mean to expand my realm of possibilities when designing websites and interactions and to emancipate from the limitations of regular CSS/HTML/SVG. I had seen a few different examples of fancy and original animations or interactions on [codrops](https://tympanus.net/codrops/?s=webgl&search-type=posts) or [awwwards](https://www.awwwards.com/inspiration_search/?text=WebGL), and always wondered what it takes to make this kind of appealing effects. Additionally, we had planned to do a project in which we presented the images of the AI-Portraits exhibit, and thought this would be the perfect opportunity to apply this knowledge to.

### The project

As a mean to learn ThreeJS, I wanted to create an interactive image gallery living in a 3D world. I knew I wanted to have curved images, as this is impossible in HTML/CSS (we can use masks but the image is not distorted then). Also, I knew that I wanted it to work both on mobile and desktop and to feel smooth and responsive (at least in chrome and IOS). I first work with simple images, then with cylinders, and slowly arrived at the following results:

[Three.js test project](https://three-interactive-cards.vercel.app/)

https://github.com/vogelino/three-interactive-cards

### Key learnings

I focused on ThreeJS, as I quickly noticed that learning WebGL directly is way too huge of a task for a learning week. Also learning ThreeJS implies learning about WebGL on the surface, thus offering a smooth first contact with the technology.

ThreeJS offers many simplifications and advantages over ****raw**** WebGL, such as scene, lights, geometry and material abstractions.

```jsx
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(...);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
```

Animations in ThreeJS are done using an animation loop:

```jsx
function animate() {
  requestAnimationFrame(animate);

  camera.position.y += 1;

  renderer.render(scene, camera);
}

animate()
```

To make a full screen 3D visualisation, we place the canvas in absolute position in the background. This way, it can later be combined with other HTML contents:

```css
#glcanvas {
	position: fixed;
	inset: 0;
	z-index: -1;
}
```

And then the ThreeJS scene has to be updated on window resize:

```jsx
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
```

The most common material used is the `THREE.MeshBasicMaterial` that can accept either a color or a TextureMap. When instantiating a material, you need to provide wether to show the material in only the front, back or both sides of the material. By default only the front side is shown to avoid unnecessary renders and improve performance.

```tsx
new THREE.TextureLoader().load(imagePath, (texture) => {
  mymesh.material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
});
```

Click, mouse over and other typical DOM event have to be done by hand as there is no elements, everything is a canvas with pixels. In order for this to work, we need to use a Raycaster object, to gather all intersecting objects relative from the camera POV and select the first one that falls in the mouse coordinates:

```tsx
canvas.addEventListener("click", (event) => {
  event.preventDefault();
  const mesh = getIntersectingObject(event);
  if (mesh) {
    rings.forEach((ring) => ring.onClick());
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
```

Because everything is animated in an animation loop, animations with easing have to be tracked down manually. For this purpose, I created an `Animation` class, which accepts a `startValue`, and `endValue`, an optional `easingFunction`, and a `duration`. The instance of this class has an `update` method that takes an update function to be executed in each iteration, a `start` method to start the animation and two methods that determine the animation direction `forwards` and `backwards`.

```tsx
const scaleAnimation = new Animation({
  startValue: 1,
  endValue: 1.2,
  duration: 2000,
  easingFunction: function easeOutExpo(t,b,c,d) {
    return (c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024) / 1023 + b;
  },
});

scaleAnimation.start()

// later in the main animate loop
scaleAnimation.update((val) => {
  this.mesh.scale.setX(val);
  this.mesh.scale.setY(val);
});
```

In order for the clicking, dragging and scrolling to work, I had to create a class that calculates how much drag momentum happens when panning or scrolling:

```tsx
const momentumDraggable = new MomentumDraggable(canvas);

// later in the main animate loop
function animate() {
  requestAnimationFrame(animate);
  const dragOffset = momentumDraggable.getOffset();
	// Do something with the drag offset
	...
}
```

