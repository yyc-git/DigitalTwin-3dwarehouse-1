# three.js实现数字孪生3D仓库一期（开源）

大家好，本文使用three.js实现了3D仓库一期项目，给出了代码，分析了关键点，感谢大家~

关键词：数字孪生、three.js、Web3D、WebGL、智慧仓库、开源

代码：[Github](https://github.com/yyc-git/DigitalTwin-3dwarehouse-1)


我正在承接Web3D数字孪生项目，具体介绍可看[承接各种Web3D业务](https://www.cnblogs.com/chaogex/p/14090516.html)

加QQ群交流：106047770



[TOC]

## 需求描述

客户想要把两个仓库3D化，方便可视化地查看仓库的内容。未来可以进行搜索之类的操作

需要在PC端、平板、安卓手机、苹果手机的浏览器上运行

实际场景如下图所示：
仓库1有两排柜子：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422174217599-1381456807.png)
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422174222459-221926957.png)


    
第一排的柜子都是一样的，其中每个柜子有80个一样的抽屉：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422174226142-772357981.png)


第二排的每个柜子也是一样的，并且不需要显示柜子中的画


仓库2有一排柜子，每个柜子都是一样的：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422174407684-645354989.png)



一期的需求如下：  

- 1比1地还原场景
- 点击柜子的抽屉，可弹出抽屉，并显示绑定的数据




最终实现效果演示：

![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422175113814-1912542202.gif)



下面开始实现各个关键点，给出实现的思路：

## 建模

我们首先拿着卷尺、激光测距仪，到现场去测量，得到实际场景中的柜子大小、抽屉大小、间隙、仓库大小、柜子在仓库的位置等数据，我们要根据这些数据来1比1建模

现在对仓库1建模，首先要创建仓库：  
通过拼接多个立方体（BoxGeometry）来创建墙、门；  
通过PlaneGeometry来创建地面，设定它的材质的map来贴上瓷砖。值得注意的是瓷砖的大小要与实际场景一致，这是通过设置map的repeat来实现。瓷砖纹理可以从[这里](https://tietu.3d66.com/)获得  


建模后的仓库如下图所示：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422175407033-1836646450.png)



仓库由墙、地面、门组成


接着，我们对第一排的一个柜子建模：  
我们通过[CSG](https://github.com/samalexander/three-csg-ts)来构造柜体；  
因为客户对模型要求较高，所以不用CSG来构造抽屉，而是由美术来建模抽屉。值得注意的是要烘焙抽屉拉口中的阴影到贴图中。另外，本来还想把抽屉之间的AO（抽屉之间是黑色的）也烘焙到ao贴图或者normal贴图中，但美术始终没有做出来。另外，进行了简化处理，如抽屉上的两个标签就不需要显示；  
通过拼接圆柱体、立方体来创建柜子把手、柜子轨道

建模后的柜子如下图所示，其中抽屉是克隆的：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422175743733-1574273521.png)


第一排的其余柜子都是一样的，只是Transform不同


最后，我们对第二排的柜子建模：  
同样通过CSG来构造柜体；  
使用GridHelper来构造网格；  
同样通过拼接圆柱体、立方体来创建柜子把手、柜子轨道

建模后的柜子如下图所示：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422175829829-1185437595.png)


第二排的其余柜子都是一样的，只是Transform不同


最终，建模后的仓库1如下图所示：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422180018154-984788442.png)




仓库2的建模也是类似的，建模后如下图所示：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422180131950-1135715276.png)


## Instanced Draw

因为仓库1第一排柜子的抽屉数量较多（有1千多个），所以会造成drawcall过多（每个抽屉都是一个drawcall），这在移动端会有明显的性能问题

因为有抽屉动画（弹出抽屉），不能将其merge，所以使用Instanced Draw来批量绘制抽屉

