import { THREE } from "./xrworld";

function addClickEvent(mouseButton, onStart, onEnd) {

    document.addEventListener("mousedown", e=>{
        if (e.button == mouseButton)
            if (onStart)
                onStart();
    })

    document.addEventListener("mouseup", e=>{
        if (e.button == mouseButton)
            if (onStart)
                onEnd();
    })
}

function addKeyEvent(key, onStart, onEnd) {

    document.addEventListener("keydown", e=>{
        if (e.key == key)
            if (onStart)
                onStart();
    })

    document.addEventListener("keyup", e=>{
        if (e.key == key)
            if (onStart)
                onEnd();
    })
}

export default class Controller {

    IN_XR = false;

    constructor(player) {
        
        this.player = player;

        // Properties
        this.enabled = true;
        this.moveSpeed = 4;

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
        )

    }

    calculateInputVector() {
        let x_pos = this.KEY_A_IS_DOWN ? 1 : 0;
        let x_neg = this.KEY_D_IS_DOWN ? -1 : 0;

        let y_pos = 0;
        let y_neg = 0;
        
        let z_pos = this.LEFT_MOUSE_DOWN || this.KEY_W_IS_DOWN ? 1 : 0;
        let z_neg = this.RIGHT_MOUSE_DOWN || this.KEY_S_IS_DOWN ? -1 : 0;

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
        fwd.applyQuaternion(this.player.quaternion)

        this.translate(this.moveSpeed * deltaTime, fwd);

    }   

}