import { THREE }  from "./xrworld.js";


export function normalizeModel(model) {

    let box = new THREE.Box3().setFromObject(model);
    
    //console.log(box);

    // let max = Math.max(...[Math.abs(box.max.x), Math.abs(box.min.x), 
    //                        Math.abs(box.max.y), Math.abs(box.min.y), 
    //                        Math.abs(box.max.z), Math.abs(box.min.z)]);

    let max = Math.max(...Object.values(box.max));

    let scale = 1/max;
    model.scale.setScalar(scale);

    // Normalize the position
    //console.log(model.position);
    model.position.set(
        scale*(box.max.x + box.min.x) / 2,
        -scale*(box.max.y + box.min.y) / 2,
        scale*(box.max.z + box.min.z) / 2
    );
    //console.log(model.position);
}

// https://sbcode.net/threejs/gravity-centre/
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js";

class GravityObject {
    constructor(threeObj, gravObj, useGravity) {
        this.threeObj = threeObj;
        this.gravObj = gravObj;
        this.useGravity = useGravity;
    }
}

const GRAVITY = 9.81;
export class GravityWorld {

    constructor() {
        // List of three and cannon obj tuples
        this.gravityObjects = [];

        // Cannon world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -GRAVITY, 0);
        let scope = this;
        this.world.addEventListener('postStep', function () {
            // Gravity towards (0,0,0)
            scope.gravityObjects.forEach((gravityObject) => {
                let s = gravityObject.gravObj;
                if (gravityObject.useGravity) {
                    const v = new CANNON.Vec3();
                    v.set(0,-1,0)
                    v.scale(GRAVITY, s.force)
                    s.applyLocalForce(v);
                }
                s.force.y += s.mass //cancel out world gravity
            })
        })

        this.clock = new THREE.Clock();
    }

    add(threeObj, type, useGravity) {
        let shape;

        // Get bounding box
        let box = new THREE.Box3().setFromObject(threeObj);
        let max = Math.max(...Object.values(box.max));

        switch (type) {
            // TODO
            case "sphere":
                shape = new CANNON.Sphere(Math.abs(2 * max));
                break;
            case "cylinder":
                shape = new CANNON.Cylinder(
                    Math.abs(Math.max(...[box.max.x, box.max.z])),
                    Math.abs(Math.max(...[box.max.x, box.max.z])),
                    Math.abs(2*box.max.y),
                    16
                );
                break;
            default:
                shape = new CANNON.Box(Math.abs(2*max));
                break;
        }
        let body = new CANNON.Body({ mass: 1 });
        body.addShape(shape)
        body.position.x = threeObj.position.x;
        body.position.y = threeObj.position.y;
        body.position.z = threeObj.position.z;
        body.quaternion.set(
            threeObj.quaternion.x,
            threeObj.quaternion.y,
            threeObj.quaternion.z,
            threeObj.quaternion.w
        )

        // Add to gravityObjects
        this.gravityObjects.push(new GravityObject(threeObj, body, useGravity));
        this.world.addBody(body);
    }

    update() {

        let delta = Math.min(this.clock.getDelta(), 0.1)
        this.world.step(delta)

        this.gravityObjects.forEach(gravityObject=>{
            let threeObj = gravityObject.threeObj;
            let gravObj = gravityObject.gravObj;

            threeObj.position.set(gravObj.position.x, gravObj.position.y, gravObj.position.z)
            threeObj.quaternion.set(
                gravObj.quaternion.x,
                gravObj.quaternion.y,
                gravObj.quaternion.z,
                gravObj.quaternion.w
            )
        })
    }
}