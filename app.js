// import * as THREE from './node_modules/three/src/Three.js'
// import { DRACOLoader } from './node_modules/three/examples/js/loaders/DRACOLoader.js';
// import { GLTFLoader } from './node_modules/three/examples/js/loaders/GLTFLoader.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/libs/stats.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/webxr/ARButton.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js';
// import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

class App {

    constructor() 
    {
        const container = document.getElementById('center-object');
        document.body.appendChild( container );

        this.gltf = false;
        this.clock = new THREE.Clock();
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.z = 50;

        this.scene = new THREE.Scene();
        this.light = new THREE.DirectionalLight( 0xffffff );
        this.light.position.set(0, 0, 50);
        this.scene.add(this.light);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild( this.renderer.domElement );

        const axesHelper = new THREE.AxesHelper(10);
        const colors = axesHelper.geometry.attributes.color;
        colors.setXYZ( 0, 1, 0, 0 ); // index, R, G, B
        colors.setXYZ( 1, 1, 0, 0 ); // red -> x
        colors.setXYZ( 2, 0, 1, 0 );
        colors.setXYZ( 3, 0, 1, 0 ); // green -> y
        colors.setXYZ( 4, 0, 0, 1 );
        colors.setXYZ( 5, 0, 0, 1 ); // blue -> z
        this.scene.add( axesHelper );

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://threejs.org/examples/js/libs/draco/gltf/');

        const objLoader = new GLTFLoader();
        objLoader.setDRACOLoader(dracoLoader);
        objLoader.load('./models/source/Bengal.glb', (gltf) => {
            this.gltf = gltf;
            this.scene.add(gltf.scene);
            gltf.scene.scale.set( 35, 35, 35);
            this.target = gltf.scene.children[0];
            this.target.rotation.x = Math.PI / 8; // 同整成從上方俯瞰的角度
            this.mixer = new THREE.AnimationMixer(this.target);
            this.mixer.clipAction(gltf.animations[0]).play();
            // this.animate();
            console.log('213123');
        },
        (xhr) => {
            console.log('xhr', xhr);
            return false;
        },
        (err) => {
            console.log('err', err);
            return false;
        })

        this.stats = new Stats();
        this.setupWebAR();
        window.addEventListener('resize', this.resize.bind(this) );
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getDelta();
        this.mixer.update(delta);
        this.renderer.render(this.scene, this.camera);
    }

    setupWebAR()
    {
        this.renderer.xr.enabled = true; 
        const self = this;
        let controller;

        function onSelect() {
            const model = self.gltf.scene.children[0];
            model.rotation.x = Math.PI / 8; // 調整成從上方俯瞰的角度
            model.scale.set(35, 35, 35);
            model.position.applyMatrix4( controller.matrixWorld );
            self.scene.add( model );
        }

        const btn = new ARButton( this.renderer );
        controller = this.renderer.xr.getController( 0 );
        controller.addEventListener( 'select', onSelect );
        this.scene.add( controller );
        // this.animate();
        this.renderer.setAnimationLoop( this.render.bind(this) );
    }

    resize()
    {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }

    render()
    {   
        if (this.gltf) {
            this.stats.update();
            const delta = this.clock.getDelta();
            this.mixer.update(delta);
            this.renderer.render( this.scene, this.camera );
        }
    }
}

export { App };