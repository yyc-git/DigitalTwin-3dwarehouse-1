import { state } from "../../type/StateType"
import * as ParkScene from "./scene_park/ParkScene"
import * as WarehouseScene from "./scene_warehouse/WarehouseScene"
import { scene } from "../../../ui_layer/global/store/GlobalStoreType"
import { NullableUtils } from "meta3d-jiehuo-abstract"
import { getAbstractState, getConfigState, readState, setAbstractState, setConfigState, writeState } from "../../state/State"
import { ArticluatedAnimation } from "meta3d-jiehuo-abstract"
import { Render } from "meta3d-jiehuo-abstract"

export let initAllScenes = (state: state) => {
    return ParkScene.init(state).then(state => {
        return WarehouseScene.init(state)
    })
}

export let getAllScenes = (state: state) => {
    return [
        ParkScene.getNullableScene(state),
        WarehouseScene.getNullableScene(state),
    ].reduce((result, nullableScene) => {
        return NullableUtils.getWithDefault(NullableUtils.map(nullableScene => {
            return result.concat([nullableScene])
        }, nullableScene), result)
    }, [])
}

let _disposeCurrentScene = (state: state, currentScene: scene) => {
    state = setAbstractState(state, ArticluatedAnimation.removeAllArticluatedAnimations(getAbstractState(state)))

    switch (currentScene) {
        case scene.Park:
            return ParkScene.dispose(state)
        case scene.Warehouse:
            return WarehouseScene.dispose(state)
        default:
            throw new Error("error")
    }
}

export let updateCurrentScene = (state: state, name) => {
    return ArticluatedAnimation.updateAllArticluatedAnimations(state, [readState, writeState, getAbstractState]).then(state => {
        switch (name) {
            case ParkScene.getName():
                return ParkScene.update(state)
            case WarehouseScene.getName():
                return WarehouseScene.update(state)
            default:
                throw new Error("error")
        }
    })
}

export let switchScene = (state: state, currentScene: scene, targetScene: scene, sceneNumber: number) => {
    return _disposeCurrentScene(state, currentScene).then(state => {
        switch (targetScene) {
            case scene.Park:
                return ParkScene.enterScene(state, sceneNumber)
            case scene.Warehouse:
                return WarehouseScene.enterScene(state, sceneNumber)
            default:
                throw new Error("error")
        }
        // return state
    }).then(state => {
        return setAbstractState(state, Render.markIsNeedSetSize(getAbstractState(state), true))
    })
}

export let getIsDebug = (state: state) => {
    return getConfigState(state).isDebug
}

export let setIsDebug = (state: state, isDebug) => {
    return setConfigState(state, {
        ...getConfigState(state),
        isDebug: isDebug
    })
}

export let getIsProduction = (state: state) => {
    return getConfigState(state).isProduction
}

export let setIsProduction = (state: state, isProduction) => {
    return setConfigState(state, {
        ...getConfigState(state),
        isProduction: isProduction
    })
}

export let getCurrentCameraType = (state: state, currentScene: scene) => {
    switch (currentScene) {
        case scene.Park:
            return ParkScene.getCameraType(state)
        case scene.Warehouse:
            return WarehouseScene.getCameraType(state)
        default:
            throw new Error("error")
    }
}