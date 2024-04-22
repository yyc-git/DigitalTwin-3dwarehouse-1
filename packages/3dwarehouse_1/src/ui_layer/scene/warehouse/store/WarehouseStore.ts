import { createSlice } from '@reduxjs/toolkit'
import { store } from './WarehouseStoreType'
import { mode } from '../../../../scene3d_layer/script/scene/scene_warehouse/type/StateType'

let WarehouseSlice = createSlice<store, any, any, any, any>({
  // let WarehouseSlice = createSlice({
  name: 'Warehouse',
  initialState: {
    mode: mode.Default,
    cabinetDrawerAnimationIsPlaying: false,
    // isShowModal: false,
    currentSceneIndex: 1
  },
  reducers: {
    setMode: (state: store, data) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.

      let mode = data.payload

      state.mode = mode
    },
    setCabinetDrawerAnimationIsPlaying: (state: store, data) => {
      let isPlaying = data.payload

      state.cabinetDrawerAnimationIsPlaying = isPlaying
    },
    // setIsShowModal: (state: store, data) => {
    //   let isShowModal = data.payload

    //   state.isShowModal = isShowModal
    // },
    setCurrentSceneIndex: (state: store, data) => {
      let currentSceneIndex = data.payload

      state.currentSceneIndex = currentSceneIndex
    },
  },
  selectors: {

  }
})

// Action creators are generated for each case reducer function
export let { setMode, setCabinetDrawerAnimationIsPlaying,  setCurrentSceneIndex }: any = WarehouseSlice.actions

export default WarehouseSlice.reducer

// export type WarehouseState = ReturnType<typeof WarehouseSlice.getInitialState>
// export type WarehouseDispatch = typeof WarehouseSlice.