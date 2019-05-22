
import axios from 'axios'
import _ from 'lodash'
import helper from '@/config/utils'
// const initStatus = helper.getInitStatus()

export default {
    // 从警务通后台获取数据
    getAroundInfo(params) {
        let initStatus = helper.getInitStatus()
        if(params) {
          _.assign(initStatus, params)
        }

        if(params.longitude) {
          initStatus.pointX = params.longitude
        }

        if(params.latitude) {
          initStatus.pointY = params.latitude
        }

        return new Promise((resolve,reject) => {
          axios.post('http://192.168.3.240:19975/api/v1/searchAssist/queryAroundMsg',initStatus,
          {
            headers: {'token': initStatus.token},
            responseType: 'json'
          })
          .then(res => {
            if(res.data.code === "200") {
              resolve(res.data.data)
            }
          })
          .catch(err => {
            reject(err)
          })
        })
      },
      // 从百度接口获取数据
      getDuGisAroundInfo(params) {
        let initStatus = helper.getInitStatus()
        if(params) {
          _.assign(initStatus, params)
        }

        if(params.longitude) {
          initStatus.pointX = params.longitude
        }

        if(params.latitude) {
          initStatus.pointY = params.latitude
        }

        return new Promise((resolve,reject) => {
          axios.post('http://192.168.3.240:19975/api/v1/search',{
            location: initStatus.latitude+ ','+initStatus.longitude,
            radius: 2000,
            sort_rule: 0,
            output: 'json',
            q:initStatus.q
          },{
            headers: {'token': initStatus.token},
            responseType: 'json'
          })
          .then(res => {
            if(res.data.code === "200") {
              // resolve(JSON.parse(res.data.data))
              resolve(res.data.data)
            }
          })
          .catch(err => {
            reject(err)
          })
        })
      },
      // 从百度接口逆地理编码
      getAddressNameByXY(params) {
        let initStatus = helper.getInitStatus()
        if(params) {
          _.assign(initStatus, params)
        }

        if(params.longitude) {
          initStatus.pointX = params.longitude
        }

        if(params.latitude) {
          initStatus.pointY = params.latitude
        }

        return new Promise((resolve,reject) => {
          axios.post('http://192.168.3.240:19975/api/v1/geocoding',{
            location: initStatus.latitude+ ','+initStatus.longitude,
            // '30.775267,114.225077',
            output: 'json'
          },{
            headers: {'token': initStatus.token},
            responseType: 'json'
          })
          .then(res => {
            if(res.data.code === "200") {
              // resolve(JSON.parse(res.data.data))
              resolve(res.data.data)
            }
          })
          .catch(err => {
            reject(err)
          })
        })
      },
      // 从警务通后台获取路名列表
      getRoadList(params) {
        let initStatus = helper.getInitStatus()
        if(params) {
          _.assign(initStatus, params)
        }

        if(params.longitude) {
          initStatus.pointX = params.longitude
        }

        if(params.latitude) {
          initStatus.pointY = params.latitude
        }

        return new Promise((resolve,reject) => {
          axios.post('http://192.168.3.240:19975/api/v1/searchAssist/queryRoadList', {
            page: initStatus.page,
            limit: initStatus.limit,
            keyword: initStatus.keyword
          },{
            headers: {'token': initStatus.token},
            responseType: 'json'
          })
          .then(res => {
            if(res.data.code === "200") {
              resolve(res.data.data)
            }
          })
          .catch(err => {
            reject(err)
          })
        })
      }
}