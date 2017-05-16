od = window.od ||{};
od.login = od.login || {};
od.login = {
	inits: function() {
		od.login.initEvents();
	},
	initEvents: function() {
		document.getElementById("submit-item1").addEventListener('tap', od.login.onLoginSub1);
		document.getElementById("submit-item2").addEventListener('tap', od.login.onLoginSub2);	
	},
	onLoginSub1: function(e) {
		var name=document.getElementById("name").value, password= document.getElementById("password").value;
		if (!name) {
			return;
		}
		if (!password){
			return;
		}
		var url = od.getUrlParam("url")||"";
		
		var param = {"phone": name, "password": password, "type": 1, "url": url};
		mui.ajax(
			od.host + "/oneday/user/login", 
			{
				type:"post",	
				dataType: "json",
				contentType:"application/json",
				data:JSON.stringify(param),  
				success: od.login.onLoginSuccess,
				error: function(e){
					console.log(e);
					alert("error "+e);
				},
				timeout:10000
		});
	},
	onLoginSub2: function(e) {
		var phone=document.getElementById("phone").value, code= document.getElementById("code").value;
		if (!phone) {
			return;
		}
		if (!code){
			return;
		}
		var url = od.getUrlParam("url")||"";
		
		var param = {"phone": phone, "code": code, "type": 2, "url": url};
		mui.ajax(
			od.host + "/oneday/user/login", 
			{
				type:"post",	
				dataType: "json",
				contentType:"application/json",
				data:JSON.stringify(param),  
				success: od.login.onLoginSuccess,
				error: function(e){
					console.log(e);
					alert("error "+e);
				},
				timeout:10000
		});
	},
	onLoginSuccess: function(data) {
		console.log(data);
		if (data.code && data.code != "0") {
			mui.toast(data.message,{ duration:'short', type:'div' }) 
			return;
		}
		var info = data.data;
		plus.storage.setItem("uid",info.id+"");
		plus.storage.setItem("head",info.head);
		plus.storage.setItem("user_sex",info.sex + "");
		plus.storage.setItem("uidStoreTime",""+Date.parse(new Date()));
//		$.cookie('uid',info.id,{expires:360,path:'/'});
		if (info && info.sdktoken) {
			plus.storage.setItem("sdktoken",info.sdktoken);
//			$.cookie('sdktoken',info.sdktoken,{expires:360,path:'/'});
		}
		var chatwebview = plus.webview.getWebviewById("friends.html");
		if (chatwebview) {
			chatwebview.reload();
		}
		if (info && info.url) {
			mui.openWindow({
				url: info.url, 
				id: info.url
			});
		} else {
			var mainPage = plus.webview.currentWebview().opener().parent();	
			mainPage.show();
		}
		plus.webview.currentWebview().close();
	}
}

mui.init();
mui.plusReady(function() {
	od.login.inits();
})
