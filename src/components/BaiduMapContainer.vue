<template>
<div style="height:100%;overflow:hidden;">
  <div :class="{'baiduMapContainer':true, 'isExpend': isExpend }">
      <div id="container" style="height:100%;"></div>
      <div class="locate-btn-wrap" @click="locate">&nbsp;</div>
      <div class="zoomin-btn-wrap">
          <div class="minus" @click="zoomOut">&nbsp;</div>
          <span class="divider"></span>
          <div class="plus" @click="zoomIn">&nbsp;</div>
      </div>
  </div>
<!--图元列表-->

<div v-if="!showDetail && scene === 1" class="element-list-wrap">
    <ul class="element-list">
        <li v-for="item in elementListData" :key="item.value" @click="handleShowDetails(item)">
            <div class="element-list-item">
                <span class="name">{{item.name}}</span>
                <span class="address">{{item.address}}</span>
            </div>
            <div class="play-btn-wrap" v-if="scene === 1 && item.from * 1" @click.stop="playVideo(item.data.ip)"></div>
        </li>
    </ul>
</div>

<!--图元详情-->
<div v-if="showDetail && scene === 1" class="element-detail-wrap">
    <div class="detailHeader" @click="handleShowDetails(false)">
      <div class="detailHeaderInner">
        <span class="typeName">{{keywords.label}}</span>
        <span class="address">{{ argumentShemeData[0].data }}</span>
      </div>
      <div class="play-btn-wrap" @click.stop="playVideo(argumentShemeData[5].data)"></div>
    </div>
    <ul class="detail-args-list">
      <li v-for="item in argumentShemeData" :key="item.key">
        <span class="label">{{item.name}}：</span>
        <span class="value">{{item.data}}</span>
      </li>
    </ul>
</div>

<!--loading 遮挡-->
<div v-if="showLoading && scene === 1" id="loadingWrap">
  <span id="loading5">
    <span id="outerCircle"></span>
  </span>
</div>

<!--地图中心定位点 定位点不动，地图拖拽移动-->
<div class="centerPoint" ref="centerPoint" v-show="scene === 0 && isExpend"></div>
</div>
</template>

<script>
import API from '@/api/api'
import helper from '@/config/utils'
import _ from 'lodash'

