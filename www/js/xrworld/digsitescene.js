import { XRWorld, THREE }  from "./xrworld.js";

import { FirstPersonControls } from 'https://unpkg.com/three@0.126.0/examples/jsm/controls/FirstPersonControls.js';
import Controller from "./controller.js";
// import { OrbitControls } from 'https://unpkg.com/three@0.126.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/webxr/VRButton.min.js";

import * as HELPERS from './threehelpers.js';

// Demo gltf: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf

const loader = new GLTFLoader();

let digSite, artifacts;
function init(info) {
    digSite = info.digSite;
    artifacts = info.artifacts;
}

export default class DigSiteScene extends XRWorld {

    constructor(parentElem, info) {
        super(parentElem, init(info));

        // Enable XR
        document.body.appendChild( VRButton.createButton( this.renderer ) );
        this.renderer.xr.enabled = true;
    }    

    // Demo update and start implementation

    start() {

        // Rotate camera to face forward
        this.mainCamera.position.z = 0;
        this.mainCamera.lookAt(0,0,1)

        this.light = new THREE.PointLight( 0xffffff, 1, 100 );
        this.light.position.z = 2;

        //this.cube = new THREE.Object3D();
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshStandardMaterial( {opacity:0.0, transparent:true} );
        this.cube = new THREE.Mesh( geometry, material );

        // Load scene
        loader.load(digSite[3], gltf=>{

            let scene = gltf.scene.children[0];
            
            this.addObjectToScene(scene);

        }, undefined, e=>console.log("Could not load model at: " + modelLink + ", error: " + e)
        );

        // Load artifacts
        artifacts.forEach(artifact=>{

            let modelLink = artifact[4]
            loader.load(modelLink, gltf=>{

                let obj = new THREE.Object3D();
                let scene = gltf.scene.children[0];
                HELPERS.normalizeModel(scene);

                obj.add(scene);

                let pos_str = artifact[6].slice(1,-1).split(",");
                let pos = []
                pos_str.forEach(n=>pos.push(parseFloat(n)));
                obj.position.set(...pos);
                
                this.addObjectToScene(obj);

            }, undefined, e=>console.log("Could not load model at: " + modelLink + ", error: " + e)
            );
        });

        // Add light to main camera
        this.mainCamera.add(this.light);

        // add camera to player
        this.player = new THREE.Object3D()
        this.removeObjectFromScene(this.mainCamera)
        this.player.add(this.mainCamera);
        this.player.camera = this.mainCamera;
        this.addObjectToScene(this.player);
        // let scope = this;

        // {
        //     // Simple motion
        //     let speed = 4;
        //     function getVector(axis) {

        //         // Create vector3
        //         let vec = new THREE.Vector3(...axis);

        //         // Scale vector
        //         vec.multiplyScalar(speed*scope.deltaTime());

        //         // Rotate by camera
        //         vec.applyQuaternion(scope.mainCamera.quaternion)

        //         return vec
        //     }
        //     document.addEventListener("keydown", e=>{
        //         switch (e.key) {
        //             case 'w':
        //                 scope.player.position.add(getVector([0,0,-1]));
        //                 break;
        //             case 'a':
        //                 scope.player.position.add(getVector([-1,0,0]));
        //                 break;
        //             case 's':
        //                 scope.player.position.add(getVector([0,0,1]));
        //                 break;
        //             case 'd':
        //                 scope.player.position.add(getVector([1,0,0]));
        //                 break; 
        //         }
        //     })

        // }

        // this.controls = new OrbitControls( this.mainCamera, this.renderer.domElement );
        // this.controls.minDistance = 1;
        // this.controls.maxDistance = 3;
        // this.controls.update(); 
        
        // this.controls = new FirstPersonControls( this.mainCamera, this.renderer.domElement )
        // this.controls.movementSpeed = 4;
		// this.controls.lookSpeed = 0.5;

        this.controls = new Controller(this.player)
		// this.controls.lookVertical = false;
    }

    update() {

        this.cube.rotation.x += 0.001;
        this.cube.rotation.y += 0.001;

        this.controls.update(this.deltaTime());
    }

}