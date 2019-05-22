import Vue from 'vue'
import App from './App.vue'
// 全局 reset
import 'normalize.css/normalize.css'
// 全局样式
import './assets/sass/main.scss'
// 淘宝界面元素显示尺寸兼容方案(比较旧，最新推荐vw)
// 新方案推荐阅读 https://www.w3cplus.com/mobile/vw-layout-in-vue.html
import 'lib-flexible'
import Bridge from './config/bridge.js'
Vue.prototype.$bridge = Bridge
Vue.config.productionTip = false
if (window.location.href.indexOf('localhost') < 0) {
    document.addEventListener('WebViewJavascriptBridgeReady', () => {
        new Vue({
            render: h => h(App),
            data: {
                inAndroid: true,
                eventHub: new Vue()
            },
        }).$mount('#app')
    }, false)
} else {
    new Vue({
        render: h => h(App),
        data: {
            inH5: true,
            eventHub: new Vue()
        },
    }).$mount('#app')
}