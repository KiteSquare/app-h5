od = window.od || {};
od.home = od.home || {};
od.base.addRefreshBtn();
od.home = {
	inits: function() {
		od.home.initMui();
		od.home.bindAddTopickTapEvent();
		od.home.initPage();
		od.home.bindTopicTap();
		
		//		od.home.bindDropEvent();
		//		od.home.bindSendClickEvent();
		//		od.home.bindUserImageClick();
	},
	initMui: function() {
		mui.init({
			pullRefresh: {
				container: '#pullrefresh',
				down: {
					callback: od.home.pulldownRefresh
				},
				up: {
					contentrefresh: '正在加载...',
					callback: od.home.pullupRefresh
				}
			}
		});
//		if(mui.os.plus) {
//			mui.plusReady(function() {
//				setTimeout(function() {
//					mui('#pullrefresh').pullRefresh().pullupLoading();
//				}, 1000);
//
//			});
//		} else {
//			mui.ready(function() {
//				mui('#pullrefresh').pullRefresh().pullupLoading();
//			});
//		}
	},
	pulldownRefresh: function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
			plus.webview.currentWebview().reload();
		}, 1000);
	},
	pullupRefresh: function() {
		setTimeout(function() {
			od.home.getNextData();
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(false); //参数为true代表没有更多数据了。
			
			
			
			
//			var table = document.body.querySelector('.mui-table-view');
//			var cells = document.body.querySelectorAll('.mui-table-view-cell');
//			for(var i = cells.length, len = i + 20; i < len; i++) {
//				var li = document.createElement('li');
//				li.className = 'mui-table-view-cell';
//				li.innerHTML = '<a class="mui-navigate-right">Item ' + (i + 1) + '</a>';
//				table.appendChild(li);
//		};
		}, 200);
	},
	initPage: function() {

		od.home.getNextData();
	},
	currentPage: 0,
	pageNum:2,
	lastPage:false,
	getNextData: function() {
		od.home.currentPage++;
		var param={
			"accessToken": "",//od.base.getAccessToken(),
			"pageNum": od.home.pageNum,
			"currentPage": od.home.currentPage
		};
		var lat = plus.storage.getItem("lat");
		if (lat) {
			param["lat"] = lat;
			param["lon"] = plus.storage.getItem("lon");
			param["cityCode"] = plus.storage.getItem("cityCode");
		}
		mui.ajax(
			od.host + "/topic/recommend", {
				type: "post",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(param),
				success: od.home.onPageLoad,
				error: function(e) {
					od.base.onError("FAILED_NETWORK");
				},
		});

	},
	onPageLoad: function(data) {
		if(data.code && data.code == "0") {
			document.getElementById("content").insertAdjacentHTML('beforeend',  template('content-template', {
					"data": data.data.data
				}));
			od.home.lastPage = data.data.lastPage;
		} else {
			mui.toast(data.message);
		}
		
	},

	bindUserImageClick: function() {
		$("#content").on("click", ".user-img", od.home.onUserImageClick);
	},
	onUserImageClick: function(e) {
		var uid = $(this).parent().attr("data-id");
		clicked('detail.html?uid=' + uid);
	},
	bindTopicTap: function() {
		mui("#content").on("tap", ".mui-card", od.home.onTopicTap);
	},
	bindAddTopickTapEvent: function() {
		document.getElementById("add-topic").addEventListener("tap",  od.home.onAddTopicTap);
	},
	onAddTopicTap: function(e) {
		mui.openWindow({
				url: "addtopic.html",
				id: "addtopic.html", //默认使用当前页面的url作为id
				styles: {
					top: '0',
					bottom: '0'
				}, //窗口参数
				extras: {} //自定义扩展参数
			});
	},
	onTopicTap: function(e) {
		var tid = this.getAttribute("data-tid");
		if (!tid) {
			mui.toast("打开错误");
			return;
		}
		var id="topic"+tid;
		var webview = plus.webview.getWebviewById(id);
		if (!webview) {
			webview = mui.preload({
			    url:"topic.html",
			    id:id,
			    extras:{"tid":tid}
			});
		}
		webview.show("slide-in-right");
	},
	onSendSuccess: function(data) {
		if(data.code && data.code == "0") {

		}
		closeWaiting();
	}
}
mui.plusReady(function() {
	od.home.inits();
});
//od.home.inits();
