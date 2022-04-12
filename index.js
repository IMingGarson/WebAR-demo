import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';
// import * as ZapparThree from 'https://libs.zappar.com/zappar-threejs/0.3.40/zappar-threejs.js';
import * as ZapparThree from "./node_modules/@zappar/zappar-threejs";
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';

const targetImagePath = new URL("./target.zpt", import.meta.url).href;
const modelURL = new URL("./models/source/Bengal.glb", import.meta.url).href;

/**
 * The SDK is supported on many different browsers, but there are some that
 * don't provide camera access. This function detects if the browser is supported
 * For more information on support, check out the readme over at
 * https://www.npmjs.com/package/@zappar/zappar-threejs
 */
if (ZapparThree.browserIncompatible()) {
    // The browserIncompatibleUI() function shows a full-page dialog that informs the user
    // they're using an unsupported browser, and provides a button to 'copy' the current page
    // URL so they can 'paste' it into the address bar of a compatible alternative.
    ZapparThree.browserIncompatibleUI();
    // If the browser is not compatible, we can avoid setting up the rest of the page
    // so we throw an exception here.
    throw new Error('Unsupported browser');
}


// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded. You can use this if it's helpful, or use
// your own loading UI - it's up to you :-)
const manager = new ZapparThree.LoadingManager();

const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
document.body.appendChild(renderer.domElement);

// As with a normal ThreeJS scene, resize the canvas if the window resizes
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/*
 * Create a Zappar camera that we'll use instead of a ThreeJS camera
 */
const camera = new ZapparThree.Camera();
// In order to use camera and motion data, we need to ask the users for permission
// The Zappar library comes with some UI to help with that, so let's use it
ZapparThree.permissionRequestUI().then((granted) => {
    // If the user granted us the permissions we need then we can start the camera
    // Otherwise let's them know that it's necessary with Zappar's permission denied UI
    if (granted) {
        camera.start();
    } else {
        ZapparThree.permissionDeniedUI();
    }
});

// The Zappar component needs to know our WebGL context, so set it like this:
ZapparThree.glContextSet(renderer.getContext());

// Set the background of our scene to be the camera background texture
// that's provided by the Zappar camera
scene.background = camera.backgroundTexture;

// Set an error handler on the loader to help us check if there are issues loading content.
manager.onError = (url) => console.log(`There was an error loading ${url}`);

// Create a zappar image_tracker and wrap it in an image_tracker_group for us
// to put our ThreeJS content into
// Pass our loading manager in to ensure the progress bar works correctly
const imageTracker = new ZapparThree.ImageTrackerLoader(manager).load(targetImagePath);
const imageTrackerGroup = new ZapparThree.ImageAnchorGroup(camera, imageTracker);
// Add our image tracker group into the ThreeJS scene
scene.add(imageTrackerGroup);

let action;
let mixer;

// Load a 3D model to place within our group (using ThreeJS's GLTF loader)
const gltfLoader = new GLTFLoader(manager);
gltfLoader.load('./models/source/Bengal.glb', (gltf) => {
        // get the animation and re-declare mixer and action.
        // which will then be triggered on button press
        mixer = new THREE.AnimationMixer(gltf.scene);
        action = mixer.clipAction(gltf.animations[0]);
        // Now the model has been loaded, we can roate it and add it to our image_tracker_group
        imageTrackerGroup.add(gltf.scene);
        action.play();
    }, undefined, () => {
        console.log('An error ocurred loading the GLTF model');
    }
);

// Light up our scene with an ambient light
imageTrackerGroup.add(new THREE.AmbientLight(0xffffff));

// When we lose sight of the camera, hide the scene contents.
imageTracker.onVisible.bind(() => { scene.visible = true; });
imageTracker.onNotVisible.bind(() => { scene.visible = false; });

// Used to get deltaTime for our animations.
const clock = new THREE.Clock();

function render() {
    // If the mixer has been declared, update our animations with delta time
    if (mixer) mixer.update(clock.getDelta());

    // The Zappar camera must have updateFrame called every frame
    camera.updateFrame(renderer);

    // Draw the ThreeJS scene in the usual way, but using the Zappar camera
    renderer.render(scene, camera);

    // Call render() again next frame
    requestAnimationFrame(render);
}

// Start things off
render();