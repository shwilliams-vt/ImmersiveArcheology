import { THREE } from "./xrworld.js";

let RENDERER = null

function addClickEvent(mouseButton, onStart, onEnd) {

    RENDERER.addEventListener("mousedown", e=>{
        if (e.button == mouseButton)
            if (onStart)
                onStart();
    })

    RENDERER.addEventListener("mouseup", e=>{
        if (e.button == mouseButton)
            if (onStart)
                onEnd();
    })
}

function addKeyEvent(key, onStart, onEnd) {

    RENDERER.addEventListener("keydown", e=>{
        if (e.key == key)
            if (onStart)
                onStart();
    })

    RENDERER.addEventListener("keyup", e=>{
        if (e.key == key)
            if (onStart)
                onEnd();
    })
}

export default class Controller {

    IN_XR = false;

    constructor(player, scene, renderer) {

        this.player = player;
        this.scene = scene;
        this.renderer = renderer;
        RENDERER = renderer.domElement
        RENDERER.tabIndex = 1000;

        // Properties
        this.enabled = true;
        this.canMove = true;
        this.canRotate = true;
        this.moveSpeed = 4;
        this.mouseXSpeed = .4;
        this.mouseYSpeed = .4;

        // Read only flags

        // Mouse
        this.LEFT_MOUSE_DOWN = false;
        this.RIGHT_MOUSE_DOWN = false;

        // Keys
        this.KEY_W_IS_DOWN = false;
        this.KEY_A_IS_DOWN = false;
        this.KEY_S_IS_DOWN = false;
        this.KEY_D_IS_DOWN = false;

        // Intersecting meshes (raycasting)
        this.raycastMaxDistance = 50;
        this.RAYCASTER = new THREE.Raycaster();
        this.RAYCASTER.far = 50;
        this.LAST_RAYCAST_LOC = new THREE.Vector3();
        this.MOUSE_PTR_LOCATION = new THREE.Vector2();
        // Musy
        this.MOUSE_PTR_LOCATION.x = 'a';
        this.MOUSE_PTR_LOCATION.y = 'a';

        // XR Sources
        this.XR_CONTROLLERS = []
        this.XR_STATE = {}

        // XR Guides
        let scope = this;
        {
            const material = new THREE.LineBasicMaterial( { color: 0x00ff00 } );
            const geometry = new THREE.BufferGeometry();
            scope.guideLine = new THREE.Line( geometry, material );
            scope.guideLine.frustumCulled = false;
            scope.scene.add(scope.guideLine);
        }

        // Events
        this.eventListeners = new Map();
        this.setUpEvents();
    }

    update(deltaTime) {

        if (!this.enabled)
            return;

        this.rotate(deltaTime)
        if (this.canMove)
            this.translateForward(deltaTime)

        this.getIntersections();

        this.pointerIsDown()
    }

