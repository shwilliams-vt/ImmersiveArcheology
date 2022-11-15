import { XRWorld, THREE }  from "./xrworld.js";

import { OrbitControls } from 'https://unpkg.com/three@0.126.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js';
import * as HELPERS from './threehelpers.js';

// Demo gltf: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf

const loader = new GLTFLoader();

let modelLink;
function init(link) {
    modelLink = link;
}

export default class ArtifactScene extends XRWorld {

    constructor(parentElem, modelLink) {
        super(parentElem, init(modelLink));
    }    

    // Demo update and start implementation

    start() {

        // Change main camera position
        this.mainCamera.position.z = 2;

        this.light = new THREE.PointLight( 0xffffff, 1, 100 );
        this.light.position.z = 2;

        //this.cube = new THREE.Object3D();
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshStandardMaterial( {opacity:0.0, transparent:true} );
        this.cube = new THREE.Mesh( geometry, material );

        loader.load(modelLink, gltf=>{

            let scene = gltf.scene.children[0];

            HELPERS.normalizeModelScale(scene);
            HELPERS.normalizeModelPosition(scene);
            
            this.cube.add(scene);
        }, undefined, e=>console.log("Could not load model at: " + modelLink + ", error: " + e)
        );

        // Add cube to Scene
        this.addObjectToScene(this.cube);

        // Add light to main camera
        this.mainCamera.add(this.light);

        this.controls = new OrbitControls( this.mainCamera, this.renderer.domElement );
        this.controls.minDistance = 1;
        this.controls.maxDistance = 3;
        this.controls.update();        
    }

    update() {

        this.cube.rotation.x += 0.001;
        this.cube.rotation.y += 0.001;

        this.controls.update();
    }

}