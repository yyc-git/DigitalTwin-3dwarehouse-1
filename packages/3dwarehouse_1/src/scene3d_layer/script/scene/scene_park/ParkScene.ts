import { DirectionalLight, PerspectiveCamera, Vector3, Box3 } from "three"
import { cameraType, state } from "../../../type/StateType";
// import { getResource } from "meta3d-jiehuo-abstract"
import { Loader, Camera, View, Billboard, ModelLoader } from "meta3d-jiehuo-abstract"
import { createCamera, updateCurrentControls } from "./Camera";
// import { getAllScenesState, getRenderState, setParkSceneState } from "../../../state/State";
// import {NullableUtils} from "meta3d-jiehuo-abstract"
import { DisposeUtils } from "meta3d-jiehuo-abstract"
import { findAllWarehouses } from "./Warehouse";
import { parkScene } from "./type/StateType";
import { Scene } from "meta3d-jiehuo-abstract"
import { SceneUtils } from "meta3d-jiehuo-abstract"
import { getAbstractState, getParkSceneState, setAbstractState, setParkSceneState } from "../../../state/State";
import { State } from "meta3d-jiehuo-abstract"
import { getAllScenes } from "../Scene";
import { NullableUtils } from "meta3d-jiehuo-abstract";
import { resourceType } from "meta3d-jiehuo-abstract/src/type/StateType";

export let getState = (state: state) => {
    return NullableUtils.getExn(getParkSceneState(state))
}

export let setState = (state: state, parkSceneState: parkScene) => {
    return setParkSceneState(state, parkSceneState)
}

export let getName = () => "park"

// export let getSceneGlbName = () => "park"

let _changeColor = (scene) => {
    Scene.findObjects(scene, ({ name }) => [
        "ground"
    ].includes(name)).forEach(mesh => {
        mesh.material.color.setRGB(0.5, 0.5, 0.4)
    })

    return scene
}

let _changeDirectionLight = (scene) => {
    let light = null
    scene.traverse(object => {
        if (object.isDirectionalLight) {
            light = object
        }
    })

    scene.remove(light)

    let color = 0xFFFFFF;
    let intensity = 2;
    light = new DirectionalLight(color, intensity);
    light.position.set(10, 10, 10);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);

    return scene
}

let _addLabelToCabinet = (scene) => {
    findAllWarehouses(scene).forEach((warehouse, i) => {
        if (warehouse.isMesh) {
            throw new Error("shouldn't be Mesh")
        }

        let label = Billboard.createLabal(`${i + 1}号仓库`, new Vector3().set(0, new Box3().setFromObject(warehouse).getSize(new Vector3()).y * 2 + 3, 0), {
            isSizeAttenuation: true,
            width: 500,
            size: 320,
            backgroundColor: "blue",
            textColor: "white"
        })

        warehouse.add(label)
    })

    return scene
}

let _updateSceneModel = (state: state, scene: any, sceneNumber) => {
    scene.name = getName()

    scene = SceneUtils.addAmbientLight(scene)
    scene = _changeColor(scene)
    scene = _changeDirectionLight(scene)

    scene = _addLabelToCabinet(scene)

    return [state, scene]
}

export let getNullableScene = (state: state) => {
    return getState(state).scene
}

export let getScene = (state: state) => {
    return NullableUtils.getExn(getNullableScene(state))
}

export let importScene = (state: state, renderer, sceneNumber: number) => {
    let abstractState = getAbstractState(state)

    return ModelLoader.parseGlb(abstractState, Loader.getResource(abstractState, SceneUtils.buildResourceId(getName, sceneNumber)), renderer).then(scene => {
        let data = _updateSceneModel(state, scene, sceneNumber)
        state = data[0]
        scene = data[1]

        state = setState(state, {
            ...getState(state),
            scene: NullableUtils.return_(scene),
        })

        Scene.getScene(getAbstractState(state)).add(scene)

        return state
    })
}

export let createState = (): parkScene => {
    return {
        scene: null,
        // camera: createCamera()
    }
}

// export let getCamera = getCamera_

export let setToCurrentCamera = (state: state, camera, controls) => {
    // let camera = getCamera(state)

    let abstractState = Camera.setCurrentCamera(getAbstractState(state), camera)
    abstractState = Camera.setCurrentControls(getAbstractState(state), controls)

    return setAbstractState(state, Camera.setOrbitControls(abstractState, updateCurrentControls(Camera.getOrbitControls(abstractState), camera)))
}

export let init = (state: state) => {
    return Promise.resolve(state)
}

export let update = (state: state) => {
    // Camera.getOrbitControls(getAbstractState(state)).update()

    return Promise.resolve(state)
}

export let dispose = (state: state) => {
    let scene = getScene(state)

    Scene.getScene(getAbstractState(state)).remove(scene)

    DisposeUtils.deepDispose(scene)

    return Promise.resolve(state)
}

export let enterScene = (state: state, sceneNumber: number) => {
    return importScene(state, State.getRenderState(getAbstractState(state)).renderer, sceneNumber).then(state => {
        state = setAbstractState(state, Scene.setCurrentScene(getAbstractState(state), getAllScenes(state), getScene(state)))
        state = setToCurrentCamera(state, createCamera(), Camera.getOrbitControls(getAbstractState(state)))

        return state
    })
}

export let loadResource = (state: state, setPercentFunc, sceneNumber: number) => {
    let promise
    if (!Loader.isResourceLoaded(getAbstractState(state), SceneUtils.buildResourceId(getName, sceneNumber))) {
        promise = Loader.load(getAbstractState(state), [
            {
                id: SceneUtils.buildResourceId(getName, sceneNumber),
                path: `./${getName()}/${SceneUtils.buildResourceId(getName, sceneNumber)}.glb`,
                type: resourceType.ArrayBuffer
            },
        ], setPercentFunc).then(abstractState => setAbstractState(state, abstractState))
    }
    else {
        promise = Promise.resolve(state)
    }

    return promise
}

export let getCameraType = (state: state) => {
    // TODO rewrite
    return cameraType.Orbit
}