    setUpEvents() {

        let scope = this;

        // -- Input (ie WASD, clicks)

        // - Mouse nav (on hold)

        // Forward is left click, back is right click
        addClickEvent(
            0, // left click
            ()=>scope.LEFT_MOUSE_DOWN = true,
            ()=>scope.LEFT_MOUSE_DOWN = false
        )
        addClickEvent(
            2, // right click
            ()=>scope.RIGHT_MOUSE_DOWN = true,
            ()=>scope.RIGHT_MOUSE_DOWN = false
        )

        // - Key Nav
        addKeyEvent(
            'w',
            ()=>scope.KEY_W_IS_DOWN = true,
            ()=>scope.KEY_W_IS_DOWN = false,
        )
        addKeyEvent(
            'a',
            ()=>scope.KEY_A_IS_DOWN = true,
            ()=>scope.KEY_A_IS_DOWN = false,
        )
        addKeyEvent(
            's',
            ()=>scope.KEY_S_IS_DOWN = true,
            ()=>scope.KEY_S_IS_DOWN = false,
        )
        addKeyEvent(
            'd',
            ()=>scope.KEY_D_IS_DOWN = true,
            ()=>scope.KEY_D_IS_DOWN = false,
        );
        addKeyEvent(
            'z',
            ()=>scope.KEY_Z_IS_DOWN = true,
            ()=>scope.KEY_Z_IS_DOWN = false,
        )
        addKeyEvent(
            'x',
            ()=>scope.KEY_X_IS_DOWN = true,
            ()=>scope.KEY_X_IS_DOWN = false,
        );

        // Add camera movement
        let p = performance.now()
        this.MOUSE_DELTA = {x:0,y:0, t_last:p,t:p}
        // Store last recorded
        RENDERER.addEventListener("mousemove", e=>{
            scope.MOUSE_DELTA.x = e.movementX;
            scope.MOUSE_DELTA.y = e.movementY;
            let t = performance.now();
            scope.MOUSE_DELTA.t = t
            scope.MOUSE_DELTA.t_last = t
        });

        // Mouse out events
        RENDERER.addEventListener("mouseout", e=>{
            scope.reset()
        })
        RENDERER.addEventListener("focusout", e=>{
            scope.reset()
        })

        // Raycast Event
        RENDERER.addEventListener("pointermove", e=>{

            var bounds = RENDERER.getBoundingClientRect();
            // get the mouse coordinates, subtract the canvas top left
            let x = e.pageX - bounds.left;
            let y = e.pageY - bounds.top;
            scope.MOUSE_PTR_LOCATION.x = ( x / (bounds.width) ) * 2 - 1;
            scope.MOUSE_PTR_LOCATION.y = - ( y / (bounds.height) ) * 2 + 1;
            
        })


        // XR Events
        this.renderer.xr.enabled = true;
        this.renderer.xr.setFramebufferScaleFactor(2.0);

        // Sessions
        this.renderer.xr.addEventListener('sessionstart', function ( e ) {

            let session = scope.renderer.xr.getSession();

            // Save camera state
            let camPos = new THREE.Vector3()
            let camRot = new THREE.Quaternion()
            camPos.copy(scope.player.camera.position)
            camRot.copy(scope.player.camera.quaternion)
            scope.XR_STATE.CAM_POS = camPos
            scope.XR_STATE.CAM_ROT = camRot

            // Reset input sources
            scope.XR_CONTROLLERS = []

            // Update
            // controllers
            session.addEventListener("inputsourceschange", e=>{
                
                // Update our controllers
                e.removed.forEach(removedSource=>{
                    scope.XR_CONTROLLERS = scope.XR_CONTROLLERS.filter(src=>src != removedSource);
                })
                e.added.forEach(addedSource=>{
                    scope.XR_CONTROLLERS.push(addedSource);
                })
                // Register controller numbers
                let numControllers = 0;
                scope.XR_CONTROLLERS.forEach(controller=>{
                    controller.controllerNumber = numControllers;
                    numControllers++;
                })

            })

            

            scope.IN_XR = true;

            scope.dispatchEvent("onstartxr", null);
        
        } );
        
        this.renderer.xr.addEventListener('sessionend', e=>{
        
            let session = scope.renderer.xr.getSession();

            // Reset player camera
            scope.player.camera.position.copy(scope.XR_STATE.CAM_POS)
            scope.player.camera.quaternion.copy(scope.XR_STATE.CAM_ROT)

            scope.IN_XR = false;
        
            scope.dispatchEvent("onleavexr", null);
        } );

        

    }

    dispatchEvent(type, args) {

        if (Array.from(this.eventListeners.keys()).includes(type)) {
            let callbacks = this.eventListeners.get(type);
            callbacks.forEach(callback=>{
                
                callback(args)
            })
        }
            
    }

    addEventListener(type, callback) {

        if (Array.from(this.eventListeners.keys()).includes(type)) {
            this.eventListeners.get(type).push(callback)
        }
        else {
            this.eventListeners.set(type, [callback]);
        }
    }

    reset() {
        this.MOUSE_DELTA.x = 0
        this.MOUSE_DELTA.y = 0
        this.KEY_W_IS_DOWN = false
        this.KEY_A_IS_DOWN = false
        this.KEY_S_IS_DOWN = false
        this.KEY_D_IS_DOWN = false
        this.KEY_Z_IS_DOWN = false
        this.KEY_X_IS_DOWN = false
        this.LEFT_MOUSE_DOWN = false
        this.RIGHT_MOUSE_DOWN = false
    }

    calculateInputVector() {

        let x_pos = 0, x_neg = 0, y_pos = 0, y_neg = 0, z_pos = 0, z_neg = 0;

        if (!this.IN_XR) {

            x_pos = this.KEY_A_IS_DOWN ? -1 : 0;
            x_neg = this.KEY_D_IS_DOWN ? 1 : 0;

            y_pos = this.KEY_Z_IS_DOWN ? 1 : 0;
            y_neg = this.KEY_X_IS_DOWN ? -1 : 0;

            // let z_pos = this.LEFT_MOUSE_DOWN || this.KEY_W_IS_DOWN ? 1 : 0;
            // let z_neg = this.RIGHT_MOUSE_DOWN || this.KEY_S_IS_DOWN ? -1 : 0;

            z_pos = this.KEY_W_IS_DOWN ? -1 : 0;
            z_neg = this.KEY_S_IS_DOWN ? 1 : 0;
        }
        else {

            // In XR
            let leftController = this.getXRControllerByHand("left");
            let rightController = this.getXRControllerByHand("right");


            if (leftController && rightController) {

                let leftGamepad = leftController.gamepad;
                let rightGamepad = rightController.gamepad;
    
                let leftMultiAxes = leftGamepad.axes.length > 2;
                let rightMultiAxes = rightGamepad.axes.length > 2;
    
                x_pos = leftGamepad.axes[leftMultiAxes ?  2 : 0 ];
                z_pos = leftGamepad.axes[leftMultiAxes ?  3 : 1 ];

                y_pos = rightGamepad.axes[rightMultiAxes ?  3 : 1 ];
            }
            
        }

        return new THREE.Vector3(
            x_pos + x_neg,
            y_pos + y_neg,
            z_pos + z_neg
        );
    }

