// Set up variables for initial ThreeJS rendering
let camera, renderer, scene, target, mixer, light, controls, axesHelper;
// Set default orientation values
let alpha = 0, beta = 0, gamma = 0;
// Keep track of gamma changes
let leftToRight = 0;
// Keep track of beta changes
let frontToBack = 90;
// Degree-to-Radian conversion
const deg2rad = Math.PI / 180;
let _x, _y, _z;
let cX, cY, cZ, sX, sY, sZ;
// animation clock
const clock = new THREE.Clock();
// Set up variables for calculating a rotation matrix
let currentRotMat, previousRotMat, inverseMat, relativeRotationDelta;
// For accumulating the rotating angle
let totalRightAngularMovement = 0, totalTopAngularMovement = 0;

const UrlPath = {
    'sit': '../models/source/shiro_sit.glb',
    'up': '../models/source/shiro_stand.glb',
    'marshmellow': '../models/marshmellow.mp4',
}

if (worker) {
    worker.addEventListener('message', function(e) {
        console.log('edata', e.data);
        // loadModel(e.data);
    });
}

function init() {
    const objectSection = document.getElementById('center-object');

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    objectSection.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.up.set(0, 0, 1);
    camera.position.z = 75;

    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 150);
    scene.add(light);

    // Orbit
    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.target.set(0, 0.5, 0);
    // controls.update();

    axesHelper = new THREE.AxesHelper(10);
    const colors = axesHelper.geometry.attributes.color;
    colors.setXYZ( 0, 1, 0, 0 ); // index, R, G, B
    colors.setXYZ( 1, 1, 0, 0 ); // red -> x
    colors.setXYZ( 2, 0, 1, 0 );
    colors.setXYZ( 3, 0, 1, 0 ); // green -> y
    colors.setXYZ( 4, 0, 0, 1 );
    colors.setXYZ( 5, 0, 0, 1 ); // blue -> z
    // 座標軸
    scene.add(axesHelper);

    animate();
}

function loadModel(command) {
    const targetURL = UrlPath[command];
    if (command === 'marshmellow') {
        // for 小白 棉花糖
        // Create video and play
        let textureVid = document.createElement("video")
        textureVid.src = '../models/marshmellow.mp4'; // transform gif to mp4
        textureVid.loop = true;
        textureVid.play();

        // Load video texture
        let videoTexture = new THREE.VideoTexture(textureVid);
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.minFilter = THREE.NearestFilter;
        videoTexture.maxFilter = THREE.NearestFilter;
        videoTexture.generateMipmaps = false;

        // Create mesh
        let plane = new THREE.PlaneGeometry(30, 30);
        let planeMaterial = new THREE.MeshBasicMaterial( { map: videoTexture } );
        planeMesh = new THREE.Mesh( plane, planeMaterial );
        scene.add(planeMesh);
    } else {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://threejs.org/examples/js/libs/draco/gltf/');

        const objLoader = new THREE.GLTFLoader();
        objLoader.setDRACOLoader(dracoLoader);
        objLoader.load(targetURL, (gltf) => {
            gltf.scene.name = 'target';
            scene.add(gltf.scene);
            // for bengal cat
            // gltf.scene.position.set(0, 0, 0);
            // gltf.scene.scale.set( 50, 50, 50);
            // mixer = new THREE.AnimationMixer(target);
            // mixer.clipAction(gltf.animations[0]).play();

            // for 小白
            gltf.scene.position.set(0, 0, 0);
            gltf.scene.scale.set( 10, 10, 10);
            gltf.scene.rotation.set(0, 90, 0);

            // for 小白 坐下
            // gltf.scene.position.set(0, 0, 0);
            // gltf.scene.scale.set( 10, 10, 10);

            // add target
            target = gltf.scene.children[0];
            target.position.set(0, 0, 0);
            target.rotation.set(0, 0, 0);
        },
        (xhr) => {
            console.log('xhr', xhr);
            return false;
        },
        (err) => {
            console.log('err', err);
            return false;
        });
    }
    animate();
}

