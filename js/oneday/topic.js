od = window.od || {};
od.base.addRefreshBtn();
od.topic = {
	ui:{},
	inits: function() {
		od.topic.tid = plus.webview.currentWebview().tid;
		od.topic.ui.textReply = document.getElementById("text-reply");
		od.topic.ui.replyList = document.getElementById("reply");
		od.topic.initMui();
		od.topic.initPage();
		od.topic.getNextReplies();
		od.topic.bindReplyTap();
		od.topic.bindTapEvents();
	},
	initMui: function() {
		mui.init({
			pullRefresh: {
				container: '#content',
				up: {
					contentrefresh: '正在加载...',
					callback: od.topic.pullupRefresh
				}
			}
		});
	},
	
	initPage: function() {
		if (!od.topic.tid) {
			mui.toast("打开错误");
			return;
		}
		var param = {
			"id":od.topic.tid
		};
		mui.ajax(
			od.host + "/topic/get", {
				type: "post",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(param),
				success: od.topic.onPageLoad,
				error: function(e) {
					od.base.onError("FAILED_NETWORK");
				},
		});
	},
	onPageLoad: function(data) {
		if(data.code != "0") {
			mui.toast(data.message);
		} else {
			document.getElementById("topic").innerHTML =  template('topic-template', {
					"topic": data.data
				});
		}
	},
	pullupRefresh: function() {
		setTimeout(function() {
			od.topic.getNextReplies();
			mui('#content').pullRefresh().endPullupToRefresh(false); //od.topic.lastPage 参数为true代表没有更多数据了。
		}, 200);
	},
	currentPage: 1,
	pageNum:2,
	lastPage:false,
	index:0,
	getNextReplies: function() {
		if (!od.topic.tid) {
			return;
		}
		
		var param = {
			"topicId":od.topic.tid, 
			"pageNum":od.topic.pageNum,
			"index":od.topic.index,
			"currentPage":od.topic.currentPage
		};
		var lat = plus.storage.getItem("lat");
		if (lat) {
			param["lat"] = lat;
			param["lon"] = plus.storage.getItem("lon");
		}
		mui.ajax(
			od.host + "/comment/get", {
				type: "post",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(param),
				success: od.topic.onNextRepliesSuccess,
				error: function(e) {
					od.base.onError("FAILED_NETWORK");
				},
		});
	},
	onNextRepliesSuccess: function(data) {
		if(data.code && data.code == "0") {
			if (data.data.data.length > 0) {
				od.topic.ui.replyList.insertAdjacentHTML('beforeend',  template('replies-template', {
					"data": data.data.data
				}));
				od.topic.lastPage = data.data.lastPage;
				od.topic.currentPage = data.data.currentPage+1;
				od.topic.index = data.data.index + data.data.data.length;
			}
			
		} else {
			mui.toast(data.message);
		}
	},
	bindTapEvents: function() {
		mui('.mui-content').on('tap', ' a', function(e) {
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

			return false;
		});
	},
	bindReplyTap: function() {
		document.getElementById("btn-reply").addEventListener("tap", od.topic.onReplyTap ,false);
	},
	onReplyTap:function(e) {
		if (!od.topic.tid) {
			return;
		}
		var accessToken=od.base.getAccessToken();
		if (!accessToken) {
			mui.toast("请先登录");
			return;
		}
		var content = od.topic.ui.textReply.value;
		if (content.length<=0) {
			od.topic.ui.textReply.focus();
			setTimeout(function() {
				od.topic.ui.textReply.focus();
			}, 150);
			return;
		}
//		content = content.replace(new RegExp('\n', 'gm'), '<br/>');
		var param = {
			"accessToken": accessToken,
			"topicId" : od.topic.tid,
			"content" : content
		}
		var lat = plus.storage.getItem("lat");
		if (lat) {
			param["lat"] = lat;
			param["lon"] = plus.storage.getItem("lon");
		}
		mui.ajax(
			od.host + "/comment/add", {
				type: "post",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(param),
				success: od.topic.onAddReplySuccess,
				error: function(e) {
					od.base.onError("FAILED_NETWORK");
				},
		});
	},
	onAddReplySuccess: function (data) {
		if(data.code && data.code == "0") {
			od.topic.ui.textReply.value="";
			
//			od.topic.ui.replyList.insertAdjacentHTML('beforeend',  template('replies-template', {
//					"data": [data.data]
//				}));
			mui.toast("发表成功");
		} else {
			mui.toast(data.message);
		}
	}
}
mui.plusReady(function() {
	od.topic.inits();
});
