od = window.od || {};
od.base.addRefreshBtn();
od.setting = {
	inits: function() {
		mui.init();
		od.setting.initEvents();
		
	},
	initEvents: function() {
		od.setting.bindTapEvent();
		od.setting.binLogoutTap();
		document.addEventListener("refresh", od.setting.refresh);
	},
	
	binLogoutTap: function() {
		document.getElementById('login-btn').addEventListener("tap",od.setting.onLogoutTap);
	},
	onLogoutTap: function(e) {
		od.base.clearLocal();
		od.setting.refresh();
		mui.toast("已退出登录");
	},
	bindTapEvent: function() {
		mui('.mui-content').on('tap', 'a', function(e) {
			var targetTab = this.getAttribute('href');
			//更换标题
			//				title.innerHTML = this.querySelector('.mui-tab-label').innerHTML;
			//显示目标选项卡
			//若为iOS平台或非首次显示，则直接显示

			var view = plus.webview.getWebviewById(targetTab);
			if(!view) {
//				view = mui.preload({
				view = mui.openWindow({
					url: targetTab,
					id: targetTab, //默认使用当前页面的url作为id
					styles: {
						top: '0',
						bottom: '0'
					}, //窗口参数
					extras: {} //自定义扩展参数
				});
			} else {
				if(mui.os.ios) {
					view.show(targetTab);
				} else {
					//否则，使用fade-in动画，且保存变量
					view.show(targetTab, "fade-in", 300);
				}
			}
			
			
		});
	},
	refresh: function() {
		if (od.base.isLogin()) {
			var token = od.base.getAccessToken();
			var param = {
				'accessToken': token
			};
			mui.ajax(
				od.host + "/oneday/user/get", 
				{
					type: "post",
					dataType: "json",
					contentType:"application/json",
					data:JSON.stringify(param),
					success: od.setting.onGetUserSuccess,
					error: function(e) {
						od.base.onError("FAILED_NETWORK");
					},
					timeout: 10000
				}
			);
		} else {
			od.setting.defaultPage();
		}
	},
	
	onGetUserSuccess: function(data) {
		if (data.code && data.code != "0") {
			mui.toast(data.message);
			od.setting.defaultPage();
			return;
		}
		od.setting.userPage(data.data);
	},
	defaultPage: function() {
		document.getElementById("defaultInfo").style.display = "block";
		document.getElementById("userInfo").style.display = "none";
	},
	userPage: function(user) {
		var userObj = document.getElementById("userInfo");
		userObj.getElementsByTagName("img")[0].src = user.head;
		userObj.getElementsByTagName("p")[0].innerHTML = user.name;
		userObj.style.display = "block";
		document.getElementById("defaultInfo").style.display = "none";
	}
}

//od.setting.inits();
mui.plusReady(function() {
	od.setting.inits();
});