import { THREE } from "../xrworld.js";
import UIElement from "./uielem.js";

export default class MeshWrapper extends UIElement {

    constructor(mesh) {

        super();

        let box = new THREE.Box3();
        box.setFromObject( mesh );

        // make a BoxBufferGeometry of the same size as Box3
        const dimensions = new THREE.Vector3().subVectors( box.max, box.min );
        const boxGeo = new THREE.BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z);

        // move new mesh center so it's aligned with the original object
        const matrix = new THREE.Matrix4().setPosition(dimensions.addVectors(box.min, box.max).multiplyScalar( 0.5 ));
        boxGeo.applyMatrix4(matrix);

        // make a mesh
        this.mesh = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } ))
        this.mesh.add(mesh)

        this.mesh.uiElement = this;
    }

}