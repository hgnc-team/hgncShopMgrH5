<template>
<div class="search-detail-page">
  <div class="element-list-wrap">
    <span v-for="item in elementListData" :key="item.value" @click="handleElementSelect(item)">{{item.label}}</span>
  </div>

  <!-- <div class="history-address-wrap">
    <ul class="history-address-list">
      <li v-for="item in historyData" :key="item.value">
        <div class="history-list-item">
          <div class="left-icon-wrap"></div>
          <div class="middle-content-wrap">
            <span class="name">{{item.name}}</span>
            <span class="address">{{item.address}}</span>
          </div>
        </div>
      </li>
    </ul>
    <div class="clear-text-btn-wrap" @click="clearHistory">
      {{ btnWords }}
    </div>
  </div> -->
</div>
</template>

<script>
export default {
  name: 'SearchDetailPage',
  props: {
    scene: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      btnWords: '清空搜索历史',
      historyData: [
        {
          name: '剑桥春天',
          address: '武汉市-洪山区-珞喻路888号',
          value: '0'
        },
        {
          name: '剑桥春天',
          address: '武汉市-洪山区-珞喻路888号',
          value: '1'
        },
        {
          name: '剑桥春天',
          address: '武汉市-洪山区-珞喻路888号',
          value: '2'
        },
        {
          name: '剑桥春天',
          address: '武汉市-洪山区-珞喻路888号',
          value: '3'
        },
        {
          name: '剑桥春天',
          address: '武汉市-洪山区-珞喻路888号',
          value: '4'
        }
      ],
      // 图元列表（按种类分）
      elementListData: [
        {
          label: '违停球',
          value: 'WT'
        },
        {
          label: '卡口',
          value: 'KK'
        },
        {
          label: '电子警察',
          value: 'DJ'
        },
        {
          label: '区间测速',
          value: 'QJ'
        }
      ]
    }
  },
  mounted() {
    if (this.historyData.length > 0) {
      this.btnWords = '清空搜索历史'
    } 
  },
  methods: {
    handleElementSelect(data) {
      this.$root.eventHub.$emit('hideSearchDetailEvent', data)
      // 切换了图元类型，则在BaiduMapContainer.vue页面中，若图元详情
      // 是打开的，则要关闭
    },
    // 清除历史
    clearHistory() {
      if (this.historyData.length === 0) {
        return
      }
      this.historyData = []
      this.btnWords = '搜索历史为空'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/sass/mixin.scss';
.search-detail-page{
  position:absolute;
  // display:none;
  width:100%;
  height:100%;
  left:0;
  top:0;
  background-color:rgba(255,255,255,.9);
  // 可搜索图元列表
  .element-list-wrap{
    position:relative;
    display:flex;
    flex-wrap:wrap;
    justify-content: flex-start;
    @include px2rem(width, 664);
    @include px2rem(height, 150);
    @include px2rem(border-radius, 4);
    @include boxShandowPx2Rem(4,4,10,#999);
    background-color:#fff;
    margin: 0 auto;
    @include px2rem(margin-top, 162);
    span{
      flex: none;
      display:inline-block;
      @include px2rem(height, 75);
      @include px2rem(line-height, 75);
      @include px2rem(padding-left, 28);
      @include px2rem(padding-right, 14);
      // border-bottom:1px solid #f6f6f6;
      color:#222;
      font-size:14px;
      cursor:pointer;
    }

    &:after{
      content:' ';
      display:block;
      width:100%;
      height:0;
      border-bottom: 1px solid #f6f6f6;
      position:absolute;
      top:50%;
    }
  }

  // 搜索历史列表
  .history-address-wrap{
    @include px2rem(width, 664);
    @include px2rem(border-radius, 4);
    @include boxShandowPx2Rem(4,4,10,#999);
    background-color:#fff;
    margin: 0 auto;
    @include px2rem(margin-top, 17);
    // 清除历史记录按钮
    .clear-text-btn-wrap{
      cursor:pointer;
      text-align:center;
      @include px2rem(height, 100);
      @include px2rem(line-height, 100);
      font-size:16px;
      color:#222;
    }
    // 列表
    ul.history-address-list{
      display:block;
      list-style:none;
      padding-left:0;
      margin:0;
      li{
        cursor:pointer;
        display:block;
        .history-list-item{
          display:flex;
          >div{
            flex:auto;
          }
          @include px2rem(height, 122);
          // 左边icon
          .left-icon-wrap{
            @include px2rem(width, 81);
            @include px2rem(max-width, 81);
            @include px2rem(min-width, 81);
            height:100%;
            // background-color:red;
            background-image: url('../assets/images/icon-address.png');
            background-repeat: no-repeat;
            background-position-y:center;
            @include px2rem(background-position-x, 28);
            @include px2rem(background-size, 40);
          }
          // 行主体
          .middle-content-wrap{
            border-bottom:1px solid #f6f6f6;
            background-image: url('../assets/images/search-icon-bg.png');
            background-repeat: no-repeat;
            background-position-y:center;
            @include px2rem(background-position-x, 514);
            @include px2rem(background-size, 33);
            @include px2rem(padding-right, 66);
            @include px2rem(padding-top, 20);
            >span{
              display:inline-block;
              width:100%;
              &.name{
                font-size:16px;
                line-height:2;
                color:#222;
              }

              &.address{
                font-size:14px;
                line-height:1.5;
                color:#bbb;
              }
            }
          }
        }
      }
    }
  }
}
</style>
