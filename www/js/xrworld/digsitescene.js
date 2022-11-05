import { XRWorld, THREE }  from "./xrworld.js";

import { FirstPersonControls } from 'https://unpkg.com/three@0.126.0/examples/jsm/controls/FirstPersonControls.js';
import Controller from "./controller.js";
// import { OrbitControls } from 'https://unpkg.com/three@0.126.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js';
import { PLYLoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/PLYLoader.js';
import { VRButton } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/webxr/VRButton.min.js";

import * as HELPERS from './threehelpers.js';
import HTML2D from "./2DGUI/html2d.js";
import Block2D from "./2DGUI/block2d.js";
import { createDOMElem, createDOMElemWithText } from "../createdomelem.js";

// Demo gltf: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf

const loader = new GLTFLoader();
const plyloader = new PLYLoader();

let digSite, artifacts;
function init(info) {
    digSite = info.digSite;
    artifacts = info.artifacts;
}

const POINT_CLOUD_POINT_SIZE = 0.5

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
        this.mainCamera.lookAt(0,0,-1)

        this.light = new THREE.PointLight( 0xffffff, 1, 100 );

        //this.cube = new THREE.Object3D();
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshStandardMaterial( {opacity:0.0, transparent:true} );
        this.cube = new THREE.Mesh( geometry, material );

        // Holds all artifacts
        this.artifacts = [];
        this.artifactDates = new Map();

        // Load scene
        // loader.load(digSite[3], gltf=>{

        //     let scene = gltf.scene.children[0];

        //     this.addObjectToScene(scene);

        // }, undefined, e=>console.log("Could not load model at: " + digSite[3] + ", error: " + e)
        // );
        // plyloader.load(digSite[3], points=>{

        //     // let scene = gltf.scene.children[0];

        //     var mat = new THREE.PointsMaterial({size:POINT_CLOUD_POINT_SIZE, vertexColors: true});
        //     var mesh = new THREE.Points(points, mat);

        //     this.addObjectToScene(mesh);

        //     // console.log(points)

        //     // const material = new THREE.MeshPhysicalMaterial({
        //     //     color: 0xb2ffc8,
        //     //     metalness: 0,
        //     //     roughness: 0,
        //     //     transparent: true,
        //     //     transmission: 1.0,
        //     //     side: THREE.DoubleSide,
        //     //     clearcoat: 1.0,
        //     //     clearcoatRoughness: 0.25
        //     // })
        //     // points.computeVertexNormals()
        //     // const mesh = new THREE.Mesh(points, material)
        //     // mesh.rotateX(-Math.PI / 2)
        //     // this.addObjectToScene(mesh)

        //     const box = new THREE.Box3();

        //     // ensure the bounding box is computed for its geometry
        //     // this should be done only once (assuming static geometries)
        //     mesh.geometry.computeBoundingBox();

        //     // ...

        //     // in the animation loop, compute the current bounding box with the world matrix
        //     box.copy( mesh.geometry.boundingBox ).applyMatrix4( mesh.matrixWorld );
        //     console.log(box)

        // }, undefined, e=>console.log("Could not load model at: " + digSite[3] + ", error: " + e)
        // );

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

                // Add date to artifact
                obj.date = new Date(artifact[5])
                this.artifacts.push(obj);

                if (Array.from(this.artifactDates.keys()).includes(artifact[5])) {
                    this.artifactDates.get(artifact[5]).push(obj);
                }
                else {
                    this.artifactDates.set(artifact[5], [obj]);
                }

            }, undefined, e=>console.log("Could not load model at: " + modelLink + ", error: " + e)
            );
        });

        console.log(this.artifactDates)

        // Add light to main camera
        this.mainCamera.add(this.light);

        // add camera to player
        this.player = new THREE.Object3D()
        this.removeObjectFromScene(this.mainCamera)
        this.player.add(this.mainCamera);
        this.player.camera = this.mainCamera;
        this.addObjectToScene(this.player);

        this.controls = new Controller(this.player, this.scene, this.renderer);

        // Add control menu for player
        let controlMenu = document.createElement("div");
        controlMenu.style.height = "130px"
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

        let xrControlMenu = new HTML2D(controlMenu, {width:1.5,height:2.0})
        this.player.add(xrControlMenu.mesh);
        xrControlMenu.mesh.position.set(0,0,-1);
        xrControlMenu.mesh.rotateX(-Math.PI/4)

        let desktopControls = new Block2D({
            width:.8,
            height:0.5,
            x:0,
            y:0,
            z:-1,
            src:"/img/desktop_nav.png",
            transparent:true,
            opacity:1
        });
        let xrControls = new Block2D({
            width:1,
            height:0.5,
            x:0,
            y:0,
            z:-1,
            src:"/img/xr_nav.png",
            transparent:true,
            opacity:1
        });
        xrControls.mesh.visible = false;

        xrControlMenu.mesh.add(desktopControls.mesh)
        xrControlMenu.mesh.add(xrControls.mesh)
        desktopControls.mesh.position.set(-.2,0,0.01)
        xrControls.mesh.position.set(-.20,0,0.01)

        // Create slider

        let dateText = createDOMElemWithText("h2", "Any Date");
        dateText.style.color = "white";
        dateText.style.margin = "0px"
        dateText.style.fontSize = "11px";
        this.dateText = dateText;
        let xrDate = new HTML2D(dateText, {width:1.5,height:0.1})
        this.xrDate = xrDate;
        xrControlMenu.mesh.add(xrDate.mesh)
        xrDate.mesh.position.set(.03,.3,.005);

        let slider = document.createElement("div");
        slider.style.height = "3px"
        slider.style.width = "100px"
        slider.style.background = "rgba(255,255,255,1)";

        let sliderPtr = createDOMElemWithText("div", "")
        sliderPtr.style.height = "14px";
        sliderPtr.style.width = "11px";
        sliderPtr.style.background = "rgba(200,200,200,1)";
        sliderPtr.style.borderRadius = "4px";
        sliderPtr.style.boxSizing = "border-box";
        // document.body.append(controlMenu)

        let xrSlider = new HTML2D(slider, {width:1.5,height:0.18})
        xrControlMenu.mesh.add(xrSlider.mesh);
        xrSlider.mesh.position.set(0.05,0.5,0.01);

        let xrSliderPtr = new HTML2D(sliderPtr, {width:0.18,height:0.18})
        xrSliderPtr.name = "sliderPtr"
        xrSlider.mesh.add(xrSliderPtr.mesh);
        xrSliderPtr.mesh.position.set(-.627,0.05,0.1);
        xrSliderPtr.onHover = e=>{
            sliderPtr.style.border = "2px solid black";
            xrSliderPtr.update()
        }
        xrSliderPtr.onEndHover = e=>{
            sliderPtr.style.border = "none";
            xrSliderPtr.update()
        }

        // Set up callbacks
        this.controls.addEventListener("onstartxr", e=>{
            desktopControls.mesh.visible = false;
            xrControls.mesh.visible = true;
        })
        this.controls.addEventListener("onleavexr", e=>{
            desktopControls.mesh.visible = true;
            xrControls.mesh.visible = false;
        })

        let scope = this;
        let lastHoveredMesh = null;
        this.xrSliderPtr = xrSliderPtr;
        this.isHoveringSliderPtr = false;
        this.pointerIsDown = false;
        this.controls.addEventListener("onhover", e=>{

            if (e.intersects.length > 0) {
                let uiElements = e.intersects.filter(p=>p.object.uiElement!==undefined);

                uiElements.forEach(intersect=>{
                    let mesh = intersect.object;
                    console.log(mesh.uiElement.name)
                    if (mesh != lastHoveredMesh) {

                        if (mesh != null) {

                            if (mesh.uiElement) {
                                mesh.uiElement._onHover()

                                if (mesh.uiElement.name == "sliderPtr")
                                    scope.isHoveringSliderPtr = true;
                            }
                        }
                        else {

                        }

                        // Set lastHoveredMesh
                        if (lastHoveredMesh != null) {

                            if (lastHoveredMesh.uiElement) {
                                lastHoveredMesh.uiElement._onEndHover()

                                if (lastHoveredMesh.uiElement.name == "sliderPtr")
                                    scope.isHoveringSliderPtr = false;
                            }
                        }
                        else {

                        }

                        lastHoveredMesh = mesh;
                    }
                });
            }
            else lastHoveredMesh = null;
        });

    }

    update() {

        // let v = new THREE.Vector3()
        // this.player.camera.getWorldDirection(v)
        // console.log(v)
        // console.log(this.player.position)

        this.handleSlider();

        this.controls.update(this.deltaTime());


    }

    handleSlider() {
        if (this.isHoveringSliderPtr && this.controls.pointerIsDown()) {

            let currSliderPos = this.xrSliderPtr.mesh.position;
            let ptrDelta = new THREE.Vector3();
            ptrDelta.copy(this.controls.getPointerLocation());
            this.xrSliderPtr.mesh.parent.worldToLocal(ptrDelta)
            ptrDelta.sub(currSliderPos)

            let canSlideLeft = currSliderPos.x < .223 && ptrDelta.x > 0;
            let canSlideRight = currSliderPos.x > -.627 && ptrDelta.x < 0;

            if (canSlideLeft || canSlideRight) {

                let amt = ptrDelta.x;
                if (Math.abs(amt) >= 0.01)
                    amt /= 440;

                this.xrSliderPtr.mesh.translateOnAxis(new THREE.Vector3(1,0,0), amt);

                let arr = Array.from(this.artifactDates.values());
                // Sort the dates in ascending order
                arr.sort((a,b)=>{return b[0].date - a[0].date})
                let arrLength = arr.length;
                // Floor the values at intervals of 1 (any date) + 1 for each date
                let currNum = Math.floor(((this.xrSliderPtr.mesh.position.x + 0.627) / 0.85) * (1 + arrLength));

                // The math checks out here, this is just to remove the extremity values
                if (currNum < 0)
                    currNum = 0;
                else if (currNum == 1 + arrLength)
                    currNum = arrLength;

                // Switch order so any starts first then lowest to highest
                currNum = arrLength - currNum;

                // If currNum is arrLength then we show all artifacts
                if (currNum == arrLength) {
                    for (let i = 0; i < arrLength; i++) {
                        arr[i].forEach(artifact=>{
                            artifact.visible = true;
                        })
                    }

                    this.dateText.innerText = "Any Date";
                    this.xrDate.update();
                }
                else {
                    // otherwise brush
                    arr[currNum].forEach(artifact=>{
                        artifact.visible = false;
                    });
                    for (let i = 0; i < arrLength; i++) {
                        if (i != currNum) {
                            arr[i].forEach(artifact=>{
                                artifact.visible = true;
                            })
                        }
                    }

                    this.dateText.innerText = arr[currNum][0].date.toDateString();
                    this.xrDate.update();
                }



                this.controls.canRotate = false;
            }
        }
        else {
            this.controls.canRotate = true;
        }
    }

}