// 全局地图引用
let map = null 
export default {
    name: 'BaiduMapContainer',
    data() {
      return {
        // 显示图元详情
        showDetail: false,
        // 是否显示加载提示
        showLoading: false
      }
    },
    watch: {
      showDetail: {
        handler(newVal) {
          console.log(newVal)
          this.showLoading = !newVal && !this.isExpend
        }
      }
    },
    props: {
        scene: {
          type: Number,
          default: 1
        },
        isExpend: {
          type: Boolean,
          default: true
        },
        keywords: {
          type: Object,
          default: () => {
            return {
              label: '',
              value: 0
            }
          }
        },
      elementListData: {
        type: Array,
        default: ()=>{
          return []
        }
      },
    
      argumentShemeData:{
        type: Array,
        default: ()=>{
          return []
        }
      }
    },
    mounted() {
      this.setCurrentLocation()
      // 根据当前坐标查询Pios/道路/路口信息，共用户选择
      // 如果是定位场景，则调用 x,y 转 路名baidu接口
      if (this.scene === 0) {
        // this.showLoading = true
        API.getAddressNameByXY({
              }).then(res => {
                // console.log(res)
                let searchArr = []
                _.forEach(res.results, value => {
                  _.forEach(value.pois, v => {
                    if (v.address) {
                      searchArr.push(v.address)
                    }
                  })
                })
                // 查询警务通后台
                API.getRoadList({
                  page: 1,
                  limit: 50,
                  keyword: searchArr.join(',')
                }).then(res => {
                  // this.showLoading = false
                  console.log(res)
                }).catch(err => {
                  console.log(err)
                  // this.showLoading = false
                })
              })
      }
      
      this.$root.eventHub.$on('hideSearchDetailEvent', () => {
        this.showDetail = false
      })
      this.$root.eventHub.$on('setCurrentLocationEvent', data => {
        // alert(JSON.stringify(data))
        this.setCurrentLocation(data)
      })
      this.$root.eventHub.$on('showLoadingEvent', data => {
        // console.log(data)
        this.showLoading = data
      })
    },
    methods: {
      dragstartHandle() {
        this.$refs.centerPoint.className = 'centerPoint'
        // console.log(data)
      },
      dragendHandle() {
        this.$refs.centerPoint.className = 'centerPoint settle'
        // console.log(data)
        let currentPoint = map.getCenter()
        // Promise.all([p1, p3])
        // 调用反编码接口
        // this.showLoading = true
        API.getAddressNameByXY({
          longitude: currentPoint.lng,
          latitude: currentPoint.lat
        })
        .then( res=> {
          // console.log(res)
          var results = []
          let searchArr = []
          // 处理百度返回的地址结果
          _.forEach(res.results, value => {
            // pois
            _.forEach(value.pois, pois => {
              results.push({
                name: pois.name,
                address: pois.address,
                lng: pois.longitude,
                lat: pois.latitude,
                type: 'pios'
              })
              if (pois.address) {
                searchArr.push(pois.address)
              }
            })
            // roads
            _.forEach(value.roads, road => {
              results.push({
                name: road.name,
                address: road.province + road.city + road.name,
                type: 'roads'
              })
              // if (road.name) {
              //   searchArr.push(road.name)
              // }
            })

            // roadCrosses
            // console.log(results)
          })

          // 查询警务通后台
          API.getRoadList({
            longitude: currentPoint.lng,
            latitude: currentPoint.lat,
            page: 1,
            limit: 50,
            keyword: searchArr.join(',')
          }).then(res => {
            _.forEach(res.results, value => {
              results.unshift({
                name: value.roadName,
                address: value.roadName,
                no: value.roadNo,
                region: value.regionNo,
                lng: currentPoint.lng,
                lat: currentPoint.lat,
                type: 'jingwutong'
              })
            })

            // 设置主输入框的值
            this.$root.eventHub.$emit('changeInputEvent', results)
            // console.log(results)
          })
          .catch(err => {
              console.log(err)
              // this.showLoading = false
            })
        })
        .catch(err => {
          console.log(err)
          // this.showLoading = false
        })
      },
      handleShowDetails(obj) {
        if (this.scene === 0) {
          return
        }
        if(obj) {
         // alert(JSON.stringify(obj))
          // 地图上定位到改点
          helper.panTo(obj.data.id, obj.name, obj.data.pointX, obj.data.pointY)
          this.$root.eventHub.$emit('showDeviceDetailEvent', obj.data)
        }
        this.showDetail = !this.showDetail
        // 很不好的写法
        this.$nextTick(() => {
          this.showLoading = false
        })
      },
      // 调用native播放视频
      playVideo(ip) {
        if (this.scene === 0) {
          return
        }
        if(this.$root.inAndroid) {
          // 调取后台视频
          this.$bridge.callhandler('callNativeToPlayByIp', ip, () => {
            // alert('OK')
            // console.log(data)
          })
        }
        // alert('调用native播放视频')
      },
      setCurrentLocation(position) {
        let p = position ? position : helper.getInitStatus()
        setTimeout(() => {
          // console.log(position)
          // debugger
          map = helper.initMap(p.longitude, p.latitude)
          helper.locatePos(p.longitude, p.latitude)
          // alert(JSON.stringify(p))
          if (p.scene === 0) {
            this.scene = 0
            // 默认定位一次
            this.initPin()
            // 绑定事件
            map.addEventListener("dragend", this.dragendHandle)
            map.addEventListener("dragstart", this.dragstartHandle)
            this.dragendHandle()
          }
        }, 0)
      },
      // 放大
      zoomIn() {
        map.zoomIn()
      },
      // 缩小
      zoomOut() {
        map.zoomOut()
      },
      // 定位
      locate() {
        this.$bridge.callhandler('getCurrentLocation', {}, data => {
          // console.log(data)
          let initStatus = JSON.parse(data)
          // 设置当前模式
          helper.setInitStatus(initStatus)
          this.$root.eventHub.$emit('setCurrentLocationEvent', JSON.parse(data))
        })
      },
      // 当以定位模式进入页面时
      initPin() {
        // console.log('---------------')
        // console.log(this)
        //pin跳动一次
        // this.$nextTick(() => {
          // console.log(this)
          this.$refs.centerPoint.className = 'centerPoint settle'
          // let currentPoint = 
          map.getCenter()
          // console.log(currentPoint)
        // })
      }
    }
}
</script>

