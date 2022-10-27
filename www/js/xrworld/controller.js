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

    constructor(player, renderer) {

        this.player = player;
        this.renderer = renderer;
        RENDERER = renderer.domElement
        RENDERER.tabIndex = 1000;

        // Properties
        this.enabled = true;
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

        // XR Sources
        this.XR_CONTROLLERS = []
        this.XR_STATE = {}

        this.setUpEvents();
    }

    update(deltaTime) {

        if (!this.enabled)
            return;

        this.rotate(deltaTime)
        this.translateForward(deltaTime)
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
        this.MOUSE_DELTA = {x:0,y:0, t_last:performance.now(),t:performance.now()}
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
            session.inputSources.forEach(source=>{
                scope.XR_CONTROLLERS.push(source)
            })

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

            })

            

            scope.IN_XR = true;
        
        } );
        
        this.renderer.xr.addEventListener('sessionend', e=>{
        
            let session = scope.renderer.xr.getSession();

            // Reset player camera
            scope.player.camera.position.copy(scope.XR_STATE.CAM_POS)
            scope.player.camera.quaternion.copy(scope.XR_STATE.CAM_ROT)

            scope.IN_XR = false;
        
        } );

        

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

            x_pos = this.KEY_A_IS_DOWN ? 1 : 0;
            x_neg = this.KEY_D_IS_DOWN ? -1 : 0;

            y_pos = this.KEY_Z_IS_DOWN ? 1 : 0;
            y_neg = this.KEY_X_IS_DOWN ? -1 : 0;

            // let z_pos = this.LEFT_MOUSE_DOWN || this.KEY_W_IS_DOWN ? 1 : 0;
            // let z_neg = this.RIGHT_MOUSE_DOWN || this.KEY_S_IS_DOWN ? -1 : 0;

            z_pos = this.KEY_W_IS_DOWN ? 1 : 0;
            z_neg = this.KEY_S_IS_DOWN ? -1 : 0;
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

            // Get local X and Y axis
            let local_x = new THREE.Vector3(1,0,0);
            let local_y = new THREE.Vector3(0,1,0);

            // Rotate player X axis based on mouse Y
            this.player.camera.rotateOnWorldAxis(local_x, this.MOUSE_DELTA.y * this.mouseYSpeed * deltaTime);

            // // Rotate player Y axis based on mouse X
            this.player.rotateOnWorldAxis(local_y, -this.MOUSE_DELTA.x * this.mouseXSpeed * deltaTime);

            // update last time
            this.MOUSE_DELTA.t_last = performance.now()
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