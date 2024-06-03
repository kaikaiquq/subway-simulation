
<template>
  <div id="cesiumContainer" style="width: 100%; height: 100%"></div>
</template>

<script>
import * as Cesium from 'cesium'

export default {
  mounted() {
    this.initCesium()
  },
  methods: {
    initCesium() {
      // 创建 Cesium Viewer
      const viewer = new Cesium.Viewer('cesiumContainer',{
        imageryProvider : new Cesium.WebMapTileServiceImageryProvider({
          url : 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS',
          layer: 'World_Imagery',
          style: 'default',
          format: 'image/jpeg',
          tileMatrixSetID: 'GoogleMapsCompatible',
          maximumLevel: 19,
          credit: new Cesium.Credit('© Esri', 'https://www.esri.com/')
        }),
        //UI控制
        baseLayerPicker: false, //右上角的图层选择按钮
        animation: true,       //左下角的动画仪表盘
        infoBox: false,         //点击要素之后显示的信息
        geocoder: false,        //搜索框
        homeButton:false,       //home按钮
        sceneModePicker:false,  //模式切换按钮
        timeline: true,         //底部的时间轴
        fullscreenButton: false,//右下角的全屏按钮
        shouldAnimate: true,
        navigationHelpButton: false, //右上角的帮助按钮，
        // terrainProvider: new Cesium.createWorldTerrain({
        //   requestWaterMask: true,
        //   requestVertexNormals: true
        // }),
      });

      const initialPosition = {
        destination: Cesium.Cartesian3.fromDegrees(121.47246291959163,31.153607134417324,11892.670484329397),
        orientation: {
          pitch: Cesium.Math.toRadians(-59.96109178862484),
          roll: Cesium.Math.toRadians(2.646221494977646),
          heading: Cesium.Math.toRadians(359.7035121964927)
        }
      }
      viewer.scene.camera.setView(initialPosition);

      // 加载 GeoJSON 数据
      const dataSource = Cesium.GeoJsonDataSource.load('http://localhost:8080/static/subway_line16.geojson')
      viewer.dataSources.add(dataSource)

      dataSource.then((dataSource) => {
        const entities = dataSource.entities.values

        // 创建小车模型
        const carEntity = viewer.entities.add({
          position: entities[0].position.getValue(),
          model: {
            uri: 'http://localhost:8080/static/SampleData/models/CesiumMilkTruck/CesiumMilkTruck.glb',
            minimumPixelSize: 64
          }
        })

        // 获取 GeoJSON 的 LineString 数据
        const lineString = entities[0].polyline.positions.getValue()
        const cartographicPositions = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(lineString)

        // 开始小车的运动
        let currentIndex = 0
        let heading = 0

        const moveCar = () => {
          if (currentIndex < cartographicPositions.length) {
            const currentPos = cartographicPositions[currentIndex]
            const nextPos = cartographicPositions[currentIndex + 1]

            // 计算小车的朝向角度
            if (Cesium.defined(nextPos)) {
              heading = Cesium.Math.toDegrees(Cesium.Cartographic.heading(currentPos, nextPos))
              carEntity.orientation = Cesium.Transforms.headingPitchRollQuaternion(currentPos, new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(heading), 0, 0))
            }

            // 移动小车
            carEntity.position = Cesium.Cartesian3.fromDegrees(currentPos.longitude, currentPos.latitude)

            currentIndex++
          } else {
            // 小车到达终点，停止动画
            cancelAnimationFrame(animationFrameId)
          }

          // 循环调用 moveCar 函数
          animationFrameId = requestAnimationFrame(moveCar)
        }

        // 开始第一次移动
        let animationFrameId = requestAnimationFrame(moveCar)
      })
    }
  }
}
</script>

<style>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
