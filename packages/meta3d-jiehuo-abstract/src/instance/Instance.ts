import type { Object3D, Mesh, Material } from "three"
import { Color } from "three"
import { Matrix4, InstancedMesh } from "three"
// import { CullingStatic, InstancedMesh2 } from '@three..ez/instanced-mesh'
import { get, range } from "../utils/ArrayUtils"
import { getExn, getWithDefault, isNullable, map } from "../utils/NullableUtils"
import { findObjectByName, findObjects, getCurrentScene, isScene } from "../scene/Scene"
import { instance, instanceIndex, sourceMeshName, state } from "../type/StateType"
import { Map } from "immutable"
import { disableAllPickableLayer, enableAllPickableLayer } from "../Layer"
import { getInstanceState, setInstanceState } from "../state/State"
import { markAllMeshesNotVisible } from "../utils/Object3DUtils"
import { getCurrentCamera } from "../scene/Camera"
import { CullingStatic, InstancedMesh2 } from "./InstancedMesh2"
// import { getInstanceState, setInstanceState } from "../state/State"

type invertedStructure = {
    clonedOnes: Array<Object3D>,
    children: Array<invertedStructure>
}

export let invertStructure = (objects: Array<Object3D>): invertedStructure => {
    let _func = (result, objects) => {
        result.clonedOnes = objects

        let childrenCount = objects[0].children.length
        // console.log(childrenCount)

        result.children = range(0, childrenCount - 1).reduce((childrenResult, i) => {
            let clonedOnes = objects.map(object => {
                return object.children[i]
            })

            childrenResult.push(
                // {
                //     clonedOnes,
                //     children: _func({}, clonedOnes)
                // }
                _func({}, clonedOnes)
            )

            return childrenResult
        }, [])


        return result
    }

    return _func({}, objects)
}

let _reduceInvertedStructure = (result: any, func: (result: any, clonedOnes: Array<Object3D>) => any, invertedStructure: invertedStructure) => {
    result = func(result, invertedStructure.clonedOnes)

    return invertedStructure.children.reduce((result, child) => {
        return _reduceInvertedStructure(result, func, child)
    }, result)
}

let _getNamePostfix = () => "_meta3d_instancedMesh"

let _addNamePostfix = (name) => {
    return `${name}${_getNamePostfix()}`
}

export let getInstanceIdPostfix = (id: string) => `_meta3d_instanceId_${id}`

export let addInstanceIdPostfix = (name, id: string) => {
    return `${name}${getInstanceIdPostfix(id)}`
}

export let addInstanceIdPostfixToObject = (object: Object3D, id: string) => {
    object.traverse(object => {
        object.name = addInstanceIdPostfix(object.name, id)
    })

    return object
}

let _getInstanceIdPostfixRegex = () => {
    return /_meta3d_instanceId_(\d+_\d+)/g
}

export let restoreName = (name) => {
    return name.replace(_getNamePostfix(), "").replace(_getInstanceIdPostfixRegex(), "")
}

export let getDefaultInstanceColor = () => new Color(1, 1, 1)

// let _updateMatrix = (mesh: InstancedMesh, index: number, matrixWorld: Matrix4) => {
//     mesh.setMatrixAt(index, matrixWorld)
// }

