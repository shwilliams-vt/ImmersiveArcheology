import { THREE }  from "./xrworld.js";

export function createBoxMesh(box) {
    const dimensions = new THREE.Vector3().subVectors( box.max, box.min );
    const boxGeo = new THREE.BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z);

    // move new mesh center so it's aligned with the original object
    const matrix = new THREE.Matrix4().setPosition(dimensions.addVectors(box.min, box.max).multiplyScalar( 0.5 ));
    boxGeo.applyMatrix4(matrix);

    // make a mesh
    return new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial( {color:0xff0000, transparent:true, opacity:0.5}))
}

export function normalizeModelScale(model) {

    let box = new THREE.Box3().setFromObject(model);
    let max = Math.max(...Object.values(box.max));

    let scale = 1/max;
    model.scale.setScalar(scale);
}

export function normalizeModelPosition(model) {

    let box = new THREE.Box3().setFromObject(model);

    // Normalize the position
    model.position.set(
        - (box.max.x + box.min.x) / 2,
        - (box.max.y + box.min.y) / 2,
        - (box.max.z + box.min.z) / 2
    );

    // let m = createBoxMesh(box);
    // model.add(m)
    
}

export function getMeshMidpoint(mesh) {
    let box = new THREE.Box3().setFromObject(mesh);

    // Normalize the position
    return new THREE.Vector3(
        (box.max.x + box.min.x) / 2,
        (box.max.y + box.min.y) / 2,
        (box.max.z + box.min.z) / 2
    );
}

// https://sbcode.net/threejs/gravity-centre/
// import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.18.0/dist/cannon-es.js";
