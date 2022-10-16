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