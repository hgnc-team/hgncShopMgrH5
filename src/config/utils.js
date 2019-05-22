import _ from 'lodash'
// 全局map引用
let map = null
let markerToDeviceMap = {}
let labelToDeviceMap = {}
let currentMarker = null
let initStatus = {
  longitude: 114.225077,
  pointX: 114.225077,
  latitude: 30.775267,
  pointY: 30.775267,
  scene: 1, // 1查询周边 0是定位现在的路段,
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmdOYW1lIjoi5rmW5YyX55yB5aSp5rKz5py65Zy65Lqk6K2m5pSv6ZifIiwib3JnTm8iOiI0MjQyMDEwMDAwMDAiLCJwb2xpY2VObyI6ImFkbWluIiwicG9saWNlTmFtZSI6IueuoeeQhuWRmCIsImlkIjoiNWFlZTY2Nzk0NmFmNGI1NjlmMDc2ZWJlYjhiNjdlMzYiLCJleHAiOjE1NTczMDY5MjR9.yklJ0b7nw7kAkBc0-vHmfuWVgEEDtFFtX_SkmEzHXPk'
}

export default {
  setInitStatus(status) {
    initStatus.longitude = status.longitude
    initStatus.latitude = status.latitude
    initStatus.scene = status.scene
    initStatus.token = status.token
  },
  getInitStatus() {
    return _.clone(initStatus)
  },
  getMap() {
    if(map) {
      return map
    }
  },
  // 初始化地图
  initMap(x,y) {
    if (!map) {
      map = new BMap.Map("container")
    }
    let point = new BMap.Point(x, y)
    map.centerAndZoom(point, 15)
    map.enableScrollWheelZoom(true)
    // 不起作用
    map.enableContinuousZoom(true)
    // 不起作用
    map.enablePinchToZoom(true)
    // 不起作用
    map.highResolutionEnabled(true)
    return map
  },
  // 清除所有图元
  clearOverlays()	{
    map.clearOverlays()
  },
  // 在地图上标注点
  makeMark(id, pointX, pointY, type) {
    let customIcon = null
    if (type === 'KK') {
      customIcon = new BMap.Icon('assets/images/marker/KK-icon.png', new BMap.Size(40,40))
    } else if(type === 'QJ') {
      customIcon = new BMap.Icon('assets/images/marker/QJ-icon.png', new BMap.Size(40,40))
    } else if(type === 'DJ') {
      customIcon = new BMap.Icon('assets/images/marker/DJ-icon.png', new BMap.Size(40,40))
    } else if (type === 'WT') {
      customIcon = new BMap.Icon('assets/images/marker/WT-icon.png', new BMap.Size(40,40))
    }
    // var myIcon = new BMap.Icon("http://lbsyun.baidu.com/jsdemo/img/fox.gif", new BMap.Size(300,157));

    let point = new BMap.Point(pointX, pointY)
    map.centerAndZoom(point, 15)
    let marker = markerToDeviceMap[id] = new BMap.Marker(point, {icon: customIcon}) // 创建标注
    map.addOverlay(marker) // 将标注添加到地图中
  },

  // 定位到某个坐标
  panTo(id, name, x,y) {
    // 清除之前的label
    _.forEach(labelToDeviceMap, value => {
      map.removeOverlay(value)
    })
    let point = new BMap.Point(x, y)
    let label = labelToDeviceMap[id] = new BMap.Label(name,{offset:new BMap.Size(20,-20)})
    label.setStyle({paddingLeft: '15px',paddingRight:'15px',paddingTop:'8px',paddingBottom:'8px',border:'none',backgroundColor:'rgba(0,0,0,.8)', color:'#fff',fontSize: '16px',borderRadius:'4px'})
    markerToDeviceMap[id].setLabel(label)
  
    map.panTo(point)
    // 置顶
    markerToDeviceMap[id].setZIndex(999999998)
  },

  // 定位当前所处位置，显示pin图标于地图上
  locatePos(x, y) {
    // 只创建一次当前定位marker
    let point = new BMap.Point(x, y)
    // let offsetY = 0
    map.panTo(point)
    if (!currentMarker) {
      
      let customIcon = new BMap.Icon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAYAAAA6GuKaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5RTVDQzNDMDA3NDIxMUU5QUIyQzgxMkU3RUZFQ0VEOSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5RTVDQzNDMTA3NDIxMUU5QUIyQzgxMkU3RUZFQ0VEOSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjlFNUNDM0JFMDc0MjExRTlBQjJDODEyRTdFRkVDRUQ5IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjlFNUNDM0JGMDc0MjExRTlBQjJDODEyRTdFRkVDRUQ5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+EIt+4AAAA7lJREFUeNrsWU1IVFEUvj7GUmEY/wpzkan97RS0RfSDUC7ctBKkglq2rEW7INFF69rWqhaBtKuVVjBCbcoQdwb+rhLEaZyBGf+a6bvMmXg83z3nvuebEaEDH4j33nO/d++53zlzb02xWFRHzRx1BC1W/uPW2wP5aADqgWMEh1Ag7BDyQA7YCzPR+zse0gGtBogDCSLM7aTj+rBG+r8mvglkgWLolQ5gmmgLUHuAHW4gtAIb9AEVIa23vY3CICqrJZ96IdYohCI7iDoUOiIm7LZ68h+PinQT0F4FpXFonqaDktYOTlZZ0fR8zWFjOh6A8BngJnAFOOtSiTSwAHwFPgErlv5OALukLtaky4dOskvAQ6CfmVzjMvAYmAFeAN8tfOv5t/0Op8MM4ELnODAGvGEI+1k/jRkjH1LottnGdEJQCd3+GhihJBMmMY2Qj4SFqiQk0jWUOExWB7wEeiM4cL3kq07o1+JdHMfn8HGZ7gnQE6FS9JBPKQHFOdIJ4dANV0Dihsm3VDr4qkdMKH4ecTEcw+cPnVPqOvJaBwneKgQvCZGbhOjtFdgY177vCrVKrFwdxjwNJrsI9Jkam3Fcng4o1eXJZRdaSxjsVmo8qVQqb/TfR3PMC8Qz3vDgFGPQGHCOP2G36bbRgVLfMHN4F9XxaC+nr742dJ4nXLbOplJf4cxIVeY+0pxqdJkarp22P3FC304LFdlHmtu8RlNDd7M96S6+b6NtcWdLOhL7U4jmR7ibKOcybWpYTNnPuppmm9PC8EJQ0kumhukVe9JJvu9yGNK7zIAZU4NOHMu/ZcIrWMepBbbLjOBi14/0NjPgo9ETvn98GlvBENdtY8lSX8amBNI7fmk8z5xgnal+mLLiRg4V/mToNK7I97xAOudHOicMek4FvG/9oUl9+FlCQCvSrxllS9odHnu02ibTP5HeVUAJtc9vQp+8+yrNCSg7z4C5CAnPkU/JNrl6OiuoyBbwICLic+Rry0I1MhzpIt2tSUngPjChQlwe0pgJ8pG26L/hnccxbEVecKRXZxS4B8wGIDxLZEctVrgcy5u29x5rdLcm1SP6cN6mKvAGcFXXUJ7LmkXgC/CZy6yGDLgW5LJmhwa0W06wRHgV4SE13qJyK6kP5bo6HFs3XYnZlKOpQyC+TvMazeZSPUWy06YqW3OXYzgrdbR9CchSQXXK4kYojGkl+aUsXwKCPF9oh6sqmjcXd+Ko6JuLW8czyu51i9PftKri61Y5q2UIVXtH/Hcl9f+ZuUr2V4ABAGeX5b5gW5r9AAAAAElFTkSuQmCC', new BMap.Size(40,40))
      currentMarker = new BMap.Marker(point, {icon: customIcon}) // 创建标注
      // 定位用，禁止被清除
      currentMarker.disableMassClear()
      // currentMarker.enableDragging()
      map.addOverlay(currentMarker) // 将标注添加到地图中
      currentMarker.setZIndex(999999999)
      // var centerPixel = map.pointToOverlayPixel(map.getCenter());
      // //通过设置地图的中心点，使定位点显示在手机上部分区域
      // map.setCenter(map.overlayPixelToPoint({x:centerPixel.x,y:centerPixel.y+offsetY}));
      // map.addEventListener('dragend',function(){
      //   //获得移动之后地图中心点的像素位置
      //   var pixel = map.pointToOverlayPixel(map.getCenter());
      //   //获得定位图标所在位置在地图上的地理位置，实际上定位图标的像素位置就在地图中心像素位置相应的偏移量处
      //   var Point = map.overlayPixelToPoint({x:pixel.x,y:pixel.y-offsetY});
      //   let customIcon = new BMap.Icon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAYAAAA6GuKaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5RTVDQzNDMDA3NDIxMUU5QUIyQzgxMkU3RUZFQ0VEOSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5RTVDQzNDMTA3NDIxMUU5QUIyQzgxMkU3RUZFQ0VEOSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjlFNUNDM0JFMDc0MjExRTlBQjJDODEyRTdFRkVDRUQ5IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjlFNUNDM0JGMDc0MjExRTlBQjJDODEyRTdFRkVDRUQ5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+EIt+4AAAA7lJREFUeNrsWU1IVFEUvj7GUmEY/wpzkan97RS0RfSDUC7ctBKkglq2rEW7INFF69rWqhaBtKuVVjBCbcoQdwb+rhLEaZyBGf+a6bvMmXg83z3nvuebEaEDH4j33nO/d++53zlzb02xWFRHzRx1BC1W/uPW2wP5aADqgWMEh1Ag7BDyQA7YCzPR+zse0gGtBogDCSLM7aTj+rBG+r8mvglkgWLolQ5gmmgLUHuAHW4gtAIb9AEVIa23vY3CICqrJZ96IdYohCI7iDoUOiIm7LZ68h+PinQT0F4FpXFonqaDktYOTlZZ0fR8zWFjOh6A8BngJnAFOOtSiTSwAHwFPgErlv5OALukLtaky4dOskvAQ6CfmVzjMvAYmAFeAN8tfOv5t/0Op8MM4ELnODAGvGEI+1k/jRkjH1LottnGdEJQCd3+GhihJBMmMY2Qj4SFqiQk0jWUOExWB7wEeiM4cL3kq07o1+JdHMfn8HGZ7gnQE6FS9JBPKQHFOdIJ4dANV0Dihsm3VDr4qkdMKH4ecTEcw+cPnVPqOvJaBwneKgQvCZGbhOjtFdgY177vCrVKrFwdxjwNJrsI9Jkam3Fcng4o1eXJZRdaSxjsVmo8qVQqb/TfR3PMC8Qz3vDgFGPQGHCOP2G36bbRgVLfMHN4F9XxaC+nr742dJ4nXLbOplJf4cxIVeY+0pxqdJkarp22P3FC304LFdlHmtu8RlNDd7M96S6+b6NtcWdLOhL7U4jmR7ibKOcybWpYTNnPuppmm9PC8EJQ0kumhukVe9JJvu9yGNK7zIAZU4NOHMu/ZcIrWMepBbbLjOBi14/0NjPgo9ETvn98GlvBENdtY8lSX8amBNI7fmk8z5xgnal+mLLiRg4V/mToNK7I97xAOudHOicMek4FvG/9oUl9+FlCQCvSrxllS9odHnu02ibTP5HeVUAJtc9vQp+8+yrNCSg7z4C5CAnPkU/JNrl6OiuoyBbwICLic+Rry0I1MhzpIt2tSUngPjChQlwe0pgJ8pG26L/hnccxbEVecKRXZxS4B8wGIDxLZEctVrgcy5u29x5rdLcm1SP6cN6mKvAGcFXXUJ7LmkXgC/CZy6yGDLgW5LJmhwa0W06wRHgV4SE13qJyK6kP5bo6HFs3XYnZlKOpQyC+TvMazeZSPUWy06YqW3OXYzgrdbR9CchSQXXK4kYojGkl+aUsXwKCPF9oh6sqmjcXd+Ko6JuLW8czyu51i9PftKri61Y5q2UIVXtH/Hcl9f+ZuUr2V4ABAGeX5b5gW5r9AAAAAElFTkSuQmCC', new BMap.Size(40,40))
      //   currentMarker = new BMap.Marker(Point, {icon: customIcon}) // 创建标注
      //   map.addOverlay(currentMarker);
      // });

    } else {
      currentMarker.setPosition(point)
    }
    return currentMarker
  }
}