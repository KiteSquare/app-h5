od = window.od || {};
od.login = od.login || {};
od.base.addRefreshBtn();
od.login = {
	inits: function() {
		mui.init();
		od.login.initEvents();
	},
	initEvents: function() {
		document.getElementById("submit-item1").addEventListener('tap', od.login.onLoginSub1);
		document.getElementById("submit-item2").addEventListener('tap', od.login.onLoginSub2);
	},
	onLoginSub1: function(e) {
		var name = document.getElementById("name").value,
			password = document.getElementById("password").value;
		if(!name) {
			return;
		}
		if(!password) {
			return;
		}
		var url = od.getUrlParam("url") || "";

		od.login.param = {
			"phone": name,
			"password": password,
			"type": 1,
			"url": url
		};
		od.http.post("/oneday/user/login", JSON.stringify(od.login.param), od.login.onLoginSuccess)
		//		mui.ajax(
		//			od.host + "/oneday/user/login", 
		//			{
		//				type:"post",	
		//				dataType: "json",
		//				contentType:"application/json",
		//				data:JSON.stringify(od.login.param),  
		//				success: od.login.onLoginSuccess,
		//				error: function(e){
		//					console.log(e);
		//					alert("error "+e);
		//				},
		//				timeout:10000
		//		});
	},
	onLoginSub2: function(e) {
		var phone = document.getElementById("phone").value,
			code = document.getElementById("code").value;
		if(!phone) {
			return;
		}
		if(!code) {
			return;
		}
		var url = od.getUrlParam("url") || "";

		var param = {
			"phone": phone,
			"code": code,
			"type": 2,
			"url": url
		};
		mui.ajax(
			od.host + "/oneday/user/login", {
				type: "post",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(param),
				success: od.login.onLoginSuccess,
				error: function(e) {
					console.log(e);
					alert("error " + e);
				},
				timeout: 10000
			});
	},
	onLoginSuccess: function(data) {
		console.log(JSON.stringify(data));
		if(data.code && data.code != "0") {
			mui.toast(data.message, {
				duration: 'short',
				type: 'div'
			})
			return;
		}
		var info = data.data;

		od.base.setLocalUser({
			"name": od.login.param['phone'],
			"password": od.login.param['password']
		});
		od.base.setAccessToken(info['accessToken']);
		od.base.setSdkToken(info.sdktoken);
		od.http.session(function() {
			var main = plus.webview.getWebviewById(plus.runtime.appid);
			mui.fire(main, 'refresh');

			if(info && info.url) {
				var page = plus.webview.getWebviewById(info.url);
				if(page) {
					page.show();
				} else {
					mui.openWindow({
						url: info.url,
						id: info.url
					});
				}
			} else {
				main.show();
			}
			plus.webview.currentWebview().close();
		});
	}
}

mui.plusReady(function() {
	od.login.inits();
})