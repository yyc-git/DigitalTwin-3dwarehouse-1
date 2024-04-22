import "./Park.scss"
import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
// import Box1 from "../box1/components/Box1";
import Header from "../../header/components/Header";
import { debounce, setFontSize } from "../../../utils/BigScreenUtils";
// import Box2 from "../box2/components/Box2";

let Park: React.FC = () => {
    // let [state, setState] = useState({ scale: 1 })
    // let [isSetFontSize, setIsSetFontSize] = useState(false)

    // // useEffect(() => {
    // //     setState({
    // //         scale: scale()
    // //     })

    // //     window.onresize = function () {
    // //         setState({
    // //             scale: scale()
    // //         })
    // //     }

    // //     return () => {
    // //         // 清除
    // //         window.onresize = null
    // //     }
    // // }, [])
    // useEffect(() => {
    //     const cancalDebounce = debounce(setFontSize, 100)

    //     window.addEventListener('resize', cancalDebounce)

    //     setFontSize()

    //     /*! make datav-react -> 装饰 auto resize
    //     * 
    //     */
    //     setIsSetFontSize(_ => true)

    //     return () => {
    //         // 移除
    //         window.removeEventListener('resize', cancalDebounce)
    //     }
    // }, [])


    return (
        <Layout className="park"
        // style={{
        //     transform: `scale(${state.scale}) translate(-50%,-50%)`
        // }}
        >

            <Header description="3D仓库-园区" />
            {/* <Layout.Header> */}
            {/* </Layout.Header> */}
            {/* <Layout.Panel> */}
            {/* <Box1 />
            <Box2 /> */}
        </Layout >
    );
};

export default Park;