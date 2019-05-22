<template>
  <div id="app">
    <!--百度地图容器-->
    <baidu-map-container :scene="scene" :isExpend="isExpend" :keywords="keywords" :elementListData="elementListData" :argumentShemeData="argumentShemeData"></baidu-map-container>
    <!--搜索展开页面-->
    <search-detail-page :scene="scene" v-if="showDtail && scene === 1"></search-detail-page>
    <!--主搜索框-->
    <main-search-input :places="places" :scene="scene" class="main-search-input-wrap" v-bind:value="keywords"
  v-on:input="keywords = $event"></main-search-input>
  </div>
</template>

<script>
// 地图容器
import BaiduMapContainer from './components/BaiduMapContainer.vue'
// 搜索展开页面
import SearchDetailPage from './components/SearchDetailPage.vue'
// 主走索框
import MainSearchInput from  './components/MainSearchInput.vue'
import _ from 'lodash'
import helper from './config/utils'

export default {
  name: 'app',
  data() {
    return {
      // 是否显示搜索页面（覆盖地图）
      showDtail: false,
      // 搜索框input值
      keywords: {
        label: '',
        value: 0,
        // 扩展字段
        roadName:'',
        roadNo:'',
        longitude: '',
        latitude: ''
      },
      // 定位场景下，初始定位出来的地址列表
      // 很快会被一个非空值替换
      places: [],
      // 地图是否是展开状态(收缩的时候，占屏幕一半，下方用于展示图元列表)
      isExpend: true,
      // 
      elementListData: [],
      //
      argumentShemeData: [],
      // 页面场景 0 定位场景  1 周边场景
      scene: helper.getInitStatus().scene * 1
    }
  },
  components: {
    BaiduMapContainer,
    SearchDetailPage,
    MainSearchInput
  },
  mounted() {
    // 适配安卓
    if(this.$root.inAndroid) {
      // 从native取得当前的手机的经纬度
      this.$bridge.callhandler('getCurrentLocation', {}, data => {
        let nativeConfig = JSON.parse(data)
        let config = helper.getInitStatus()
        this.scene = nativeConfig.scene * 1
        // _.assign(config, nativeConfig)
        config.longitude = nativeConfig.longitude * 1
        config.latitude = nativeConfig.latitude * 1
        config.pointX = nativeConfig.longitude * 1
        config.pointY = nativeConfig.latitude * 1
        config.token = nativeConfig.token
        config.scene = nativeConfig.scene
        // 设置当前模式
        helper.setInitStatus(config)
        // alert(JSON.stringify(config))
        // alert(this.scene)
        // alert(config.token)
        this.$root.eventHub.$emit('setCurrentLocationEvent', config)
      })
    }
    // 测试scene转换
    // setTimeout(() => {
    //   let config = helper.getInitStatus()
    //   this.scene = data.scene * 1
    //   config.scene = 0
    //   // console.log(config)
    //   this.$root.eventHub.$emit('setCurrentLocationEvent', config)
    // }, 3000)
    // 如果是定位场景
    // if (this.scene === 0) {
    this.$root.eventHub.$on('changeInputEvent', data => {
      if(data.length > 0) {
        // console.log(data[0])
        if(data[0].type === 'jingwutong' || data[0].type === 'roads' || data[0].type === 'pios') {
          _.forEach(data, value => {
            if(value.type === 'jingwutong') {
              let index = _.findIndex(this.places, o => { return o.name == value.name})
              if( index < 0 ) {
                this.places.unshift(value)
              } else {
                this.places.splice(index, 1)
                this.places.unshift(value)
              }
            } else {
              let index = _.findIndex(this.places, o => { return o.name == value.name})
              if( index < 0 ) {
                this.places.push(value)
              } else {
                this.places.splice(index, 1)
                this.places.push(value)
              }
            }
          })
        }

        if(data[0].type === 'baidu') {
          _.forEach(data, value => {
            if( _.findIndex(this.places, o => { return o.name == value.name}) < 0 ) {
              this.places.push(value)
            }
          })
        }
        // this.places = data
      }
      // 必须是来自警务通后台的数据
      if (data.length > 0 && data[0].type === 'jingwutong') {
        // debugger
        this.keywords.label = data[0].name
        this.keywords.value = data[0].lng + ',' + data[0].lat
        this.keywords.roadName = data[0].name
        this.keywords.roadNo = data[0].no
        this.keywords.longitude = data[0].lng
        this.keywords.latitude = data[0].lat
      }
    })
    // }
    this.$root.eventHub.$on('showDeviceDetailEvent', data => {
      // console.log(JSON.stringify(data))
      _.forEach(this.argumentShemeData, value => {
        // console.log(value)
        // 设备名称
        if(value.key === 'key1') {
          value.data = data.deviceName
          // 设备厂商
        } else if (value.key === 'key2') {
          value.data = data.factoryName
          // 设备类型
        } else if (value.key === 'key3') {
          value.data = data.devTypeName
          // 所属机构
        } else if (value.key === 'key4') {
          value.data = data.orgName
          // 设备地址
        } else if (value.key === 'key5') {
          value.data = (data.roadName? (data.roadName + data.subRoadName) : data.subRoadName)
          // 设备ip
        } else if (value.key === 'key6') {
          value.data = data.ip
        }

      })
      
    })
    this.$root.eventHub.$on('showSearchDetailEvent', () => {
      this.showDtail = true
    })
    let clicked = 0
    this.$root.eventHub.$on('hideSearchDetailEvent', data => {
      if (data) {
        this.keywords = data
        if(data.label && this.scene === 1) {
          this.isExpend = false
          // this.$root.eventHub.$emit('submitInputEvent')
        }
      } 
      // 如果当前搜索详情页面已打开
      if(this.showDtail) {
        this.showDtail = !this.showDtail
        return
      } else {
        // 输入框中的值重置为空
        // 展开地图
        // if (this.scene === 1) {
          clicked++
          this.isExpend = true
          // return
        // } else if (this.scene === 0) {
          // clicked++
          // this.isExpend = true
          // console.log(this.scene)
          // return
        // }
      }

      if(this.$root.inAndroid) {
        if(!data.label && this.isExpend && clicked === 2) {
          this.$bridge.callhandler('goBack', {}, () => {
            clicked = 0
            // console.log('调用native,关闭当前页面')
          })
        }
      }
    })

    // 渲染图元列表
    this.$root.eventHub.$on('renderElementListDataEvent', data => {
      let results = []

      _.forEach(data.result,value => {
        if (value.type === 'jingwutong') {
          // 在地图上标注
          helper.makeMark(value.id, value.pointX, value.pointY, value.devType)
          results.push({
            name: value.devTypeName + value.deviceName,
            address: value.distance + ' | ' + (value.roadName? (value.roadName + value.subRoadName) : value.subRoadName),
            value: value.id,
            // 0代表数据来自百度，1代表数据来自警务通后台
            from: 1,
            data: value
          })
        } else if (value.type === 'baidu') {
          results.push({
            name: value.name,
            address: value.address,
            value: value.uid,
            // 0代表数据来自百度，1代表数据来自警务通后台
            from: 0,
            data: value
          })
        }
      })
      // if(data.type === 'baidu') {
      //   _.forEach(data.result, value => {
      //     results.push({
      //       name: value.name,
      //       address: value.address,
      //       value: value.uid,
      //       // 0代表数据来自百度，1代表数据来自警务通后台
      //       from: 0,
      //       data: value
      //     })
      //   })
      // }

      // if (data.type === 'jingwutong') {
      //   _.forEach(data.result, value => {
      //     // 在地图上标注
      //     helper.makeMark(value.id, value.pointX, value.pointY, value.devType)
      //     results.push({
      //       name: value.devTypeName + value.deviceName,
      //       address: value.distance + ' | ' + (value.roadName? (value.roadName + value.subRoadName) : value.subRoadName),
      //       value: value.id,
      //       // 0代表数据来自百度，1代表数据来自警务通后台
      //       from: 1,
      //       data: value
      //     })
      //   })

      //   this.argumentShemeData = 
      //   [
      //     {
      //       name: '设备名称',
      //       key: 'key1',
      //       data: ''
      //     },
      //     {
      //       name: '设备厂商',
      //       key: 'key2',
      //       data: ''
      //     },
      //     {
      //       name: '设备类型',
      //       key: 'key3',
      //       data: ''
      //     },
      //     {
      //       name: '所属机构',
      //       key: 'key4',
      //       data: ''
      //     },
      //     {
      //       name: '设备地址',
      //       key: 'key5',
      //       data: ''
      //     },
      //     {
      //       name: 'IP地址',
      //       key: 'key6',
      //       data: ''
      //     }
      //   ]
      // }

      this.argumentShemeData = 
        [
          {
            name: '设备名称',
            key: 'key1',
            data: ''
          },
          {
            name: '设备厂商',
            key: 'key2',
            data: ''
          },
          {
            name: '设备类型',
            key: 'key3',
            data: ''
          },
          {
            name: '所属机构',
            key: 'key4',
            data: ''
          },
          {
            name: '设备地址',
            key: 'key5',
            data: ''
          },
          {
            name: 'IP地址',
            key: 'key6',
            data: ''
          }
        ]
      
      if(results.length > 0) {
        if (this.scene === 1) {
          this.isExpend = false
        }
        this.showDtail = false
        this.elementListData = results
      }
    })
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
@import './assets/sass/mixin.scss';
#app{
  height:100%;
  position:relative;
}
.main-search-input-wrap{
  position:absolute;
  left:0;
  @include px2rem(top, 59);
  width:100%;
}
</style>