<style lang="scss" scoped>
@import '../assets/sass/mixin.scss';
.baiduMapContainer{
    height:50%;
    position:relative;
    &.isExpend{
        height:100%;
    }
    .locate-btn-wrap{
        position:absolute;
        @include px2rem(left, 28);
        @include px2rem(bottom, 65);
        @include px2rem(width, 65);
        @include px2rem(height, 65);
        background-color:#fff;
        @include px2rem(border-radius, 5);
        background-image:url('../assets/images/icon-location.png');
        background-position:center center;
        background-repeat:no-repeat;
        @include px2rem(background-size, 40);
        @include boxShandowPx2Rem(4,4,10,#999);
    }

    .zoomin-btn-wrap{
        position:absolute;
        display:flex;
        flex-direction:column;
        @include px2rem(right, 28);
        @include px2rem(bottom, 65);
        @include px2rem(width, 65);
        @include px2rem(height, 131);
        background-color:#fff;
        @include px2rem(border-radius, 5);
        @include boxShandowPx2Rem(4,4,10,#999);
        >span{
            &.divider{
                display:inline-block;
                background-color:#f8f8f8;
                @include px2rem(width, 40);
                @include px2rem(height, 2);
                margin:0 auto;
            }
        }
        >div{
            flex:auto;
            background-position:center center;
            background-repeat:no-repeat;
            @include px2rem(background-size, 40);
            cursor:pointer;
            &.plus{
                background-image:url('../assets/images/icon-plus.png');
            }
            &.minus{
                background-image:url('../assets/images/icon-minus.png');
            }
        }
    }
}
// 图元列表
.element-list-wrap{
    height:50%;
    overflow:auto;
    ul.element-list {
        list-style:none;
        margin:0;
        @include px2rem(padding-left, 27);
        li{
            box-sizing:border-box;
            display:flex;
            justify-content:space-between;
            border-bottom:1px solid #f6f6f6;
            @include px2rem(padding-top, 42);
            @include px2rem(padding-bottom, 42);
            @include px2rem(height, 167);
            >div{
                height:100%;
                flex:none;
                &.play-btn-wrap{
                    @include px2rem(width, 114);
                    background-image: url('../assets/images/icon-play.png');
                    background-repeat:no-repeat;
                    @include px2rem(background-position-x, 17);
                    @include px2rem(background-position-y, 23);
                    @include px2rem(background-size,40);
                    cursor:pointer;
                }
            }
            .element-list-item{
                @include px2rem(height, 83);
                >span{
                    display:block;
                    &.name{
                        color:#272727;
                        font-size:16px;
                    }
                    &.address{
                        color:#a5a5a5;
                        font-size:14px;
                        line-height:2;
                    }
                }
            }
        }
    }
}

.element-detail-wrap{
  height:50%;
  overflow:auto;
  display:flex;
  flex-direction: column;
  .detailHeader{
    display:flex;
    justify-content: space-between;
    @include px2rem(height, 167);
    border-bottom:1px solid #aaa;
    >div{
      flex:none;
      &.detailHeaderInner{
        @include px2rem(padding-top, 42);
        @include px2rem(padding-left, 30);
        >span{
          display:block;
          &.typeName{
              color:#272727;
              font-size:18px;
          }
          &.address{
              color:#a5a5a5;
              font-size:14px;
              line-height:2;
          }
        }
      }
      &.play-btn-wrap{
        @include px2rem(width, 90);
        background-image: url('../assets/images/icon-play.png');
        background-repeat:no-repeat;
        @include px2rem(background-position-x, 17);
        background-position-y: center;
        @include px2rem(background-size,40);
        cursor:pointer;
      }
    }
  }
  // 图元铭牌
  ul.detail-args-list{
    flex:auto;
    list-style:none;
    padding-left:0;
    margin:0;
    @include px2rem(margin-top, 40);
    display:flex;
    flex-direction: column;
    justify-content:space-between;
    li{
      flex:auto;
      display:flex;
      align-items: stretch;
      @include px2rem(padding-left, 33);
      >span{
        flex:none;
        display:inline-block;
        line-height:100%;
        height:100%;
        display:flex;
        align-items: center;
        &.label{
          font-size:14px;
          color:#6b6b6b;
          width:5em;
        }
        &.value{
          font-size:14px;
          color:#a5a5a5;
        }
      }
    }
  }
}

// css3 loading
#loadingWrap{
  width: 100%;
  height:50%;
  overflow:hidden;
  background-color:rgba(255,255,255, .75);
  position: fixed;
  bottom: 0;
  left: 0;
  text-align:center;
}

#loading5{
   display:inline-block;
   position:absolute;
   top:50%;
   @include px2rem(margin-left, -47);
   @include px2rem(margin-top, -47);
   @include px2rem(width, 94);
   @include px2rem(height, 94);
}

