<template>
<div>
    <div class="main-search-input-inner">
        <div class="left-arrow-wrap" @click="goBackHandle">
            <span class="left-arrow-bg"></span>
        </div>
        <div class="middle-input-wrap">
          <form @submit.prevent="submitSearchInput">
            <input type="text" v-on:input="handleInput" :value="value.label" placeholder="搜地点、监控等..." @click="handleClickSelect"/>
          </form>
        </div>
    </div>
    <!--定位模式下 显示定位到的地点名称-->
    <div v-show ="isShow" class="locate-address-list-wrap">
      <ul class="locate-address-list">
        <li v-for="item in places" :key="item.no" @click="selectPlace(item)">
          <div class="locate-address-item">
            <span class="name">{{item.name}}</span>
            <span class="address">{{item.address}}</span>
          </div>
        </li>
      </ul>
    </div>
</div>
</template>

<script>
import _ from 'lodash'
import API from '@/api/api'
import helper from '@/config/utils'
// 
const keywordToCateMap = {
  // 区间测速
  QJ : 'velometerList',
  // 电子警察
  DJ : 'electriPoliceList',
  // 卡口
  KK : 'bayonetList',
  // 违停球
  WT : 'videoList'
}
let debounceGetAroundInfoFn = null

export default {
    name: 'MainSearchInput',
    props:{
        places: {
          type: Array,
          default: () => {
            return []
          }
        },
        scene: {
          type: Number,
          default: 1
        },
        value: {
          type: Object,
          default: () => {
            return {
              label: '',
              value: 0,
              // 扩展字段
              roadName:'',
              roadNo:'',
              longitude: '',
              latitude: ''
            }
          }
        }
    },
    data() {
      return {
        // 显示定位结果列表
        isShow: false
      }
    },
    computed: {
      newKeywords() {
        return this.value
      }
    },
    watch: {
      'newKeywords' : {
        handler(newVal) {
          // debugger
          console.log(newVal)
          if(newVal.label === ''){
            this.isShow = false
            return
          }

          if (this.scene === 1) {
            if(newVal.value === 'KK' || newVal.value === 'WT' || newVal.value === 'QJ' || newVal.value === 'DJ') {
              this.debounceGetAroundInfo()()
              // 查询之前 清除地图上的图元
              helper.clearOverlays()
            }
          } 
          // else if (this.scene === 0){
          //   if(this.$root.inAndroid) {
          //     this.$bridge.callhandler('noticeNativePosInfo', {
          //         roadName: newVal.roadName,
          //         roadNo: newVal.roadNo,
          //         latitude: newVal.latitude,
          //         longitude: newVal.longitude
          //       }, () => {
          //       // alert('OK')
          //       // console.log(data)
          //     })
          //   }
          // }
        },
        deep: true
      }
    },
    mounted() {
      if(this.scene === 0) {
        setTimeout(() => {
          helper.getMap().addEventListener("click", () => {
            this.isShow = false
          })
        })
      }
      // if(this.scene === 1) {
      //   // 通过事件触发提交一次数据
      //   this.$root.eventHub.$on('submitInputEvent', () => {
      //     this.submitSearchInput()
      //   })
      // }
    },
    methods: {
      // 提交输入表单
      submitSearchInput() {
        if(this.value.label === ''){
            this.isShow = false
            return
          }
          
          this.debounceGetAroundInfo()()
          if (this.scene === 1) {
            // 查询之前 清除地图上的图元
            helper.clearOverlays()
            // this.debounceGetAroundInfo()()
          } else if (this.scene === 0){
            if(this.$root.inAndroid) {
              this.$bridge.callhandler('noticeNativePosInfo', {
                  roadName: this.value.roadName,
                  roadNo: this.value.roadNo,
                  latitude: this.value.latitude,
                  longitude: this.value.longitude
                }, () => {
                // alert('OK')
                // console.log(data)
              })
            }
          }
      },
      // 选择一个地点
      selectPlace(place) {
        this.isShow = false
        console.log(place)
        // this.places = []
        if (!place.no) {
          // alert('没有路段编号')
          return
        }
        this.$emit('input', {
          label: place.name,
          // value: $event.target.value
          value: place.lng + ',' + place.lat,
          roadName: place.name,
          roadNo:place.no,
          longitude: place.lng,
          latitude: place.lat
        })

        if(this.$root.inAndroid) {
          this.$bridge.callhandler('noticeNativePosInfo', {
              roadName: place.name,
              roadNo: place.no,
              latitude: place.lat,
              longitude: place.lng
            }, () => {
            // alert('OK')
            // console.log(data)
          })
        }
        // 关闭当前窗口
        setTimeout(() => {
          this.$bridge.callhandler('goBack', {}, () => {
            console.log('已选择一有效路段号')
          })
        }, 500)
      },
      handleClickSelect() {
        this.isShow = !this.isShow
        // 打开搜索详情页面
        this.$root.eventHub.$emit('showSearchDetailEvent')
      },
      handleInput($event) {
        this.$emit('input', {
          label: $event.target.value,
          // value: $event.target.value
          value: this.newKeywords.value
        })
      },
      // 返回
      goBackHandle() {
        this.$root.eventHub.$emit('hideSearchDetailEvent',{
            label: '',
            value: 0
        })
      },
      debounceGetAroundInfo() {
        if(!debounceGetAroundInfoFn){
          // debugger
          debounceGetAroundInfoFn =
            _.debounce(()=>{
              // 如果输入为空，则不做查询
              if(this.value.value === '') {
                 return
              }
              this.$root.eventHub.$emit('showLoadingEvent', true)

              let q1 = API.getAroundInfo({
              radius: 5000,
              keyword: this.value.label,
              deviceType: this.value.value
              })

              let q2 = API.getDuGisAroundInfo({
                q: this.value.label
              })
              
              Promise.all([q1,q2]).then(resArr => {
                let results = []
                _.forEach(resArr, (resObj, index) => {
                  // 处理警务通的返回结果
                  if(index === 0) {
                    _.forEach(keywordToCateMap, value => {
                      if (resObj[value] && resObj[value].length > 0){
                        _.forEach(resObj[value], o => {
                          o.type = 'jingwutong'
                          results.push(o)
                        })
                      }
                    })
                  } else if (index === 1) {
                    _.forEach(resObj.results, o => {
                      o.type = 'baidu',
                      results.push(o)
                    })
                  }
                  this.$root.eventHub.$emit('showLoadingEvent', false)
                  this.$root.eventHub.$emit('renderElementListDataEvent', {result: results})
                  // 如果是定位模式，则触发待选位置列表渲染事件
                  if( this.scene === 0) {
                    this.$root.eventHub.$emit('changeInputEvent', results)
                  }
                })
              })
              .catch(err => {
                console.log(err)
                this.$root.eventHub.$emit('showLoadingEvent', false)
              })
            }, 500)
        }
        return debounceGetAroundInfoFn
      }
    }
}
</script>

