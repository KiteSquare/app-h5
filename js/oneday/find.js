od = window.od || {};
od.find = {
	inits: function() {
		od.find.initPage();
		od.find.bindTapEvents();
		od.find.bindNextTap();
	},
	initPage: function() {
		mui.init();
		template.config('escape', false);
		var friendswebview = plus.webview.getWebviewById("friends.html");
		if (friendswebview) {
			friendswebview.reload();
		} else {
			var view = mui.preload({
				//					view = mui.openWindow({	
				url: "friends.html",
				id: "friends.html", //默认使用当前页面的url作为id
				styles: {
					top: '0',
					bottom: '0'
				}, //窗口参数
				extras: {} //自定义扩展参数
			});
		}
		
		od.find.loadRecomend();
	},
	bindTapEvents: function() {
		mui('.mui-content').on('tap', '.mui-table-view-cell a', function(e) {
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
	bindNextTap: function() {
		document.getElementById("app-next").addEventListener("tap", od.find.loadRecomend);
	},
	loadRecomend: function() {
		var uid = plus.storage.getItem("uid");
		mui.ajax(
			od.host + "/oneday/search/recommend", 
			{
				type:"post",	
				dataType: "json",
				contentType:"application/json",
				data:JSON.stringify({"id":uid}),  
				success: od.find.onLoadRecomendSuccess,
				error: function(e){
					mui.toast("加载推荐失败");
				},
			}
		);
	},
	onLoadRecomendSuccess: function(data) {
		if (data.code == "0") {
			var uid = plus.storage.getItem("uid");
			if (data.data && data.data.data && data.data.data.length>0) {
				var obj = document.querySelector(".recomend-list");
				obj.innerHTML = template('recomends-template', {
					"users": data.data.data
				});
			} else {
				mui.toast("没有更多结果咯~~");
			}
		} else {
			mui.toast(data.message);
		}
	}

}
mui.plusReady(function() {
	od.find.inits();
});