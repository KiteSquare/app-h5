od = window.od || {};
od.chat = od.chat || {};
od.detail = {
	inits: function() {
		od.detail.uid = od.getUrlParam("uid"),//  plus.webview.currentWebview().tid;
		od.detail.initPage();
		od.detail.loadData();
		od.detail.bindChatTapEvent();
		od.detail.bindSendTapEvent();
	},
	initPage: function() {
		mui.init();
//		template.config('escape', false);
	},
	loadData: function() {
		var targetUserId = od.detail.uid,
			token = od.base.getAccessToken();
//		if (!token) {
//			mui.toast("你还未登录哦");
//			return;
//		}
		if(targetUserId) {
			mui.ajax(
				od.host + "/oneday/willow/relation", {
					type: "post",
					dataType: "json",
					contentType: "application/json",
					data: JSON.stringify({
						"accessToken": token,
						"targetUserId": targetUserId
					}),
					success: od.detail.onloadDataSuccess,
					error: function(e) {
						mui.toast('error');
					},
					timeout: 10000
				}
			);
		}
	},
	onloadDataSuccess: function(data) {
		if(data.code == "0") {
			var obj = document.querySelector(".mui-content");
			obj.innerHTML = template('content-template', {
				"targetUser": data.data.targetUser,
				"relation": data.data.relation,
				"user": data.data.currentUser
			});
			var titleObj = document.querySelector(".mui-title");
			titleObj.innerHTML = data.data.targetUser["name"];
			mui("#message-images").slider({
						interval: 0
					})
		} else {
			mui.toast(data.message);
		}
	},
	bindChatTapEvent: function() {
		mui('.mui-content').on('tap', '.btn-chat', od.detail.onChatTap);
	},
	bindSendTapEvent: function() {
		mui('.mui-content').on('tap', '.btn-send', od.detail.onSendTap);
	},
	onChatTap: function(e) {
		var uid = this.getAttribute('msg-id');
		//更换标题
		//				title.innerHTML = this.querySelector('.mui-tab-label').innerHTML;
		//显示目标选项卡
		//若为iOS平台或非首次显示，则直接显示
		if(!uid) {
			return;
		}
		var url = "friends.html";
		var view = plus.webview.getWebviewById(url);
		if(!view) {
			view = mui.preload({
				//					view = mui.openWindow({	
				url: url,
				id: url, //默认使用当前页面的url作为id
				styles: {
					top: '0',
					bottom: '0'
				}, //窗口参数
				extras: {} //自定义扩展参数
			});
		}

		if(mui.os.ios) {
			view.show(url);
		} else {
			//否则，使用fade-in动画，且保存变量
			view.show(url, "fade-in", 300);
		}
	},
	onSendTap: function(e) {
		var receiverId = this.getAttribute('msg-id');
		if(!receiverId ) {
			return;
		}
		var token = od.base.getAccessToken();
		if (!token) {
			mui.toast("你还未登录哦");
			return;
		}
		mui.ajax(
			od.host + "/oneday/willow/send", {
				type: "post",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify({
					"accessToken": token,
					"receiverId": receiverId
				}),
				success: od.detail.onSendTapSuccess,
				error: function(e) {
					mui.toast('error');
				},
				timeout: 10000
			}
		);

	},
	onSendTapSuccess: function(data) {
		if(data.code && data.code == "0") {
			var obj = document.querySelector(".mui-content-padded");
			obj.innerHTML='<button class="mui-btn mui-btn-success mui-btn-block btn-chat" msg-id="'+od.detail.uid+'">聊天</button>';
		} else {
			mui.toast(data.message);
		}
	}
}
mui.plusReady(function() {
	od.detail.inits();
});
