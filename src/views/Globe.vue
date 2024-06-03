<!--
 * @FilePath: \iclient\src\views\Globe.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <div id="cesiumContainer" class="container"></div>
<!--    <div class="select">-->
<!--      <el-select v-model="value" placeholder="Select" @change="initCZMLModel">-->
<!--        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"-->
<!--                   :disabled="item.disabled" />-->
<!--      </el-select>-->
<!--    </div>-->
    <div class="getCameraRange">
      <el-button type="primary" @click="getCameraAngleOfView()">相机角度</el-button>
    </div>
    <div class="startUp">
      <el-button type="primary" @click="uploadBasicLayer()">加载所有线路</el-button>
    </div>
    <div class="choseLayer">
      <el-select class="loadSelect"  v-model="value" clearable filterable placeholder="请选择加载数据" @change="uploadLayer">
        <el-option
            v-for="item in geoList"
            :key="item"
            :label="item"
            :value="item">
        </el-option>
      </el-select>
    </div>
    <div class="choseToRemove">
      <el-select class="removeSelect" v-model="value2" clearable filterable placeholder="请选择移除数据" @change="removeLoaded">
        <el-option
            v-for="item1 in loadedList"
            :key="item1"
            :label="item1"
            :value="item1">
        </el-option>
      </el-select>
    </div>
    <div class="closeRailway">
      <el-button type="primary" @click="removeAllLoaded()">去除所有线路</el-button>
    </div>
    <div class="loadTrain">
      <el-button type="primary" @click="loadTrain()">加载3D模型</el-button>
    </div>
    <div class="loadTrain-1">
      <el-button type="primary" @click="firstPerspective()">切换视角</el-button>
    </div>
    <div class="setRailLine">
      <el-button type="primary" @click="getAllChild()">加载16号线</el-button>
    </div>
    <div class="getCoorVal" v-show="getCoor.show">
      <button class="close_button" @click="closeCoor()">关闭</button>
      <textarea  class="area-coor" v-model="getCoor.pathCoor"></textarea>
    </div>
    <div class="getRailGeo" v-show="showGeoInfoFlag">
      <button class="close_button" @click="closeGeo()">关闭</button>
      <textarea  class="rail_name" v-model="geoInfo.name"></textarea>
      <textarea  class="rail_coor" v-model="geoInfo.coordinates"></textarea>
    </div>
  </div>
</template>
<script>

import axios from "axios";
import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
import { test,getLineGeoInfo,setRailGeo,getAllRoute,getAllChild } from '@/api/ourRequest';
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

let viewer = null;
Vue.use(ElementUI);



