import { Layer, NullableUtils, View } from "meta3d-jiehuo-abstract"
import { state } from "../../../type/StateType"
// import {NullableUtils} from "meta3d-jiehuo-abstract"
import { getState, setState } from "./ParkScene"
import { PerspectiveCamera } from "three"
import { NewThreeInstance } from "meta3d-jiehuo-abstract"

export let createCamera = () => {
    let camera = NewThreeInstance.createPerspectiveCamera(60, View.getWidth() / View.getHeight(), 0.1, 1000)

    // Layer.enableVisibleLayer(camera.layers)

    return camera
}

// export let getCamera = (state: state) => {
//     return NullableUtils.getExn(getState(state).camera)
// }

export let updateCurrentControls = (controls, camera) => {
    camera.position.set(0, 80, 80)

    controls.object = camera

    // controls.listenToKeyEvents(window) // optional

    //controls.addEventListener( 'change', render ) // call this only in static scenes (i.e., if there is no articluatedAnimation loop)

    // controls.enableDamping = true // an articluatedAnimation loop is required when either damping or auto-rotation are enabled
    // controls.dampingFactor = 0.05

    // controls.screenSpacePanning = false

    controls.minDistance = 1
    controls.maxDistance = 300

    controls.maxPolarAngle = Math.PI / 2

    controls.enableZoom = true
    controls.enablePan = true

    return controls
}