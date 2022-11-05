import * as THREE from "https://unpkg.com/three@0.126.0/build/three.module.js";

class XRWorld {

    // Cameras
    mainCamera = null;
    cameras = [];

    // Scenes
    scene = null;

    

    updateCamerasOnResize(aspect) {
        this.cameras.forEach(camera=>{
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
        });
    }


    constructor(parentElem, initFunc) {

        var scene = new THREE.Scene();
        this.scene = scene;

        // Elapsed time
        this._elapsed = 0;
        this._deltaTime = 0;

        // Create a basic perspective camera
        this.mainCamera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        this.mainCamera.position.z = 4;
        this.cameras.push(this.mainCamera);

        // Create a renderer with Antialiasing
        var renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer = renderer;
        this.domElem = renderer.domElement;

        this.domElem.oncontextmenu = () => false;
        parentElem.oncontextmenu = () => false;

        // Configure renderer clear color
        renderer.setClearColor( 0xffffff, 1 );

        // Append Renderer to DOM
        if (!parentElem)
            parentElem = document.body;
        
        this.parentElem = parentElem;
        parentElem.appendChild( renderer.domElement );

        // Configure renderer size
        let scope = this;
        function onResize(e) {
            var rect = parentElem.getBoundingClientRect(); 

            scope.updateCamerasOnResize(rect.width / rect.height);
            renderer.setSize( rect.width, rect.height );
        }

        // Trigger initial events
        onResize();
        
        // Events
        window.addEventListener("resize", onResize, false);
        parent.addEventListener("load", onResize, false);

        // Add clock
        this.clock = new THREE.Clock();

        // update queue
        this.updateQueue = []

        // Add premade objects
        this.addObjectToScene(this.mainCamera);

        // Run init in case client wants to run something before start
        if (initFunc)
            initFunc();

        // Start
        this.__start();
    }


    // Main Functions
    __start() {
        if (this.start)
            this.start();

        // render(this);
        this.renderer.setAnimationLoop((t) => { this.__update(t) });
    }

    __update(t) {

        this._deltaTime = t - this._elapsed;
        this._elapsed = t;

        if (this.update)
            this.update(this.elapsed, this.deltaTime);

        // update queue
        this.updateQueue.forEach(lambda=>{
            lambda(this._elapsed, this._deltaTime)
        })

        // Render the scene
        this.renderer.render(this.scene, this.mainCamera);
    }

    // User functions
    addObjectToScene(object) {
        this.scene.add( object );
    }

    removeObjectFromScene(object) {
        this.scene.remove(object);
    }

    deltaTime() {
        return Math.min(0.02, this.clock.getDelta());
    }
}

export { XRWorld, THREE };