值得注意的是抽屉可能是多材质的Object3D（虽然此处是单材质的Mesh），所以要将其中的每个Mesh拆分到一组Instanced Draw中。举例来说，如果抽屉有个3个材质（即3个子Mesh），则需要创建3个InstancedMesh，然后将所有抽屉的第一个材质的Mesh对应到第一个InstancedMesh中，其余的以此类推



## Label

每个柜子上面需要显示编号，如下图所示：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422180304923-1108677185.png)


它是billboard，通过Sprite来实现


<!-- 轨道相机 -->

## 实现人物

可以切换轨道相机和第三人称相机，后者会显示人物。如下图所示：

![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422180612459-1815691052.gif)


第三人称相机的实现请参考[Threejs 从零开始实现第三人称漫游](https://leezhian.com/web/base/threejs-third-person-control)

人物我们是在[这里](https://www.mixamo.com/#/)下载的，带骨骼动画的FBX

使用AnimationMixer来播放人物的骨骼动画，需要实现动画的管理

人物需要与仓库、柜子进行碰撞检测。我们使用Octree来构造场景的八叉树（只构造一次，构造墙、门、地面、柜体的八叉树，为了性能考虑这里排除掉抽屉），人物则用Capsule作为包围盒，通过检测Capsule和八叉树的相交来处理碰撞

## 弹出抽屉

双击仓库1的第一排的柜子，可以进入单个柜子的操作模式；然后点击任意的抽屉，可弹出该抽屉，显示绑定的数据。如下图所示：

![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422180737512-882034174.gif)


实现点击的原理是：  
我们将第一排的柜子的layer设置为可点击的，并通过Raycaster与该layer进行ray picking（这是优化，以免与其余的物体进行ray picking），并区分单击和双击

进入单个柜子的操作模式后，我们使用TrackControls、OrthographicCamera来正交地查看单个柜子，并隐藏其余的柜子

通过使用Tween来创建弹出、弹回抽屉的关键帧动画。点击单个抽屉时，播放弹出动画。弹出后显示绑定的数据（此处只显示了柜子编号和抽屉编号，以后可通过后端请求来获得相关的数据）


## UI

UI框架使用React+Redux

普通UI使用[Antd](https://ant.design/)

大屏UI使用[DataV-React](http://datav-react.jiaminghi.com/guide/)+[ECharts](https://echarts.apache.org/zh/index.html)



大屏UI如下图所示：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422180938183-1568703980.png)


“3D仓库-仓库1”这个Header、左侧的饼图是大屏UI



## 切换场景

能够切换仓库1、仓库2场景，如下图所示：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422180851233-1927676179.gif)


切换时，需要先深度删除当前场景的所有运行时数据（包括Mesh、Material、Geometry、Texture等），然后创建下一个场景的运行时数据

值得注意的是这两个场景的资源只需加载一次


## 适配

对于移动端需要进行适配

### 横屏

移动端需要横屏显示。我们检测如果是竖屏，则提示用户横屏

在微信中开启横屏的方法：  
1、我->通用->开启横屏模式  
2、开启手机的自动旋转  
3、将手机横屏  

### 第三人称在移动端显示虚拟摇杆

如下图所示：
![image](https://img2024.cnblogs.com/blog/419321/202404/419321-20240422181115099-1294822245.png)


通过[nipplejs](https://github.com/yoannmoinet/nipplejs)来实现虚拟摇杆


第三人称相机在移动端的使用说明：  
将左手拇指放到屏幕左方透明的操作杆上，右手拇指放到屏幕右方的任意位置。其中，左手控制人物移动，右手旋转屏幕视角

### IOS系统适配

IOS系统中值得注意的地方：

- 不应该动态插入/删除dom
- 构造octree太慢
- 纹理大小不能太大（不能>=4096*4096）



## 参考资料

[Web3D数字孪生有什么参考资料（最好有源码）？](https://www.zhihu.com/question/652447310/answer/3460460698)

[如何用webgl(three.js)搭建一个3D库房-第一课](https://www.cnblogs.com/yeyunfei/p/7899613.html)