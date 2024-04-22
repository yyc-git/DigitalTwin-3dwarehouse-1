import type { Mesh, Object3D } from "three"

export let isEqualByName = (obj1:Object3D, obj2:Object3D) => {
    return obj1.name == obj2.name
}

export let markAllMeshesNotVisible = (object: Object3D) => {
    if ((object as Mesh).isMesh) {
        // throw new Error("shouldn't be Mesh")

        object.visible = false
    }

    object.traverse(child => {
        if ((child as Mesh).isMesh) {
            child.visible = false
        }
    })
}

export let markAllMeshesVisible = (object: Object3D) => {
    if ((object as Mesh).isMesh) {
        throw new Error("shouldn't be Mesh")
    }

    object.traverse(child => {
        if ((child as Mesh).isMesh) {
            child.visible = true
        }
    })
}