let _addInstanceMeshes = (state: state, scene, invertedStructure: invertedStructure): [state, Object3D] => {
    let color = getDefaultInstanceColor()

    return _reduceInvertedStructure([state, scene], ([state, scene], clonedOnes: Array<Mesh>) => {
        let clonedOne = clonedOnes[0]

        if (!clonedOne.isMesh) {
            return [state, scene]
        }

        let { geometry, material } = clonedOne

        let mesh = new InstancedMesh2(geometry, material as Material, clonedOnes.length, {
            behaviour: CullingStatic,
            onInstanceCreation: (obj, index) => {
                // _updateMatrix(mesh, index, clonedOnes[index].matrixWorld)
                // obj.position.copy(clonedOnes[index].position)

                // obj.applyMatrix4(clonedOnes[index].matrixWorld)
                obj.setMatrixWorld(clonedOnes[index].matrixWorld)

                // obj.
                obj.setColor(color)
            }
        })

        mesh.name = _addNamePostfix(clonedOne.name)
        mesh.castShadow = clonedOne.castShadow
        mesh.receiveShadow = clonedOne.receiveShadow

        // disableAllVisibleLayer(mesh)
        disableAllPickableLayer(mesh)

        scene.add(mesh)

        let [indexMap, instancedMeshMap] = clonedOnes.reduce(([indexMap, instancedMeshMap], clonedOne, i) => {
            // _updateMatrix(mesh, i, clonedOne.matrixWorld)
            // // mesh.setColorAt(i, getColorFunc(clonedOne))
            // mesh.setColorAt(i, color)



            return [
                indexMap.set(clonedOne.name, i),
                instancedMeshMap.set(clonedOne.name, mesh)
            ]
        }, [Map<sourceMeshName, instanceIndex>(), Map<sourceMeshName, InstancedMesh2>()])

        state = setInstanceState(state, {
            ...getInstanceState(state),
            indexMap: indexMap,
            instancedMeshMap: instancedMeshMap as any,
            sourceMeshsMap: getInstanceState(state).sourceMeshsMap.set(mesh.name, clonedOnes as Array<Mesh>)
        })

        mesh.build(state)

        return [state, scene]
    }, invertedStructure)
}

export let convertToInstanceMesh = (state: state, scene, allSourceObjects: Array<Object3D>): [state, Object3D] => {
    allSourceObjects.forEach(object => {
        // object.updateMatrixWorld(true)
        // object.parent.updateMatrixWorld(true)

        object.updateWorldMatrix(true, false)

        markAllMeshesNotVisible(object)
        // enableAllToVisibleLayer(object)
        enableAllPickableLayer(object)
    })

    return _addInstanceMeshes(state, scene, invertStructure(allSourceObjects))
}

export let isInstancedMesh = (name) => {
    return name.includes(_getNamePostfix())
}

export let isInstanceSourceObject = (name, state: state) => {
    // return _getInstanceIdPostfixRegex().test(name)

    let { instancedMeshMap } = getInstanceState(state)

    return instancedMeshMap.has(name)
}

export let getInstanceId = (name) => {
    return [...name.matchAll(_getInstanceIdPostfixRegex())][0][1]
}

// let _findSourceMesh = (scene, instancedMeshName, id): nullable<Mesh> => {
//     let sourceName = addInstanceIdPostfix(restoreName(instancedMeshName), id)

//     return ensureCheck(
//         findObjectByName<Mesh>(scene, sourceName), (sourceMesh) => {
//             test("should be Mesh", () => {
//                 return getWithDefault(
//                     map(sourceMesh => sourceMesh.isMesh, sourceMesh),
//                     true
//                 )
//             })
//         }, true)
// }

let _isMatrixWorldNeedsUpdate = (object) => {
    if (object.matrixWorldNeedsUpdate) {
        return true
    }

    if (!isNullable(object.parent) && !isScene(object.parent)) {
        return _isMatrixWorldNeedsUpdate(getExn(object.parent))
    }

    return false
}

export let markNeedUpdateColor = (state: state, sourceMeshName: sourceMeshName, color: Color) => {
    return setInstanceState(state, {
        ...getInstanceState(state),
        needUpdateColorMap: getInstanceState(state).needUpdateColorMap.set(sourceMeshName, color)
    })
}

export let findAllSourceMeshs = (state: state, instancedMeshName: string) => {
    return getExn(getInstanceState(state).sourceMeshsMap.get(instancedMeshName))
}

export let findSourceMesh = (state: state, instancedMeshName: string, index: number) => {
    return findAllSourceMeshs(state, instancedMeshName)[index]
}

// export let init = (state: state) => {
//     let scene = getCurrentScene(state)

//     findObjects(scene, ({ name }) => isInstancedMesh(name))
//         .forEach((instancedMesh: InstancedMesh2) => {
//             instancedMesh.build(state)
//         })

//         return state
// }