export default {
  name: "cesiumPage",
  data: function () {
    return {
      value:null,
      value2:null,
      options:[],
      geoList:[
          "shanghai_subway_lines",
          "shanghai_subway_points",
          "subway_crossover",
          "subway_siding",
          "subway_stop_station",
          "subway_yard",
          "subway_line1",
          "subway_line2",
          "subway_line3",
          "subway_line4",
          "subway_line5",
          "subway_line6",
          "subway_line7",
          "subway_line8",
          "subway_line9",
          "subway_line10",
          "subway_line11",
          "subway_line12",
          "subway_line13",
          "subway_line14",
          "subway_line15",
          "subway_line16",
          "subway_line17",
          "subway_line18",
          "test",
          "stops_16",
          "line16_all",
          "line16_down_final",
      ],
      allRoutes:[],
      getCoor: {
        show: false,
        pathCoor: ""
      },
      loadedList: [],
      showGeoInfoFlag:false,
      geoInfo:{
        name:"",
        coordinates:[],
      },
      entity:null,
      positionProperty:null,
      choseLineJSON:null,
      routeGeoData:null,
      lineTotalLength:0,
      lineTotalLengthMap:{},
      LengthListL:[],
      startTime:'2018-07-19T15:18:00Z',
      timeCost:600,
      distanceCount:0,
      timeCount:0,
      czmlJSONList:[],
      subwayJSONList:[],
      dateList:[],
      trainSpeedList: [],
      speedLabelEntity: null
    };
  },


  mounted() {
    this.init();
    this.setCamera();
    this.handleClick();
    // this.getAllRoute();
    // this.test();
  },


  methods: {

    init() {
      this.cesiumContainer = document.getElementById("cesiumContainer");
      viewer = new Cesium.Viewer("cesiumContainer", {
        // imageryProvider : new Cesium.UrlTemplateImageryProvider({
        //   url : 'http://localhost:8081/static/tiles/{z}/{x}/{y}.png',
        //   fileExtension: "png",
        //   maximumLevel: 16,
        // }),

      //   tdtWebMapTile :new Cesium.WebMapTileServiceImageryProvider({
      //   url : 'http://t0.tianditu.gov.cn/img_w/wmts?tk=ebf64362215c081f8317203220f133eb',
      //   layer: 'img',
      //   style: 'default',
      //   format: 'tiles',
      //   tileMatrixSetID: 'w',
      //   maximumLevel: 18,
      //   credit: new Cesium.Credit('© Tianditu', 'http://www.tianditu.gov.cn/')
      // }),

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
        selectionIndicator: true,
        // terrainProvider: new Cesium.createWorldTerrain({
        //   requestWaterMask: true,
        //   requestVertexNormals: true
        // }),
      });
      viewer.cesiumWidget.creditContainer.style.display = "none";
      //设定起始时间
      let start = Cesium.JulianDate.fromIso8601('2024-01-01');
      //设定终止时间
      let end = Cesium.JulianDate.fromIso8601('2024-04-30');
      viewer.timeline.zoomTo(start,end);
      //定义clock事件
      let clock = viewer.clock;
      //设定clock的起始时间
      clock.startTime = start;
      //设定clock的终止时间
      clock.endTime = end;
      //设定clock的当前时间
      clock.currentTime.start;
      //设定clock范围为不断循环
      clock.clockRange=Cesium.ClockRange.LOOP_STOP;
      //设定时间速率
      clock.multiplier=10;
    },

    // load() {
    //   this.addLockedS3MLayer();
    // },
    //
    // // 加载三维倾斜数据
    // addLockedS3MLayer() {
    //   Viewer.scene
    //     .addS3MTilesLayerByScp(
    //       "http://localhost:8081/RS1517052003572781057US1517407037657452546/rest/realspace/config",
    //       { name: "lockedS3M", cullEnabled: true }
    //     )
    //     .then((layerInfo) => {
    //       Viewer.camera.setView({
    //         destination: Cesium.Cartesian3.fromDegrees(
    //           layerInfo.lon,
    //           layerInfo.lat,
    //           50000
    //         ),
    //       });
    //     });
    // },


    setOptions(){
      const _this=this;
      _this.options=[];
      for(var i=0;i<_this.geoList.length;i++){
        let option={};
        option.label=_this.geoList[i].toString();
        option.value=i;
        _this.options.push(option);
      }
      console.log('options',_this.options)
    },


    getCameraAngleOfView(){
      this.getCoor.show=false
      this.getCoor.pathCoor=""
      let heading = Cesium.Math.toDegrees(viewer.camera.heading)
      let pitch = Cesium.Math.toDegrees(viewer.camera.pitch)
      let roll = Cesium.Math.toDegrees(viewer.camera.roll)
      let position = viewer.camera.position
      const ellipsoid = viewer.scene.globe.ellipsoid
      const cartographic = ellipsoid.cartesianToCartographic(position)
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude)
      const height = cartographic.height
      //console.log(`heading: ${heading}, pitch: ${pitch}, roll: ${roll}, longitude: ${longitude}, latitude: ${latitude}, height:${height}`)
      this.getCoor.pathCoor=longitude+","+latitude+","+height +"\n" +pitch+","+roll+","+heading
      console.log("相机角度",this.getCoor)
      this.getCoor.show=true
    },

    closeCoor(){
      this.getCoor.show=false;
    },


    //设置初始相机角度
    setCamera(){
      const initialPosition = {
        destination: Cesium.Cartesian3.fromDegrees(121.50227788345072,30.352303576954238,65398.51479749985),
        orientation: {
          pitch: Cesium.Math.toRadians(-40.504317799863344),
          roll: Cesium.Math.toRadians(0.01132055026138144),
          heading: Cesium.Math.toRadians(356.0322551414672)
        }
      }
      viewer.scene.camera.setView(initialPosition)
    },


    //加载基础地铁线路底图
    uploadBasicLayer(){
      this.uploadFileGEOJSON('shanghai_subway_lines');
      this.uploadFileGEOJSON('subway_yard');
      this.uploadFileGEOJSON('subway_siding');
      this.uploadFileGEOJSON('subway_crossover');
      this.uploadFileGEOJSON('subway_stop_station');
    },

    //加载静态资源文件
    async uploadLayer(key){
      console.log('layerName',key)
      await this.uploadFileGEOJSON(key);

    },


    removeAllLoaded(){
      // if(this.loadedList.length>0){
      //   for(const loaded of this.loadedList){
      //     console.log('loaded:::::::::::::::::::::::::::',loaded)
      //     const item = viewer.dataSources.getByName( loaded)
      //     if (item) {
      //       viewer.dataSources.remove(item[0], true)
      //     }
      //   }
      // }
      viewer.dataSources.removeAll();
      this.choseLineJSON={};
      this.loadedList=[];
    },


     uploadEachPointFromGEOJSON (layerName) {
      const url = `static/${layerName}.geojson`;
      // 使用axios获取GeoJSON文件
      axios.get(url,{
        timeout:10000
      }).then((response) => {
        const geojsonData = response.data;
        let coordinates=geojsonData.features[0].geometry.coordinates;
        console.log('coordinates',coordinates);
        coordinates.forEach(line => {
          line.forEach(point => {
            const [longitude, latitude, height = 0] = point;
            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
              point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
              }
            });
          });
        });
      }).catch((error) => {
        console.error('Error fetching GEOJSON file:', error);
      });
    },



    uploadFileGEOJSON(layerName){
      const _this=this;
      _this.choseLineJSON={};
      let layerFileName=layerName+'.geojson'
      axios.get('static/' + layerFileName,{
        timeout:10000
      }).then(async res => {
        const geoJsonDataSource = new Cesium.GeoJsonDataSource(layerName)
        _this.choseLineJSON=res.data;
        geoJsonDataSource.load(res.data, {
          stroke: Cesium.Color.fromCssColorString('red'),
          strokeWidth: 2,
          clampToGround: true
        }).then(datasource => {
          viewer.dataSources.add(datasource);
          const entities = datasource.entities.values
          entities.forEach(entity => {
            entity.description = 'layer'
            console.log('单条entity===》》》', entity)
            // 点=============================================================================================
            if (Cesium.defined(entity.billboard)) {
              const stopName = entity.name;
              console.log('stopName', stopName);
              entity.billboard.image._value = 'static/layerIcon/stop_icon.png'

              entity.billboard.width = 10;
              entity.billboard.height = 10;

              entity.billboard.scaleByDistance = new Cesium.NearFarScalar(1000, 1.0, 5000000, 0.2);
            }
            else if (Cesium.defined(entity.polyline)) {

              var lineName=entity.name;
              var positions = entity.polyline.positions.getValue();
              var totalDistance = 0;
              for (var j = 0; j < positions.length - 1; j++) {
                var distance =_this.distanceCal(positions[j], positions[j + 1]);
                totalDistance += distance;
              }
              _this.lineTotalLengthMap[lineName]=totalDistance;
            }
            // 面=============================================================================================
            // if (Cesium.defined(entity.polygon)) {
            //       entity.label = {
            //         text: entity.name,
            //         fillColor: Cesium.Color.fromCssColorString('#FFFFFF'),
            //         font: '32px Helvetica',
            //         showBackground: true,
            //         scale: 0.5,
            //         horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            //         verticalOrigin: Cesium.VerticalOrigin.CENTER,
            //         backgroundColor: Cesium.Color.fromCssColorString('#154e30').withAlpha(0.8), // 背景颜色
            //         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            //         pixelOffset: new Cesium.Cartesian2(0, -10),
            //         distanceDisplayCondition: clickData.layerCanClick ? new Cesium.DistanceDisplayCondition(16, 512000) : new Cesium.DistanceDisplayCondition(16, showDistance),
            //         scaleByDistance: new Cesium.NearFarScalar(16, 3.0, showDistance, 0.8)
            //       }
            //     }
            // }
          })
          // _this.$_viewer.flyTo(datasource)
        })
        })
      this.loadedList.push(layerName);
    },


    uploadPoint(geoData){
      const _this=this;
      const layerName=geoData.geometry.coordinates;
      const geoJsonDataSource = new Cesium.GeoJsonDataSource(layerName);
      geoJsonDataSource.load(geoData, {
        stroke: Cesium.Color.fromCssColorString('red'),
        strokeWidth: 2,
        clampToGround: true
        }).then(datasource => {
          viewer.dataSources.add(datasource);
          const entities = datasource.entities.values
          entities.forEach(entity => {
            entity.description = 'layer'
            if (Cesium.defined(entity.billboard)) {
              entity.billboard.image._value = 'static/layerIcon/point_icon.png'
              entity.billboard.width = 5
              entity.billboard.height = 5
            }else if(Cesium.defined(entity.polyline)){

              var lineName=entity.name;
              var positions = entity.polyline.positions.getValue();
              var totalDistance = 0;
              for (var j = 0; j < positions.length - 1; j++) {
                var distance =_this.distanceCal(positions[j], positions[j + 1]);
                totalDistance += distance;
              }
              _this.lineTotalLengthMap[lineName]=totalDistance;
            }
          })
        })
      this.loadedList.push(layerName);
    },

    uploadGeoData(geoData){
      const _this=this;
      const layerName=geoData.properties.name;
      const geoJsonDataSource = new Cesium.GeoJsonDataSource(layerName);
      geoJsonDataSource.load(geoData, {
        stroke: Cesium.Color.fromCssColorString('red'),
        strokeWidth: 2,
        clampToGround: true
      }).then(datasource => {
        viewer.dataSources.add(datasource);
        const entities = datasource.entities.values
        entities.forEach(entity => {
          entity.description = 'layer'
          if (Cesium.defined(entity.polyline)) {
            var lineName=entity.name;
            var positions = entity.polyline.positions.getValue();
            var totalDistance = 0;
            for (var j = 0; j < positions.length - 1; j++) {
              var distance =_this.distanceCal(positions[j], positions[j + 1]);
              totalDistance += distance;
            }
            _this.lineTotalLengthMap[lineName]=totalDistance;
          }else if(Cesium.defined(entity.billboard)){
            entity.billboard.image._value = 'static/layerIcon/stop_icon.png'
            entity.billboard.width = 5
            entity.billboard.height = 5
          }
        })
      })
      this.loadedList.push(layerName);
    },


    closeGeo(){
      this.showGeoInfoFlag=false;
      this.geoInfo.name="";
      this.geoInfo.coordinates=[];
    },


    async getAllChild() {
      const _this = this;
      var res = await getAllChild('016');
      var geoData = res.data;
      var features=geoData.features;
      features.forEach(feature =>{
        _this.uploadGeoData(feature);
      })
    },


    async setRailLine () {
      const _this = this;
      var res = await setRailGeo('001');
      var geoData = res.data;
      var features=geoData.features;
      this.choseLineJSON=features;
      console.log('choseLineJSON',this.choseLineJSON);
    },


    handleClick(){
      const _this=this;
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (event) {
        let pick = viewer.scene.pick(event.position);
        if (Cesium.defined(pick)) {
          console.log('pick',pick)
          var name=pick.id._name;
          if(Cesium.defined(pick.id.position)){
            console.log('name:---',name);
            var position =pick.id._position._value;
            console.log('position_before:--',position);
            var cartographic = Cesium.Cartographic.fromCartesian(position);

            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height;
            console.log('position:---',longitude, latitude, height)
            var coorList=[];
            coorList.push(longitude);
            coorList.push(latitude);
            // coorList.push(height);
            _this.geoInfo.name=name;
            _this.geoInfo.coordinates=coorList;
            _this.showGeoInfoFlag=true;
            console.log('geoInfo',_this.geoInfo);
          }else if(Cesium.defined(pick.id.polyline)){
            var polyline = pick.id.polyline;
            polyline.material = Cesium.Color.GREEN;
            var positions = pick.id.polyline.positions.getValue();
            var newPositions = [];
            for (var i = 0; i < positions.length; i++) {
              var cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
              var longitude = Cesium.Math.toDegrees(cartographic.longitude);
              var latitude = Cesium.Math.toDegrees(cartographic.latitude);
              var altitude = cartographic.height;
              var point =[longitude, latitude];
              var pointGeo =turf.point(point);
              console.log('point',pointGeo);
              _this.uploadPoint(pointGeo);
              newPositions.push([longitude, latitude]);
            }
            var lineGeoJson = turf.lineString(newPositions);
            var coorList=lineGeoJson.geometry.coordinates;
            _this.geoInfo.name=name;
            _this.geoInfo.coordinates=coorList;
            _this.showGeoInfoFlag=true;
            console.log('geoInfo',_this.geoInfo);
          }
        }else {
          const start_point = viewer.scene.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid)
          let cartographic = Cesium.Cartographic.fromCartesian(start_point, viewer.scene.globe.ellipsoid, new Cesium.Cartographic())
          let lng = Cesium.Math.toDegrees(cartographic.longitude)
          let lat = Cesium.Math.toDegrees(cartographic.latitude)
          let pointList=[lng,lat];
          _this.geoInfo.name='鼠标拾取位置经纬度';
          _this.geoInfo.coordinates=pointList;
          _this.showGeoInfoFlag=true;
          console.log('geoInfo',_this.geoInfo);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },


    removeLoaded(layerName){
      const item = viewer.dataSources.getByName(layerName)
      if (item) {
        viewer.dataSources.remove(item[0], true)
      }
      const loadedModified=[];
      for (const each of this.loadedList){
        if(each !==layerName){
          loadedModified.push(each)
        }
      }
      this.loadedList=loadedModified;
      console.log('删除后的loadedList',this.loadedList)
    },



    firstPerspective(){
      if(Cesium.defined(viewer.trackedEntity)){
        viewer.trackedEntity = null;
      }else{
        viewer.trackedEntity = this.entity;
      }
    },



    async loadTrain(){
      await this.loadCzmlJSON();
      this.subwayJSONList.push(this.choseLineJSON);
      this.subwayJSONList.push(this.choseLineJSON);
      this.subwayJSONList.push(this.choseLineJSON);
      this.subwayJSONList.push(this.calculatePositionsBackward(this.choseLineJSON,3));
      console.log('subwayJSONList',this.subwayJSONList)
      this.calLength(this.subwayJSONList[3]);
      await this.initCZMLModel(2);
      // await this.loadTrainBody(3);
      // await this.initCZMLModel(3);
      // this.addTrainAndLabel();
    },

    calLength(JSON){
      const _this=this;
      for(var i=0;i<JSON.features.length;i++){
        const feature=JSON.features[i];
        var totalDistance = 0;
        for(var j=0;j<feature.geometry.coordinates.length-1;j++){
          const point =feature.geometry.coordinates[j];
          const point_next=feature.geometry.coordinates[j+1];
          const point1=Cesium.Cartesian3.fromDegrees(point[0],point[1])
          const point2=Cesium.Cartesian3.fromDegrees(point_next[0],point_next[1])
          var distance =_this.distanceCal(point1, point2);
          totalDistance += distance;
        }
        _this.lineTotalLengthMap[feature.properties.name]=totalDistance;
      }
    },




    async loadCzmlJSON(){
      let czmlJSON = null;
      await axios.get('static/SampleData/ClampToGround.czml',{
            timeout:10000
          }
      )
          .then(response => {
            czmlJSON = response.data;
          })
          .catch(error => {
            console.log(error)
          })
      console.log('czmlJSON',czmlJSON)
      this.czmlJSONList.push(czmlJSON);
      this.czmlJSONList.push(czmlJSON);
      this.czmlJSONList.push(czmlJSON);
      this.czmlJSONList.push(czmlJSON);
      this.czmlJSONList.push(czmlJSON);
      this.czmlJSONList.push(czmlJSON);
    },



    /**
     *
     */
    initCZMLModel: async function (id) {
      const _this = this;
      let czmlJSON = this.czmlJSONList[id];

      const cartesianXYZList = []
      const cartesianDateXYZList = []
      const unitQuaternionList = []
      let date_start=null;
      let date=null;
      const routeJSON=_this.subwayJSONList[id];
      console.log('routeJSON',routeJSON);

      for (let k = 0; k < routeJSON.features.length; k++){
        let lat_lon_height_list = [];
        let feature = routeJSON.features[k];
        // console.log('each-feature',feature);
        _this.lineTotalLength=_this.lineTotalLengthMap[feature.properties.name];

        _this.startTime=feature.properties.start_time;
        _this.timeCost=feature.properties.time_cost;
        for (let i = 0; i < feature.geometry.coordinates.length; i++) {
          let subCouple = feature.geometry.coordinates[i]
          lat_lon_height_list.push(subCouple[0])  // lat
          lat_lon_height_list.push(subCouple[1])  // lon
          lat_lon_height_list.push(0)  // height
        }

        const positions = Cesium.Cartesian3.fromDegreesArrayHeights(lat_lon_height_list)
        console.log('positions',positions)

        if(k===0){
          date_start = new Date(_this.startTime);
        }
        date = new Date(_this.startTime);

        let dates=[];
        if(id!==2){
          dates=_this.dateList[k]
        }
        let lastPointQuaternion=[];
        for (let i = 0; i < positions.length; i++) {

          if(id===2){
            const tempDate=date.getTime();
            dates[i] = new Date(tempDate);
          }
          let cartesianPoint = positions[i]
          cartesianXYZList.push(cartesianPoint.x)
          cartesianXYZList.push(cartesianPoint.y)
          cartesianXYZList.push(cartesianPoint.z)

          if(id===2){
            cartesianDateXYZList.push(date.toISOString())
          }else {
            cartesianDateXYZList.push(dates[i].toISOString())
          }

          cartesianDateXYZList.push(cartesianPoint.x)
          cartesianDateXYZList.push(cartesianPoint.y)
          cartesianDateXYZList.push(cartesianPoint.z)
          let modelQuaternionList=null;
          if (i < positions.length - 1) {
            let timeCostToNextPoint = _this.computeTimeCost(positions[i], positions[i + 1]);
            // console.log('timeCostToNextPoint',timeCostToNextPoint);
            if(id===2){
              let currentTimeISOString = date.toISOString()
              date.setSeconds(date.getSeconds() + timeCostToNextPoint)
              unitQuaternionList.push(currentTimeISOString)
            }else{
              unitQuaternionList.push(dates[i].toISOString());
            }

            let cartesianPointNext = positions[i + 1]
            modelQuaternionList = _this.computeModelQuaternion(cartesianPoint, cartesianPointNext)
            // console.log('modelQuaternionList',modelQuaternionList)
            unitQuaternionList.push(modelQuaternionList[0])
            unitQuaternionList.push(modelQuaternionList[1])
            unitQuaternionList.push(modelQuaternionList[2])
            unitQuaternionList.push(modelQuaternionList[3])

            lastPointQuaternion=modelQuaternionList;

          }else {

            if(id===2){
              unitQuaternionList.push(date.toISOString())
            }else {
              unitQuaternionList.push(dates[i].toISOString())
            }
            unitQuaternionList.push(lastPointQuaternion[0])
            unitQuaternionList.push(lastPointQuaternion[1])
            unitQuaternionList.push(lastPointQuaternion[2])
            unitQuaternionList.push(lastPointQuaternion[3])
          }
        }
        if(id===2){
          _this.dateList[k]=(dates);
        }
      }

      czmlJSON[2].polyline.positions.cartesian = cartesianXYZList
      // czmlJSON[2].polyline.material=null
      czmlJSON[1].position.cartesian = cartesianDateXYZList
      czmlJSON[1].model.gltf = ("static/SampleData/models/subway/subway_all.glb")
      czmlJSON[1].orientation.unitQuaternion = unitQuaternionList
      czmlJSON[1].orientation.interpolationAlgorithm = "LINEAR"
      czmlJSON[1].orientation.interpolationDegree = 1
      czmlJSON[1].id="subway"+id
      czmlJSON[0].clock.currentTime = date_start.toISOString()
      czmlJSON[0].clock.interval = date_start.toISOString() + "/" + date.toISOString()
      console.log('czmlJSON_updated',czmlJSON);

      const loadName="subway"+id;
      const dataSourcePromise = new Cesium.CzmlDataSource(loadName);
      dataSourcePromise.load(
          czmlJSON
      );
      viewer.dataSources.add(dataSourcePromise).then(function (dataSource) {
        if(id===2){
          _this.entity = dataSource.entities.getById("subway2");
          viewer._selectedEntity = _this.entity;
          _this.positionProperty = _this.entity.position;
        }
        _this.loadedList.push(loadName);
      }).catch(e => {
        console.log(e)
      });
    },



    /**
     *
     */
    loadTrainBody: async function (id) {
      const _this = this;
      let czmlJSON = this.czmlJSONList[id];

      const cartesianXYZList = []
      const cartesianDateXYZList = []
      const unitQuaternionList = []
      let date_start=null;
      let date=null;
      const routeJSON=_this.subwayJSONList[id];
      console.log('routeJSON',routeJSON);

      for (let k = 0; k < routeJSON.features.length; k++){
        let lat_lon_height_list = [];
        let feature = routeJSON.features[k];
        // console.log('each-feature',feature);
        _this.lineTotalLength=_this.lineTotalLengthMap[feature.properties.name];

        _this.startTime=feature.properties.start_time;
        _this.timeCost=feature.properties.time_cost;
        for (let i = 0; i < feature.geometry.coordinates.length; i++) {
          let subCouple = feature.geometry.coordinates[i]
          lat_lon_height_list.push(subCouple[0])  // lat
          lat_lon_height_list.push(subCouple[1])  // lon
          lat_lon_height_list.push(0)  // height
        }

        const positions = Cesium.Cartesian3.fromDegreesArrayHeights(lat_lon_height_list)

        if(k===0){
          date_start = new Date(_this.startTime);
        }
        date = new Date(_this.startTime);

        let dates=[];
        dates=_this.dateList[k]
        let lastPointQuaternion=[];
        for (let i = 0; i < positions.length; i++) {
          let cartesianPoint = positions[i]
          cartesianXYZList.push(cartesianPoint.x)
          cartesianXYZList.push(cartesianPoint.y)
          cartesianXYZList.push(cartesianPoint.z)
          cartesianDateXYZList.push(dates[i].toISOString())

          cartesianDateXYZList.push(cartesianPoint.x)
          cartesianDateXYZList.push(cartesianPoint.y)
          cartesianDateXYZList.push(cartesianPoint.z)
          let modelQuaternionList=null;
          if (i < positions.length - 1) {
            unitQuaternionList.push(dates[i].toISOString());
            let cartesianPointNext = positions[i + 1]
            modelQuaternionList = _this.computeModelQuaternion(cartesianPoint, cartesianPointNext)
            // console.log('modelQuaternionList',modelQuaternionList)
            unitQuaternionList.push(modelQuaternionList[0])
            unitQuaternionList.push(modelQuaternionList[1])
            unitQuaternionList.push(modelQuaternionList[2])
            unitQuaternionList.push(modelQuaternionList[3])
            lastPointQuaternion=modelQuaternionList;
          }else {
            unitQuaternionList.push(dates[i].toISOString())
            unitQuaternionList.push(lastPointQuaternion[0])
            unitQuaternionList.push(lastPointQuaternion[1])
            unitQuaternionList.push(lastPointQuaternion[2])
            unitQuaternionList.push(lastPointQuaternion[3])
          }
        }
      }
      czmlJSON[2].polyline.positions.cartesian = cartesianXYZList
      czmlJSON[1].position.cartesian = cartesianDateXYZList
      czmlJSON[1].model.gltf = ("static/SampleData/models/subway/subway"+id+".glb")
      czmlJSON[1].orientation.unitQuaternion = unitQuaternionList
      czmlJSON[1].orientation.interpolationAlgorithm = "LINEAR"
      czmlJSON[1].orientation.interpolationDegree = 1
      czmlJSON[1].id="subway"+id
      czmlJSON[0].clock.currentTime = date_start.toISOString()
      czmlJSON[0].clock.interval = date_start.toISOString() + "/" + date.toISOString()
      console.log('czmlJSON_updated',czmlJSON);

      const loadName="subway"+id;
      const dataSourcePromise = new Cesium.CzmlDataSource(loadName);
      dataSourcePromise.load(
          czmlJSON
      );
      viewer.dataSources.add(dataSourcePromise).then(function (dataSource) {
        _this.loadedList.push(loadName);
      }).catch(e => {
        console.log(e)
      });
    },

    addTrainAndLabel() {
      this.speedLabelEntity = viewer.entities.add({
        position: new Cesium.CallbackProperty(() => {
          return this.entity.position.getValue(Cesium.JulianDate.now());
        }, false),
        label: {
          text: new Cesium.CallbackProperty(() => {
            let currentSpeed = this.getCurrentSpeed();
            return `速度: ${currentSpeed.toFixed(2)} 米/秒`;
          }, false),
          font: '14pt monospace',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -20)
        }
      });
    },

    computeTimeCost(position_start, position_end) {
      // console.log('position_start',position_start);
      // console.log('position_end',position_end);
      let intervalMile = this.distanceCal(position_start,position_end);
      let proportion=intervalMile/this.lineTotalLength;
      let intervalSecondsCost = proportion * this.timeCost;
      this.trainSpeedList.push(intervalMile/intervalSecondsCost);
      return intervalSecondsCost;
    },

    computeModelQuaternion(position, positionNext) {
      var modelHeading=0;
      try{
        modelHeading = this.computeModelHeading(position,positionNext);
      } catch(err){
      }
      var pitch = 0;
      var roll = 0;
      var hpr = new Cesium.HeadingPitchRoll(modelHeading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
      return [orientation.x, orientation.y, orientation.z, orientation.w];
    },


    computeModelHeading(pointA, pointB) {
      //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
      const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
      //向量AB
      const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
      //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
      //AB为世界坐标中的向量
      //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
      const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
      //归一化
      const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
      //heading
      const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
      return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
    },

    distanceCal(point1,point2){
      var cartographic1 = Cesium.Cartographic.fromCartesian(point1);
      var cartographic2 = Cesium.Cartographic.fromCartesian(point2);
      // console.log(cartographic1);
      // console.log(cartographic2);
      var geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(cartographic1,cartographic2);
      //两点的贴地线距离（不计算高度差）
      var s =geodesic.surfaceDistance;
      return s;
    },

    async getAllRoute(){
      let res=await getAllRoute();
      this.allRoutes=res.data;
      console.log('allRoute',this.allRoutes)
    },


    // 根据GeoJSON线路计算每个点沿其上一个点到当前点的方向后退10米的新位置
    calculatePositionsBackward(choseLineJSON,id) {
      let newGeoJSON = JSON.parse(JSON.stringify(choseLineJSON));
      var lastPoints=[];
      for( var i=0;i<choseLineJSON.features.length;i++){
        let positions = choseLineJSON.features[i].geometry.coordinates;
        let newPositions = [];

        // 处理第一个点，使其沿第一个点到第二个点的方向后退10米
        if (positions.length > 1) {
          let firstStartPoint = Cesium.Cartographic.fromDegrees(positions[0][0], positions[0][1]);
          let firstEndPoint = Cesium.Cartographic.fromDegrees(positions[1][0], positions[1][1]);
          let firstGeodesic = new Cesium.EllipsoidGeodesic(firstStartPoint, firstEndPoint);
          let firstMovedPoint = firstGeodesic.interpolateUsingSurfaceDistance(-10);
          let firstNewLongitude = Cesium.Math.toDegrees(firstMovedPoint.longitude);
          let firstNewLatitude = Cesium.Math.toDegrees(firstMovedPoint.latitude);
          newPositions.push([firstNewLongitude, firstNewLatitude]);
        }

        // 从第二个点开始，每个点都沿上一个点到当前点的方向后退10米
        positions.forEach((position, index) => {
          if (index > 0) {
            let startPoint = Cesium.Cartographic.fromDegrees(positions[index - 1][0], positions[index - 1][1]);
            let endPoint = Cesium.Cartographic.fromDegrees(position[0], position[1]);
            let geodesic = new Cesium.EllipsoidGeodesic(startPoint, endPoint);
            let movedPoint = geodesic.interpolateUsingSurfaceDistance(-10);
            let newLongitude = Cesium.Math.toDegrees(movedPoint.longitude);
            let newLatitude = Cesium.Math.toDegrees(movedPoint.latitude);
            newPositions.push([newLongitude, newLatitude]);
          }
        });
        newGeoJSON.features[i].geometry.coordinates = newPositions;
        lastPoints.push(newPositions[newPositions.length-1]);
        if(i>0){
          newGeoJSON.features[i].geometry.coordinates[0]=lastPoints[i-1];
        }
        newGeoJSON.features[i].properties.name=newGeoJSON.features[i].properties.name+id;
      }
      newGeoJSON.name=newGeoJSON.name+id;
      return newGeoJSON;
    },

    // 根据GeoJSON线路计算每个点沿该点到下一个点的方向前进10米的新位置
    calculatePositionsForward(choseLineJSON,id) {
      let newGeoJSON = JSON.parse(JSON.stringify(choseLineJSON));
      var lastPoints=[];
      for( var i=0;i<choseLineJSON.features.length;i++){
        let positions = choseLineJSON.features[i].geometry.coordinates;
        let newPositions = [];
        positions.forEach((position, index) => {
          if (index < positions.length - 1) {
            // 对于路径上的每个点，使用该点到下一个点的方向前进10米
            let startPoint = Cesium.Cartographic.fromDegrees(position[0], position[1]);
            let endPoint = Cesium.Cartographic.fromDegrees(positions[index + 1][0], positions[index + 1][1]);
            let geodesic = new Cesium.EllipsoidGeodesic(startPoint, endPoint);
            let movedPoint = geodesic.interpolateUsingSurfaceDistance(10);
            let newLongitude = Cesium.Math.toDegrees(movedPoint.longitude);
            let newLatitude = Cesium.Math.toDegrees(movedPoint.latitude);
            newPositions.push([newLongitude, newLatitude]);
          } else if (index === positions.length - 1 && positions.length > 1) {
            // 最后一个点使用倒数第二个点到最后一个点的方向前进10米
            let startPoint = Cesium.Cartographic.fromDegrees(positions[index - 1][0], positions[index - 1][1]);
            let endPoint = Cesium.Cartographic.fromDegrees(position[0], position[1]);
            let geodesic = new Cesium.EllipsoidGeodesic(startPoint, endPoint);
            let movedPoint = geodesic.interpolateUsingSurfaceDistance(10);
            let newLongitude = Cesium.Math.toDegrees(movedPoint.longitude);
            let newLatitude = Cesium.Math.toDegrees(movedPoint.latitude);
            newPositions.push([newLongitude, newLatitude]);
          }
        });
        lastPoints.push(newPositions[newPositions.length-1]);
        if(i>0){
          newGeoJSON.features[i].geometry.coordinates[0]=lastPoints[i-1];
        }
        newGeoJSON.features[i].geometry.coordinates = newPositions;
      }
      return newGeoJSON;
    },


    async test() {
      const _this=this;
      var pointA=Cesium.Cartesian3.fromDegrees(133.0, 30.0);
      var pointB=Cesium.Cartesian3.fromDegrees(130.0, 80.0);
      console.log('A',pointA);
      console.log('B',pointB);
      let heading = this.computeModelHeading(pointA,pointB);
      console.log('heading',heading);
    },
  },

};
</script>
<style scoped>