function handleOrientation(e) {
    // gamma: left to right, rotate around y-axis, ranging from -90 to 90 degrees
    leftToRight = e.gamma;
    // beta: front back motion, rotate around x-axis, ranging from -180 to 180 degrees
    frontToBack = e.beta;
    if (typeof previousRotMat === 'undefined') {
        previousRotMat = new THREE.Matrix3();
        currentRotMat = new THREE.Matrix3();
        relativeRotationDelta = new THREE.Matrix3();
        fromOrientation(currentRotMat, e.alpha * deg2rad, e.beta * deg2rad, e.gamma * deg2rad);
    }
    // save last orientation
    previousRotMat = currentRotMat;
    // get rotation in the previous orientation coordinate
    fromOrientation(currentRotMat, e.alpha * deg2rad, e.beta * deg2rad, e.gamma * deg2rad);
    // for rotation matrix, inverse is transpose
    inverseMat = previousRotMat;
    inverseMat.transpose();
    relativeRotationDelta = currentRotMat.multiply(inverseMat);
    
    // add the angular deltas to the cummulative rotation
    totalTopAngularMovement = Math.asin(relativeRotationDelta[6]) / deg2rad;
    totalRightAngularMovement = Math.asin(relativeRotationDelta[7]) / deg2rad;
}

function removeSphere()
{
    scene.remove(sphere);
}

function removeTarget()
{
    selectedObject = scene.getObjectByName('target');
    scene.remove(selectedObject);
}

function animate() {
    requestAnimationFrame(animate);
    // mixer.update(clock.getDelta());

    // target.position.set(0, 0, 0);
    // let yRotation = -totalRightAngularMovement;
    // yRotation = yRotation.toFixed(2);
    // yRotation = yRotation > 45 ? 45 : yRotation;
    // yRotation = yRotation < -45 ? -45 : yRotation;
    // target.rotation.y = yRotation / 25;
    // camera.rotation.y = yRotation / 250;
    // document.getElementById('leftToRight').innerHTML = yRotation / 25;

    // // default狀態
    // let xRotation = 45;
    // if (totalTopAngularMovement == 0) {
    //     xRotation = 45;
    // } else {
    //     // portrait mode，手機頭朝上且往後倒
    //     xRotation = 90 + totalTopAngularMovement;
    //     if (frontToBack > 90) {
    //         // portrait mode，手機頭朝上且往前跌
    //         xRotation = -xRotation;
    //     }
    //     if (leftToRight > 0) {
    //         xRotation -= leftToRight;
    //     } else {
    //         xRotation += leftToRight;
    //     }
    //     xRotation = xRotation > 45 ? 45 : xRotation;
    //     xRotation = xRotation < -45 ? -45 : xRotation;
    //     target.rotation.x = xRotation / 50;
    // }
    // document.getElementById('frontToBack').innerHTML = xRotation / 50;

    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
}

// handle Gimbal lock
function fromOrientation(out, alpha, beta, gamma) {
    // https://stackoverflow.com/questions/36639182/html5-get-device-orientation-rotation-in-relative-coordinate
    _z = alpha;
    _x = gamma;
    _y = beta;
    cX = Math.cos( _x );
    cY = Math.cos( _y );
    cZ = Math.cos( _z );
    sX = Math.sin( _x );
    sY = Math.sin( _y );
    sZ = Math.sin( _z );

    // z: alpha, x: beta, y: gamma
    out[0] = cZ * cY - sZ * sX * sY;    // row 1, col 1
    out[1] = -cX * sZ;                   // row 2, col 1
    out[2] = cZ * sY + sZ * sX * cY; // row 3, col 1

    out[3] = cY * sZ + cZ * sX * sY,  // row 1, col 2
    out[4] = cZ * cX,                   // row 2, col 2
    out[5] = sZ * sY - cZ * cY * sX,    // row 3, col 2

    out[6] = -cX * sY,                   // row 1, col 3
    out[7] = sX,                      // row 2, col 3
    out[8] = cX * cY                    // row 3, col 3
}
