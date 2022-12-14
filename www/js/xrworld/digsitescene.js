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
import MeshWrapper from "./2DGUI/meshwrapper.js";
import { createDOMElem, createDOMElemWithText } from "../createdomelem.js";

// Demo gltf: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf

const useGLTFDigSite = true;
const gltfloader = new GLTFLoader();
const plyloader = new PLYLoader();

const loadingDOM = document.createElement("div");

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

    async start() {

        // Set up loading state
        loadingDOM.style.width = "100%";
        loadingDOM.style.height = "100%";
        loadingDOM.style.position = "absolute";
        loadingDOM.style.top = "0px";
        loadingDOM.style.display = "flex";
        loadingDOM.style.alignItems = "center";
        loadingDOM.style.justifyContent = "center";
        let _t1 = createDOMElemWithText("h2", "Loading...")
        loadingDOM.appendChild(_t1);
        this.domElem.parentElement.appendChild(loadingDOM)
        console.log(loadingDOM.children)

        // Retain scope
        let scope = this;

        // Set state to unready
        this.ready = false;

        // Player
        scope.player = new THREE.Object3D()
        let spawnPos = new THREE.Vector3();

        // Async load
        await new Promise(async resolve=>{
            
            // Rotate camera to face forward
            scope.mainCamera.position.set(0,1.6,0);
            scope.mainCamera.lookAt(0,0,-1)

            scope.light = new THREE.PointLight( 0xffffff, 1, 100 );

            //scope.cube = new THREE.Object3D();
            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            var material = new THREE.MeshStandardMaterial( {opacity:0.0, transparent:true} );
            scope.cube = new THREE.Mesh( geometry, material );

            // Holds all artifacts
            scope.artifacts = [];
            scope.artifactDates = new Map();
            scope.raycastObjects = [];

            // Load scene
            await new Promise(async r=>{
                if (useGLTFDigSite) {
                    gltfloader.load(digSite[3], async gltf=>{

                        let scene = gltf.scene.children[0];

                        // From program set z axis as up
                        scene.up.set(0,0,1);
                        scene.rotateX(Math.PI / 2); 

                        let mid = HELPERS.getMeshMidpoint(scene);
                        spawnPos = mid;

                        scope.addObjectToScene(scene);
                        r();

                    }, undefined, e=>console.log("Could not load model at: " + digSite[3] + ", error: " + e)
                    );
                }
                else {
                    plyloader.load(digSite[3], async points=>{

                        // let scene = gltf.scene.children[0];

                        var mat = new THREE.PointsMaterial({size:POINT_CLOUD_POINT_SIZE, vertexColors: true});
                        var mesh = new THREE.Points(points, mat);

                        scope.addObjectToScene(mesh);

                        // console.log(points)

                        // const material = new THREE.MeshPhysicalMaterial({
                        //     color: 0xb2ffc8,
                        //     metalness: 0,
                        //     roughness: 0,
                        //     transparent: true,
                        //     transmission: 1.0,
                        //     side: THREE.DoubleSide,
                        //     clearcoat: 1.0,
                        //     clearcoatRoughness: 0.25
                        // })
                        // points.computeVertexNormals()
                        // const mesh = new THREE.Mesh(points, material)
                        // mesh.rotateX(-Math.PI / 2)
                        // this.addObjectToScene(mesh)

                        const box = new THREE.Box3();

                        // ensure the bounding box is computed for its geometry
                        // this should be done only once (assuming static geometries)
                        mesh.geometry.computeBoundingBox();

                        // ...

                        // in the animation loop, compute the current bounding box with the world matrix
                        box.copy( mesh.geometry.boundingBox ).applyMatrix4( mesh.matrixWorld );
                        
                        r();

                    }, undefined, e=>console.log("Could not load model at: " + digSite[3] + ", error: " + e)
                    );
                }
            });

            // Load artifacts
            artifacts.forEach(async artifact=>{

                
                let modelLink = artifact[4];
                await new Promise(async r=>{
                    gltfloader.load(modelLink, async gltf=>{

                        let obj = new THREE.Object3D();
                        // Add id and date to artifact
                        obj.userData.id = artifact[0]
                        obj.userData.date = new Date(artifact[5].replace(/-/g, '\/'))

                        // Artifact model
                        let aModel = gltf.scene.children[0]
                        HELPERS.normalizeModelScale(aModel);
                        let scene = new MeshWrapper(aModel);

                        // Add click/hover events
                        scene.onHover = e=>{
                            document.body.style.cursor = "pointer";
                        }
                        scene.onEndHover = e=>{
                            document.body.style.cursor = "default";
                        }
                        scene.onClick = e=>{
                            window.open("/artifact.php?id=" + obj.userData.id, '_blank');
                        }

                        obj.add(scene.mesh);

                        // Add to raycast objects
                        scope.raycastObjects.push(scene.mesh);

                        // Load the teardrop
                        gltfloader.load("../../files/glb/map_pointer.glb", gltf=>{

                            let teardrop = gltf.scene.children[0];
                            teardrop.scale.setScalar(0.2)
                            teardrop.position.y = 2;
                            scope.updateQueue.push((t,dt)=>{
                                teardrop.rotation.z += 0.001 * dt
                            })
                            obj.add(teardrop)
                        })

                        // Parse and set the position from coordinates
                        let pos_str = artifact[6].slice(1,-1).split(",");
                        let pos = []
                        pos_str.forEach(n=>pos.push(parseFloat(n)));
                        obj.position.set(...pos);

                        scope.artifacts.push(obj);
                        scope.addObjectToScene(obj);

                        // Add to dates
                        if (Array.from(scope.artifactDates.keys()).includes(artifact[5])) {
                            scope.artifactDates.get(artifact[5]).push(obj);
                        }
                        else {
                            scope.artifactDates.set(artifact[5], [obj]);
                        }

                        r();

                    }, undefined, e=>console.log("Could not load model at: " + modelLink + ", error: " + e)
                    );
                });
            });

            // Add light to main camera
            scope.mainCamera.add(scope.light);

            // add camera to player
            scope.removeObjectFromScene(scope.mainCamera)
            scope.player.add(scope.mainCamera);
            scope.player.camera = scope.mainCamera;
            scope.addObjectToScene(scope.player);

            scope.controls = new Controller(scope.player, scope.scene, scope.renderer);

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
            scope.player.add(xrControlMenu.mesh);
            xrControlMenu.mesh.position.set(0,0,-1);
            xrControlMenu.mesh.rotateX(-Math.PI/4)

            // Add to raycast objects
            scope.raycastObjects.push(xrControlMenu.mesh)

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
            scope.dateText = dateText;
            let xrDate = new HTML2D(dateText, {width:1.5,height:0.15})
            scope.xrDate = xrDate;
            xrControlMenu.mesh.add(xrDate.mesh)
            xrDate.mesh.position.set(.03,.4,.005);

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

            // Set raycast objects
            scope.controls.raycastObjects = scope.raycastObjects;

            // Set up callbacks
            scope.controls.addEventListener("onstartxr", e=>{
                desktopControls.mesh.visible = false;
                xrControls.mesh.visible = true;
            })
            scope.controls.addEventListener("onleavexr", e=>{
                desktopControls.mesh.visible = true;
                xrControls.mesh.visible = false;
            })

            scope.lastHoveredMesh = null;
            scope.xrSliderPtr = xrSliderPtr;
            scope.isHoveringSliderPtr = false;

            scope.controls.addEventListener("onhover", e=>{

                let intersects = e.intersects;

                intersects.forEach(i=>{
                    if (!i.object.visible || !i.object.parent.visible) {
                        i._visible = false;
                    }
                    else
                        i._visible = true;
                })
                intersects = intersects.filter(i=>i._visible)

                if (intersects.length > 0) {

                    let topMesh = intersects[0].object;

                    if (topMesh == scope.lastHoveredMesh) {
                        // Not much to do here
                    }
                    else {


                        if (topMesh.uiElement) {

                            if (topMesh.uiElement.name === "sliderPtr") {
                                scope.isHoveringSliderPtr = true;
                            }
                            topMesh.uiElement._onHover();
                        }

                        if (scope.lastHoveredMesh != null) {

                            if (scope.lastHoveredMesh.uiElement) {
                                if (scope.lastHoveredMesh.uiElement.name === "sliderPtr") {

                                    scope.isHoveringSliderPtr = false;
                                }
                                scope.lastHoveredMesh.uiElement._onEndHover();
                            }
                        }
                    }

                    scope.lastHoveredMesh = topMesh;
                }
                else {

                    if (scope.lastHoveredMesh == null) {

                    }
                    else {

                        if (scope.lastHoveredMesh.uiElement) {
                            if (scope.lastHoveredMesh.uiElement.name === "sliderPtr") {
                                scope.isHoveringSliderPtr = false;
                            }
                            scope.lastHoveredMesh.uiElement._onEndHover();
                        }
                    }

                    scope.lastHoveredMesh = null;
                }
            });

            resolve();
        });

        // Move player to the spawn point
        console.log(spawnPos)
        this.player.position.copy(spawnPos)

        // Finish loading
        this.domElem.parentElement.removeChild(loadingDOM)
        this.ready = true;

    }

    update() {

        if (!this.ready) return;

        // let v = new THREE.Vector3()
        // this.player.camera.getWorldDirection(v)
        // console.log(v)
        // console.log(this.player.position)

        this.handleSlider();
        this.handleClicks();

        this.controls.update(this.deltaTime());


    }

    handleClicks() {

        if (!this.__lastClick)
            this.__lastClick = 0;

        if (!this.__hasClicked)
            this.__hasClicked = false;

        if (this.controls.pointerIsDown()) {
            if (!this.__hasClicked && performance.now() - this.__lastClick > 500) {
                if (this.lastHoveredMesh) {
    
                    if (this.lastHoveredMesh.uiElement) 
                        this.lastHoveredMesh.uiElement._onClick();
                }
    
                this.__lastClick = performance.now();
                this.__hasClicked = true;
            }
        }
        else {
            this.__hasClicked = false;
        }
        
    }

    handleSlider() {

        if (this.isHoveringSliderPtr && this.controls.pointerIsDown()) {

            let currSliderPos = this.xrSliderPtr.mesh.position;
            let ptrDelta = new THREE.Vector3();
            let ptrPos = new THREE.Vector3();
            ptrPos.copy(this.controls.getPointerLocation());
            this.xrSliderPtr.mesh.parent.worldToLocal(ptrPos)
            ptrDelta.copy(ptrPos);
            ptrDelta.sub(currSliderPos)

            let canSlideLeft = currSliderPos.x < .223 && ptrDelta.x > 0;
            let canSlideRight = currSliderPos.x > -.627 && ptrDelta.x < 0;


            if (canSlideLeft || canSlideRight) {


                // let amt = ptrDelta.x;
                // if (Math.abs(amt) >= 0.01)
                //     amt /= 440;

                // this.xrSliderPtr.mesh.translateOnAxis(new THREE.Vector3(1,0,0), amt);
                this.xrSliderPtr.mesh.position.x = ptrPos.x;//(new THREE.Vector3(1,0,0), amt);

                let arr = Array.from(this.artifactDates.values());
                // Sort the dates in ascending order
                arr.sort((a,b)=>{return b[0].userData.date - a[0].userData.date})
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

                    this.dateText.innerText = arr[currNum][0].userData.date.toDateString();
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