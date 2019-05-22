function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        callback(WebViewJavascriptBridge)
    } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function() {
            callback(WebViewJavascriptBridge)
        }, false)
    }
}
export default {
    callhandler(name, data, callback) {
        setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler(name, data, callback)
        })
    },
    registerhandler(name, callback) {
        setupWebViewJavascriptBridge(function(bridge) {
            bridge.registerHandler(name, function(data, responseCallback) {
                callback(data, responseCallback)
            })
        })
    }
}