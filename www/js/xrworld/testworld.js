import { XRWorld, THREE }  from "./xrworld.js";

export default class TestWorld extends XRWorld {

    constructor(parentElem) {
        // Do nothing for init func
        super(parentElem, ()=>{});
    }    

    // Demo update and start implementation

    start() {

        // Create a Cube Mesh with basic material
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshStandardMaterial(  );

        this.cube = new THREE.Mesh( geometry, material );
        this.light = new THREE.PointLight( 0xff0000, 1, 100 );
        this.light.position.z = 4;

        // Add cube to Scene
        this.addObjectToScene(this.cube);
        this.addObjectToScene(this.light);
    }

    update() {

        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
    }

}