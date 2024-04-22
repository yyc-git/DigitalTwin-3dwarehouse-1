import "./Box2.scss"
import React, { useEffect } from 'react';
import { Button, Layout, List, Typography } from 'antd';
import { BorderBox1 } from '@jiaminghi/data-view-react'
import * as echarts from 'echarts'

let Box2: React.FC = () => {
  useEffect(() => {
    const chartDom = document.getElementById('box2-main')
    const chart = echarts.init(chartDom)
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      // legend: {
      //   textStyle: {
      //     color: '#fff'
      //   }
      // },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        axisLabel: {
          textStyle: {
            color: '#fff' //坐标值得具体的颜色
          }
        }
      },
      yAxis: {
        type: 'category',
        data: ['广州', '上海', '北京', '成都', '天津', '重庆'],
        axisLabel: {
          textStyle: {
            color: '#fff' //坐标值得具体的颜色
          }
        }
      },
      series: [
        {
          name: '2011',
          type: 'bar',
          data: [18203, 23489, 29034, 104970, 131744, 630230]
        }
      ]
    }
    option && chart.setOption(option)

    window.addEventListener('resize', function() {
      chart.resize();
    });
  }, [])

    return (
        <Layout className="box-2">
            <BorderBox1>
                <div id="box2-main" style={{ width: '100%', height: '100%' }}></div>
            </BorderBox1>
        </Layout>
    );
};

export default Box2;