import { Scene } from "meta3d-jiehuo-abstract"

let _getNamePrefix = () => "warehouse"

export let findAllWarehouses = (scene) => {
    return Scene.findObjects(scene, ({ name }) => name.includes(_getNamePrefix()))
}