#outerCircle
  {

    display: inline-block;
    width: 100%;
    height:100%;
    // @include px2rem(width, 80);
    // @include px2rem(height, 80);
    // @include px2rem(border-radius, 80);
    border-radius: 100%;
    box-shadow:none;
    -moz-box-shadow:none;
    -ms-box-shadow:none;
    -o-box-shadow:none;
    -webkit-box-shadow:none;
    
    // border-top:7px solid transparent;
    @include px2rem(border-top-width, 7);
    border-top-style: solid;
    border-top-color:transparent;

    @include px2rem(border-bottom-width, 7);
    border-bottom-style: solid;
    border-bottom-color:#06F;

    // border-bottom:7px solid #06F;
    @include px2rem(border-left-width, 7);
    border-left-style: solid;
    border-left-color:#06F;

    // border-left:7px solid #06F;
    @include px2rem(border-right-width, 7);
    border-right-style: solid;
    border-right-color:transparent;
    // border-right:7px solid transparent;
    
    -webkit-animation: cwSpin 1s linear .2s infinite;
    -moz-animation: cwSpin .666s linear .2s infinite;
    -o-animation: cwSpin .666s linear .2s infinite;
    -ms-animation: cwSpin .666s linear .2s infinite;
    animation: cwSpin .666s linear .2s infinite;
  }

.centerPoint{
  position:absolute;
  top:50%;
  left:50%;
  @include px2rem(margin-left, -28);
  @include px2rem(margin-top, -50);
  display:inline-block;
  @include px2rem(width, 60);
  @include px2rem(height, 60);
  background-image:url('../assets/images/marker/pin-icon-300x300.png');
  background-repeat: no-repeat;
  @include px2rem(background-size, 60);
  &.settle{
    -webkit-animation: bounce .4s linear;
    -moz-animation: bounce .4s linear;
    animation: bounce .4s linear;
  }
}

// 定位动画
@-webkit-keyframes bounce {
	0%{   @include px2rem(margin-top , -48) }
	20%{  @include px2rem(margin-top , -56)}
	40%{  @include px2rem(margin-top , -48)}
	60%{  @include px2rem(margin-top , -53)}
	80%{  @include px2rem(margin-top , -49)}
	100%{ @include px2rem(margin-top , -50)}
}
@-moz-keyframes bounce {
	0%{   @include px2rem(margin-top , -48) }
	20%{  @include px2rem(margin-top , -56)}
	40%{  @include px2rem(margin-top , -48)}
	60%{  @include px2rem(margin-top , -53)}
	80%{  @include px2rem(margin-top , -49)}
	100%{ @include px2rem(margin-top , -50)}
}
@keyframes bounce {
  0%{   @include px2rem(margin-top , -48) }
	20%{  @include px2rem(margin-top , -56)}
	40%{  @include px2rem(margin-top , -48)}
	60%{  @include px2rem(margin-top , -53)}
	80%{  @include px2rem(margin-top , -49)}
	100%{ @include px2rem(margin-top , -50)}
}

// 加载动画
@-webkit-keyframes cwSpin
{
	0%{-webkit-transform:rotate(0deg);	}
	100%{-webkit-transform:rotate(360deg); }
}
@-moz-keyframes cwSpin
{
	0%{-moz-transform:rotate(0deg);	}
	100%{-moz-transform:rotate(360deg); }
}
@-ms-keyframes cwSpin
{
	0%{-ms-transform:rotate(0deg);	}
	100%{-ms-transform:rotate(360deg); }
}
@-o-keyframes cwSpin
{
	0%{-o-transform:rotate(0deg);	}
	100%{-o-transform:rotate(360deg); }
}
@keyframes cwSpin
{
	0%{transform:rotate(0deg);	}
	100%{transform:rotate(360deg); }
}
</style>