import { createSlice } from '@reduxjs/toolkit'
import { store } from './SceneStoreType'

let SceneSlice = createSlice<store, any, any, any, any>({
    name: 'Scene',
    initialState: {
    },
    reducers: {
    },
    selectors: {
    }
})

// Action creators are generated for each case reducer function
export let { }: any = SceneSlice.actions

export default SceneSlice.reducer