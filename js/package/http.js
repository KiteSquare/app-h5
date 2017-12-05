/**
 * 创建于:2017-12-1<br>
 * http通信插件,除了提供基本的通信能力，还提供其他逻辑扩展
 * @author chender
 * @version 0.9
 * TODO 下载任务数控制
 */
(function() {
	od = window.od = window.od || {};
	od.http = new function() {
		var httpFail = httpError;
		var excpetionHandlers = {};
		/**
		 * 设置统一的错误处理
		 */
		this.httpFail = function(hf) {
			httpFail = hf;
		};

		this.setHandler = function(code, fun) {
			excpetionHandlers[code] = [fun];
		}

		/**
		 * 添加异常状态处理器
		 */
		this.addHandler = function(code, fun) {
			if(excpetionHandlers[code]) {
				excpetionHandlers[code].push(fun);
			} else {
				excpetionHandlers[code] = [fun];
			}
		}
		
		this.session=function(cb){
			var accessToken = od.base.getAccessToken();
			accessToken&&this.post("/oneday/user/session",accessToken,function(data){
				if(data.code=="0"){
					plus.nativeUI.toast(data.message)
					cb&&cb();
				}else{
					plus.nativeUI.toast(data.message);
				}
			});
		};

		this.get = function(url, param, success, fail, ext) {
			ajax(url, "get", param, success, fail, ext);
		};
		this.post = function(url, param, success, fail, ext) {
			ajax(url, "post", param, success, fail, ext);
		};

		this.nl = {};
		this.nl.toLoginPage = function(msg) {
			mui.openWindow({
				url: "login.html",
				id: "login.html",
			});
		};
		this.nl.toast = function(msg) {
			plus.nativeUI.toast(msg);
		}
		//需要登录时，默认值进行toast提示，不进行页面跳转
		this.setHandler("-1", this.nl.toast);

		function ajax(url, type, param, success, fail, ext) {
			if(!~url.indexOf("http")) {
				if(url.indexOf("/")!=0){
					url="/"+url;
				}
				url = od.host + url
			}
			fail = fail || httpFail;
			ext = ext || {};
			if(ext.gap) { //设置了调用间隔(间隔时间内，将直接使用上次返回的数据)
				var rKey = url + JSON.stringify(param);
				var preData = localStorage[rKey];
				if(preData) {
					preData = JSON.parse(preData);
					if(preData.ts + ext.gap < new Date().getTime()) { //已过期
						preData = null;
					} else {
						preData = preData.source;
					}
				}
			}
			if(preData) {
				doResponse(preData);
			}
//			var token = od.base.getAccessToken();
//			var headers = token && {
//				accessToken: token
//			} || null;

			mui.ajax(url, {
				data: param,
				type: type,
//				headers: headers,
				async: true,
				contentType:"application/json",
				dataType: "json",
				success: doResponse,
				error: function(xhr, type, error) { //TODO更合理的提示内容
					fail({
						errCode: type,
						errMessage: "请求失败:" + error
					});
				}
			});

			function doResponse(result) {
				if(!preData && rKey) { //未走本地数据，且设置了gap
					localStorage[rKey] = JSON.stringify({
						ts: new Date().getTime(),
						source: result
					});
				}
				if(result.status != "0") {
					whileFail(result.code, result.message);
				} else {
					success(result);
				}
			}
		};

		function whileFail(code, message) {
			var handlers = excpetionHandlers[code];
			if(handlers) {
				for(var i in handlers) {
					handlers[i](message);
				}
			} else { //没有自定义处理器
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast(message);
			}
		};

		function httpError(e) {
			plus.nativeUI.closeWaiting();
			plus.nativeUI.alert(e.errMessage);
		};
	};
})();