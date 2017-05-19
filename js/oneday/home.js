od = window.od || {};
od.home = od.home || {};
var count = 0;
od.home = {
	inits: function() {
		od.home.initMui();
		//		od.home.initPage();
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
			mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2)); //参数为true代表没有更多数据了。
//			var table = document.body.querySelector('.mui-table-view');
//			var cells = document.body.querySelectorAll('.mui-table-view-cell');
//			for(var i = cells.length, len = i + 20; i < len; i++) {
//				var li = document.createElement('li');
//				li.className = 'mui-table-view-cell';
//				li.innerHTML = '<a class="mui-navigate-right">Item ' + (i + 1) + '</a>';
//				table.appendChild(li);
//		};
		}, 1500);
	},
	initPage: function() {
		var uid = plus.storage.getItem("uid");
		if(uid === undefined) {
			//			alert("请先登录");
			closeWaiting();
			return;
		}
		var obj = mui('.od-home-list');
		if(obj) {
			obj.innerHTML = "";
		}

		mui.ajax(
			od.host + "/oneday/search/recommend", {
				type: "post",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify({
					"id": uid
				}),
				success: od.home.onPageLoad,
				error: function(e) {
					console.log(e);
					alert("time out" + e);
					closeWaiting();
				},
			});

		//		$.ajax({
		//			type:"post",
		//			dataType: "json",
		//			url: od.host + "/oneday/search/recommend",
		////			contentType:"application/json",
		////			data:'{"id":4,"sex":1}',
		//			contentType : 'application/json',  
		//			data: JSON.stringify({"id":uid}),  
		//			async:true,
		//			success: od.home.onPageLoad,
		//			error: function(e){
		//				console.log(e);
		//				alert("time out"+e);
		//				closeWaiting();
		//			},
		//			timeout:5000
		//		});
	},
//	bindDropEvent: function() {
//		od.home.page = 0;
//		od.home.size = 10;
//		od.home.myScroll = new IScroll('#wrapper', {
//			//					scrollY: true,
//			//					preventDefault: false, 
//			probeType: 1,
//			tap: true,
//			click: false,
//			preventDefaultException: {
//				tagName: /.*/
//			},
//			mouseWheel: true,
//			scrollbars: true,
//			fadeScrollbars: true,
//			interactiveScrollbars: false,
//			keyBindings: false,
//			deceleration: 0.0002
//		});
//		od.home.myScroll.on('scroll', od.home.onScroll);
//		od.home.myScroll.on('scrollEnd', od.home.onScrollEnd);
//
//		document.addEventListener('touchmove', false);
//	},
	/**
	 * 下拉过程
	 */
//	onScroll: function() {
//		console.log(this.y);
//		if(this.y > 30) {
//			od.home.listScrollType = 1;
//		}
//	},
	/**
	 * 下拉结束
	 */
//	onScrollEnd: function() {
//
//		console.log('scroll ended');
//		console.log(this);
//		var distance = this.distY - this.startY;
//		console.log(this.y + "---" + od.home.listScrollType);
//		if(od.home.listScrollType == 1) {
//			waiting = plus.nativeUI.showWaiting();
//			od.home.initPage();
//		}
//		od.home.listScrollType = 0;
//	},
	onPageLoad: function(data) {
		if(data.code && data.code == "0") {
			var html = '<div class="mui-card" ><div class="mui-card-header mui-card-media"><img src="{head}"><div class="mui-media-body">{name}<p>{signature}</p></div></div><div class="mui-card-content"><div class="mui-card-content-inner"><p>{detail}</p></div></div><div class="mui-card-footer"><span></span><span>15:30</span><span>500m</span></div></div>'

			var uid = plus.storage.getItem("uid");
			if(data.data && data.data.data) {
				var user;
				var arr = [];
				for(var i = 0; i < data.data.data.length; i++) {
					user = data.data.data[i];
					arr.push(formatTemplate(user, html));
				}
				console.log(arr.join(''));
				mui('.od-home-list').appendChild(arr.join(''));
			}
		}
		closeWaiting();
	},

	bindUserImageClick: function() {
		$("#content").on("click", ".user-img", od.home.onUserImageClick);
	},
	onUserImageClick: function(e) {
		var uid = $(this).parent().attr("data-id");
		clicked('detail.html?uid=' + uid);
	},
	bindSendClickEvent: function() {
		$("#content").on("click", ".btn-send", od.home.onSendClick);
	},
	onSendClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
		var senderId = od.base.getUid(),
			receiverId = $(this).parent().attr("data-id");
		waiting = plus.nativeUI.showWaiting();
		$.ajax({
			type: "post",
			dataType: "json",
			url: od.host + "/oneday/willow/send",
			contentType: 'application/json',
			data: JSON.stringify({
				"senderId": senderId,
				"receiverId": receiverId
			}),
			async: true,
			success: function(data) {

				if(data.code && data.code == "0") {
					$("#item-" + receiverId + " button.btn-send").addClass("btn-sendsucc").val("已发送").attr("disabled", "disabled");
				} else {
					alert(data.message);
				}
				closeWaiting();
			},
			error: function(e) {
				console.log(e);
				alert("请求出错" + e);
				closeWaiting();
			},
			timeout: 5000
		});
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
