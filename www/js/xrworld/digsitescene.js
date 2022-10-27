import { XRWorld, THREE }  from "./xrworld.js";

import { FirstPersonControls } from 'https://unpkg.com/three@0.126.0/examples/jsm/controls/FirstPersonControls.js';
import Controller from "./controller.js";
// import { OrbitControls } from 'https://unpkg.com/three@0.126.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/webxr/VRButton.min.js";

import * as HELPERS from './threehelpers.js';
import HTML2D from "./2DGUI/html2d.js";
import Block2D from "./2DGUI/block2d.js";
import { createDOMElem, createDOMElemWithText } from "../createdomelem.js";

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
        this.mainCamera.position.set(0,1.6,0);
        this.mainCamera.lookAt(0,0,1)

        this.light = new THREE.PointLight( 0xffffff, 1, 100 );

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

        this.controls = new Controller(this.player, this.renderer);

        // Add control menu for player
        let controlMenu = document.createElement("div");
        controlMenu.style.height = "100px"
        controlMenu.style.width = "100px"
        controlMenu.style.background = "rgba(10,10,100,0.7)";
        controlMenu.style.color = "white";
        controlMenu.style.padding = "5px";
        controlMenu.style.display = "flex";
        // controlMenu.style.justifyContent = "center";
        controlMenu.style.flexDirection = "column";
        controlMenu.style.alignItems = "center";

        let _t = createDOMElemWithText("h2", "Controls")
        _t.style.margin = "0px"
        _t.style.fontSize = "14px";
        controlMenu.appendChild(_t)
        // document.body.append(controlMenu)

        let xrControlMenu = new HTML2D(controlMenu, {width:1.5})
        this.player.add(xrControlMenu.mesh);
        xrControlMenu.mesh.position.set(0,0,1);
        xrControlMenu.mesh.rotateX(Math.PI/4)

        let desktopControls = new Block2D({
            width:.8,
            height:0.6,
            x:0,
            y:0,
            z:1,
            src:"/img/desktop_nav.png",
            transparent:true,
            opacity:1
        });
        let xrControls = new Block2D({
            width:1,
            height:0.7,
            x:0,
            y:0,
            z:1,
            src:"/img/xr_nav.png",
            transparent:true,
            opacity:1
        });
        xrControls.mesh.visible = false;

        xrControlMenu.mesh.add(desktopControls.mesh)
        xrControlMenu.mesh.add(xrControls.mesh)
        desktopControls.mesh.position.set(.2,0,-0.1)
        xrControls.mesh.position.set(.15,0,-0.1)
        desktopControls.mesh.rotateY(Math.PI)
        xrControls.mesh.rotateY(Math.PI)

        // Set up callbacks
        this.controls.addEventListener("onstartxr", e=>{
            desktopControls.mesh.visible = false;
            xrControls.mesh.visible = true;
        })
        this.controls.addEventListener("onleavexr", e=>{
            desktopControls.mesh.visible = true;
            xrControls.mesh.visible = false;
        })

    }

    update() {

        // let v = new THREE.Vector3()
        // this.player.camera.getWorldDirection(v)
        // console.log(v)
        // console.log(this.player.position)

        this.controls.update(this.deltaTime());
    }

}