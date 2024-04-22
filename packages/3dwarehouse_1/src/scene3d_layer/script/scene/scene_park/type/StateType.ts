import { nullable } from "meta3d-jiehuo-abstract/src/utils/nullable"
import type { WebGLRenderer, Object3D, Camera, Vector2, Raycaster, InstancedMesh, Scene } from "three"

export type parkScene = {
    scene: nullable<Object3D>,
    // camera: Camera,
}