// export let updateInstanceAllMatrices = (state: state, sourceMeshs: Array<Mesh>, instancedMesh: InstancedMesh) => {
// export let updateAllInstanceMatrices = (state: state) => {
export let updateAllInstances = (state: state) => {
    let scene = getCurrentScene(state)
    let needUpdateColorMap = getInstanceState(state).needUpdateColorMap
    let camera = getCurrentCamera(state)

    findObjects(scene, ({ name }) => isInstancedMesh(name))
        .forEach((instancedMesh: InstancedMesh2) => {
            findAllSourceMeshs(state, instancedMesh.name).forEach(sourceMesh => {
                if (_isMatrixWorldNeedsUpdate(sourceMesh)) {
                    sourceMesh.updateWorldMatrix(true, false)

                    // _updateMatrix(instancedMesh, getExn(
                    //     getInstanceState(state).indexMap.get(sourceMesh.name)
                    // ), sourceMesh.matrixWorld)
                    // instancedMesh.instanceMatrix.needsUpdate = true;

                    let index = getInstanceState(state).indexMap.get(sourceMesh.name)

                    // instancedMesh.instances[index].applyMatrix4(sourceMesh.matrixWorld)
                    // instancedMesh.instances[index].updateMatrix()

                    instancedMesh.instances[index].setMatrixWorld(sourceMesh.matrixWorld)
                }

                if (needUpdateColorMap.has(sourceMesh.name)) {
                    // instancedMesh.setColorAt(getInstanceState(state).indexMap.get(sourceMesh.name), getExn(needUpdateColorMap.get(sourceMesh.name)))

                    // instancedMesh.instanceColor.needsUpdate = true;


                    let index = getInstanceState(state).indexMap.get(sourceMesh.name)
                    instancedMesh.instances[index].setColor(getExn(needUpdateColorMap.get(sourceMesh.name)))
                }

                instancedMesh.updateCulling(state, camera)
            })
        })

    state = setInstanceState(state, {
        ...getInstanceState(state),
        needUpdateColorMap: Map()
    })

    // sourceMeshs.forEach(sourceMesh => {
    //     if (_isMatrixWorldNeedsUpdate(sourceMesh)) {
    //         _updateMatrix(instancedMesh,
    //             getExn(
    //                 getInstanceState(state).indexMap.get(sourceMesh.name)
    //             ), sourceMesh.matrixWorld)
    //         instancedMesh.instanceMatrix.needsUpdate = true;
    //     }
    // })

    return state
}

export let createState = (): instance => {
    return {
        indexMap: Map(),
        instancedMeshMap: Map(),
        sourceMeshsMap: Map(),
        sourceOriginScaleMap: Map(),
        needUpdateColorMap: Map()
    }
}

export let findInstance = (sourceMeshName, state: state) => {
    let { indexMap, instancedMeshMap } = getInstanceState(state)

    if (!isInstanceSourceObject(sourceMeshName, state)) {
        return null
    }

    return getExn(instancedMeshMap.get(sourceMeshName)).instances[getExn(indexMap.get(sourceMeshName))]
}

export let setVisible = (state: state, sourceObject: Object3D, visible): [state, Object3D] => {
    if (!visible) {
        state = setInstanceState(state, {
            ...getInstanceState(state),
            sourceOriginScaleMap: getInstanceState(state).sourceOriginScaleMap.set(sourceObject.name, sourceObject.scale.clone())
        })

        sourceObject.scale.set(0, 0, 0)
        sourceObject.matrixWorldNeedsUpdate = true
    }
    else {
        state = getWithDefault(
            map(sourceOriginScale => {
                sourceObject.scale.copy(sourceOriginScale)
                sourceObject.matrixWorldNeedsUpdate = true

                // return setInstanceState(state, {
                //     ...getInstanceState(state),
                //     sourceOriginScaleMap: getInstanceState(state).sourceOriginScaleMap.remove(sourceObject.name)
                // })

                return state
            }, getInstanceState(state).sourceOriginScaleMap.get(sourceObject.name)),
            state
        )
    }

    return [state, sourceObject]
}