.select {
  padding: 10px;
}

.container{
  width: 100%;
  height: 100%;
}

.getCoorVal{
  position: absolute;
  width: 300px;
  height: 100px;
  right: 20px;
  bottom: 70px;
  background: #21ABAD;
}

.getRailGeo{
  position: absolute;
  width: 300px;
  height: 700px;
  left: 20px;
  top: 50px;
  background: #21ABAD;
}

.rail_name{
  position: absolute;
  margin-top: 30px;
  width: 98%;
  height: 5%;
  background: #FFFFFF4D;
  color: white;
  font-size: 16px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rail_coor{
  position: absolute;
  margin-top: 100px;
  width: 98%;
  height: 85%;
  background: #FFFFFF4D;
  color: white;
  font-size: 16px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.area-coor{
  position: absolute;
  margin-top: 30px;
  width: 98%;
  height: 65%;
  background: #FFFFFF4D;
  color: white;
  font-size: 16px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.getCameraRange{
  position: absolute;
  right: 20px;
  bottom: 5px;
  width: 70px;
  height: 27px;
  /*background: #21ABAD;*/
  border-radius: 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  cursor: pointer;
}

.startUp{
  position: absolute;
  right: 140px;
  bottom: 5px;
  width: 70px;
  height: 27px;
  /*background: #21ABAD;*/
  border-radius: 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  cursor: pointer;
}

.choseLayer{
  position: absolute;
  right: 400px;
  bottom: 10px;
  width: 250px;
  height: 27px;
}

.choseToRemove{
  position: absolute;
  right: 640px;
  bottom: 10px;
  width: 250px;
  height: 27px;
}

.closeRailway{
  position: absolute;
  right: 236px;
  bottom: 5px;
  width: 150px;
  height: 27px;
  /*background: #21ABAD;*/
  border-radius: 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  cursor: pointer;
}

.loadTrain{
  position: absolute;
  left: 10px;
  bottom: 5px;
  width: 150px;
  height: 27px;
  /*background: #21ABAD;*/
  border-radius: 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  cursor: pointer;
}

.loadTrain-1{
  position: absolute;
  left: 270px;
  bottom: 5px;
  width: 150px;
  height: 27px;
  /*background: #21ABAD;*/
  border-radius: 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  cursor: pointer;
}

.setRailLine{
  position: absolute;
  left: 180px;
  bottom: 5px;
  width: 70px;
  height: 27px;
  /*background: #21ABAD;*/
  border-radius: 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  cursor: pointer;
}

.close_button{
  position: absolute;
  right: 2px;
  top: 2px;
  width: 45px;
  height: 25px;
  background: #21ABAD;
  border-radius: 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  cursor: pointer;
}

</style>