    translate(speed, axis) {

        // Create motion vector
        let vec = new THREE.Vector3(axis.x, axis.y, axis.z);

        // Based off speed
        vec.multiplyScalar(speed);

        // Move player
        this.player.position.add(vec);
    }

    translateForward(deltaTime) {
        // Translate on the fwd axis
        let fwd = this.calculateInputVector();

        let q = new THREE.Quaternion();
        q.copy(this.player.quaternion)
        // q.multiply(this.player.camera.quaternion)
        
        fwd.applyQuaternion(q)

        this.translate(this.moveSpeed * deltaTime, fwd);

    }

    rotate(deltaTime) {

        if (!this.IN_XR && this.MOUSE_DELTA.t_last == this.MOUSE_DELTA.t && this.LEFT_MOUSE_DOWN) {

            if (this.canRotate) {
                // Get local X and Y axis
                let local_x = new THREE.Vector3(1,0,0);
                let local_y = new THREE.Vector3(0,1,0);

                // Rotate player X axis based on mouse Y
                this.player.camera.rotateOnWorldAxis(local_x, -this.MOUSE_DELTA.y * this.mouseYSpeed * deltaTime);

                // // Rotate player Y axis based on mouse X
                this.player.rotateOnWorldAxis(local_y, -this.MOUSE_DELTA.x * this.mouseXSpeed * deltaTime);
            }

            // update last time
            this.MOUSE_DELTA.t_last = performance.now()
            
        }
        else {

            this.MOUSE_DELTA = {x:0, y:0, t:0, t_last:1}
        }
    }

    getIntersections() {

        //create a blue LineBasicMaterial
        let firstPoint = new THREE.Vector3();

        if (!this.IN_XR) {

            // console.log(this.MOUSE_PTR_LOCATION)
            this.RAYCASTER.setFromCamera(this.MOUSE_PTR_LOCATION, this.player.camera);
            this.player.getWorldPosition(firstPoint)

        }
        else {

            let rightController = this.getXRControllerByHand("right");
            
            if (rightController) {

                let tempMatrix = new THREE.Matrix4();
                let raySpace = this.renderer.xr.getController(rightController.controllerNumber)
                tempMatrix.extractRotation(raySpace.matrix);
                this.RAYCASTER.ray.origin.setFromMatrixPosition(raySpace.matrix);
                this.RAYCASTER.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

                console.log(this.RAYCASTER.ray.origin, this.RAYCASTER.ray.direction);

                firstPoint.copy(this.RAYCASTER.ray.origin);
            }
            else {
                this.RAYCASTER.setFromCamera(new THREE.Vector2(), this.player.camera);
                this.player.getWorldPosition(firstPoint)

            }
        }

        let intersects = this.RAYCASTER.intersectObjects( this.scene.children, true );

        let mesh = null;
        if (intersects.length > 0) {
            mesh = intersects[0].object;
            this.LAST_RAYCAST_LOC.copy(intersects[0].point)
            // console.log(mesh.uiElement)
        }
        else {
            let p = new THREE.Vector3();
            p.copy(this.RAYCASTER.ray.direction)
            p.multiplyScalar(this.RAYCASTER.far)
            p.add(this.RAYCASTER.ray.origin);
            this.LAST_RAYCAST_LOC.copy(p)
        }

        this.guideLine.geometry.setFromPoints( [firstPoint, this.LAST_RAYCAST_LOC] );

        this.dispatchEvent("onhover", {intersects:intersects})
    }

    getPointerLocation() {
        return this.LAST_RAYCAST_LOC;
    }

    pointerIsDown() {
        if (this.IN_XR) {
            let rightController = this.getXRControllerByHand("right")

            if (rightController) {
                return rightController.gamepad.buttons[0].pressed;
            }
            return false;
        }
        else {
            return this.LEFT_MOUSE_DOWN;
        }
    }

    getXRControllerByHand(name) {

        if (!this.IN_XR) return null;

        let found_controller = null;

        this.XR_CONTROLLERS.forEach(controller=>{
            if (controller.handedness == name) {
                found_controller = controller;
            }
        })

        return found_controller;
    }

}