<style lang="scss">
@import '../assets/sass/mixin.scss';
// 移动定位指针后出现的地址列表
.locate-address-list-wrap{
  overflow:auto;
  @include px2rem(max-height, 512);
  @include px2rem(width, 664);
  @include px2rem(border-radius, 4);
  background-color:#fff;
  @include px2rem(border-radius, 4);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  margin:0 auto;
  @include boxShandowPx2Rem(4,4,10,#999);
  ul.locate-address-list{
    margin:0;
    padding:0;
    @include px2rem(padding-left,20);
    @include px2rem(padding-right,20);
    list-style:none;
    li{
      &:last-child{
        border:none;
      }
      @include px2rem(padding-top, 10);
      @include px2rem(padding-bottom, 10);
      border-bottom:1px solid #ddd;
      @include px2rem(border-bottom-width, 1);
      div.locate-address-item{
        display:flex;
        flex-direction: column;
        span{
          line-height:1.5em;
          &.name {
            color: #272727;
            font-size:15px;
          }
          &.address {
            color: #a5a5a5;
            font-size:13px;
          }
        }
      }
    }
  }
}
.main-search-input-inner{
    display:flex;
    box-sizing:border-box;
    @include px2rem(width, 664);
    @include px2rem(height, 85);
    background-color:#fff;
    @include px2rem(border-radius, 4);
    margin:0 auto;
    @include px2rem(padding-left, 24);
    @include px2rem(padding-right, 24);
    @include px2rem(padding-top, 18);
    @include px2rem(padding-bottom, 18);
    @include boxShandowPx2Rem(4,4,10,#999);
    >div{
        flex:auto;
        &.left-arrow-wrap{
            display:flex;
            align-items: center;
            @include px2rem(width, 45);
            // background-color:red;
            .left-arrow-bg{
                display:inline-block;
                width:100%;
                @include px2rem(height, 33);
                @include px2rem(line-height, 33);
                border-right:2px solid #e8e8e8;
                background:url('../assets/images/left-arrow-bg.png') no-repeat left center;
                background-size:auto 100%;
                cursor:pointer;
            }
        }
        &.middle-input-wrap{
            @include px2rem(width, 613);
            // background-color:blue;
            background:url('../assets/images/search-icon-bg.png') no-repeat left center;
            @include px2rem(background-position-x, 30);
            @include px2rem(background-size, 33);
            form{
              display:block;
              width:100%;
              height:100%;
            }
        }
    }
    input{
        display:block;
        width:100%;
        height:100%;
        border:none;
        outline: none;
        background:transparent;
        @include px2rem(line-height, 49);
        @include px2rem(text-indent, 73);
        font-size:14px;
    }
}
</style>