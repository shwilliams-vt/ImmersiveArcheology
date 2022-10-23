import { THREE } from "./xrworld";

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
        let x_pos = this.KEY_A_IS_DOWN ? 1 : 0;
        let x_neg = this.KEY_D_IS_DOWN ? -1 : 0;

        let y_pos = this.KEY_Z_IS_DOWN ? 1 : 0;
        let y_neg = this.KEY_X_IS_DOWN ? -1 : 0;

        // let z_pos = this.LEFT_MOUSE_DOWN || this.KEY_W_IS_DOWN ? 1 : 0;
        // let z_neg = this.RIGHT_MOUSE_DOWN || this.KEY_S_IS_DOWN ? -1 : 0;

        let z_pos = this.KEY_W_IS_DOWN ? 1 : 0;
        let z_neg = this.KEY_S_IS_DOWN ? -1 : 0;

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

        if (this.MOUSE_DELTA.t_last == this.MOUSE_DELTA.t && this.LEFT_MOUSE_DOWN) {

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

}