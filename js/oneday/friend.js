od = window.od || {};
od.friend = od.friend || {};
od.chat = od.chat || {};
od.friend = {
	chatScrollArr: {},
	CHAT_PAGE_ID_PRE: "page-",
	currentPage: 0,
	lastPage:false,
	ui: {
		friends: document.querySelector('#friends'),
		body: document.querySelector('body'),
		footer: document.querySelector('footer')
	},
	onAcceptedClick: function(e) {
		var targetUserId = this.getAttribute("msg-id"),
			userId = plus.storage.getItem("uid");
		var btnArray = ['取消', '确认'];
		mui.confirm('接受TA的请求将会永远能与TA保持聊天，但是同时会自动拒绝之前已接受的人，因为只能接受一个人哦~~点击确认继续', '确认', btnArray, function(e) {
			if(e.index == 0) {
				return;
			}
			mui.ajax(
				od.host + "/oneday/willow/accept", {
					type: "post",
					dataType: "json",
					contentType: "application/json",
					data: JSON.stringify({
						"userId": userId,
						"targetUserId": targetUserId
					}),
					success: od.friend.onAcceptedClickSuccess,
					error: function(e) {
						mui.toast('error');
					},
					timeout: 10000
				}
			);
		})

	},
	onOpClick: function(e) {
		var type = this.getAttribute("msg-type");
		if(type == 'accept') {
			od.friend.onAcceptedClick.call(this, e);
		} else if(type == 'reject') {
			od.friend.onRejectClick.call(this, e);
		} else if(type == 'tipoff') {
			mui.toast("敬请期待");
		}
	},
	onRejectClick: function(e) {
		var targetUserId = this.getAttribute("msg-id"),
			userId = plus.storage.getItem("uid");
		var btnArray = ['取消', '确认'];
		mui.confirm('拒绝TA的请求将不能再与TA聊天~~点击确认继续', '确认', btnArray, function(e) {
			if(e.index == 0) {
				return;
			}
			mui.ajax(
				od.host + "/oneday/willow/reject", {
					type: "post",
					dataType: "json",
					contentType: "application/json",
					data: JSON.stringify({
						"userId": userId,
						"targetUserId": targetUserId
					}),
					success: od.friend.onRejectClickSuccess,
					error: function(e) {
						mui.toast('error');
					},
					timeout: 10000
				}
			);
		})

	},
	onAcceptedClickSuccess: function(data) {
		if(data.code && data.code == "0") {
			//			mui.toast('success');
			plus.webview.currentWebview().reload();
		} else {
			mui.toast(data.message);
		}
	},
	onRejectClickSuccess: function(data) {
		if(data.code && data.code == "0") {
			//			mui.toast('success');
			plus.webview.currentWebview().reload();
		} else {
			mui.toast(data.message);
		}
	},
	onUserClick: function(e) {
		clicked('detail.html', 'zoom-fade-out', true);
		e.preventDefault();
		e.stopPropagation();
		return false;
	},
	onLoadFriends: function(data) {
		if(data.code && data.code == "0") {
			if(data.data.user) {
				window.userId = data.data.user.id;
			}
			var html = "",
				users = [];
			if(data.data.acceptedUser) {
				od.friend.cache.setPersonlist([data.data.acceptedUser]);

				users.push(data.data.acceptedUser);

				//				od.friend.renderChatContent(data.data.acceptedUser['id']);
			} else {
				//				$("#J_accepted_user").hide();
			}
			var tmpu, tmpHtml;
			if(data.data.history && data.data.history.data) {
				od.friend.cache.setPersonlist(data.data.history.data);
				console.log(od.friend.cache);
				users = users.concat(data.data.history.data);
				
				var i=0,obj, users1=[];
				for(;i<users.length; i++) {
					obj = document.getElementById("user-" + users[i]['id']);
					if (!obj) {
						users1.push(users[i]);
					}
				}
				od.friend.currentPage=data.data.history.currentPage;
				od.friend.lastPage=data.data.history.lastPage;
				od.friend.ui.friends.insertAdjacentHTML('beforeend',  html + template('friends-template', {
					"record": users1
				}));
				od.friend.renderOpPopover(users1);
				od.friend.renderChatContents(users1);
			}
			
			//			od.friend.listScroll.refresh();
		} else {
			alert(data.message);
		}
		od.friend.listScroll.refresh();
	},
	bindAcceptedClickEvent: function() {
		mui("#friends").on("tap", ".app-btn-accept", od.friend.onAcceptedClick);
	},
	bindOpClickEvent: function() {
		mui(".mui-fullscreen").on("tap", ".mui-popover a", od.friend.onOpClick);
	},
	bindDropEvent: function() {
		od.friend.page = 0;
		od.friend.size = 10;
		od.friend.listScrollType = 0;
		od.friend.listScroll = new IScroll('#app-friends-wrapper',
				{
//					scrollY: true,
//					preventDefault: false, 
					probeType: 1,
                	tap: false,
                	click: false,
                	preventDefaultException: {tagName: /.*/},
                	mouseWheel: true,
                	scrollbars: true,
                	fadeScrollbars: true,
                	interactiveScrollbars: false,
                	keyBindings: false,
                	deceleration: 0.0002
				});
		document.addEventListener('touchmove', false);
        od.friend.listScroll.on('scroll', od.friend.onListScroll);
        od.friend.listScroll.on('scrollEnd', od.friend.onListScrollEnd);
        od.friend.listScroll.refresh();
	},
	/**
	 * 下拉过程
	 */
	onListScroll: function() {
		var distance = this.y - this.maxScrollY;
		console.log(this.y+"---"+distance);
		if (distance < -100) {
			od.friend.listScrollType = 1;
		}
	},
	/**
	 * 下拉结束
	 */
	onListScrollEnd: function() {
		
		console.log('scroll ended');
        console.log(this);
		console.log(this.y+"---");
		if (od.friend.listScrollType == 1 && !od.friend.lastPage) {
//			plus.webview.currentWebview().reload();
			od.friend.loadFriends();
		}
		od.friend.listScrollType = 0;
	},
	renderOpPopover: function(users) {
		if(!users || users.length == 0) {
			return;
		}
		
		od.friend.ui.body.insertAdjacentHTML('beforeend', template('opPopover-template', {
			"record": users
		}));
	},
	renderChatContents: function(users) {
		if(!users || users.length == 0) {
			return;
		}
		var user;
		for(var i = 0; i < users.length; i++) {
			user = users[i];
			var div = document.createElement("div");
			div.id = od.friend.CHAT_PAGE_ID_PRE + user['id'];
			div.className = "mui-page";
			div.innerHTML = template('chat-box-template', {
				"user": user
			});
			od.friend.ui.body.appendChild(div);
		}
		od.chat.initChats(users);
	},
	initPage: function() {
		//初始化单页view
		var viewApi = mui('#app').view({
			defaultPage: '#menu'
		});
		mui.init({
			gestureConfig: {
				tap: true, //默认为true
				doubletap: true, //默认为false
				longtap: true, //默认为false
				swipe: true, //默认为true
				drag: true, //默认为true
				hold: true, //默认为false，不监听
				release: true //默认为false，不监听
			},
//			pullRefresh: {
//				container: '#app-friends-wrapper',
//				down: {
//					callback: od.friend.pulldownRefresh
//				},
//				up: {
//					contentrefresh: '正在加载...',
//					callback: od.friend.pullupRefresh
//				}
//			}
		});
		
		//处理view的后退与webview后退
		var view = viewApi.view;
		var oldBack = mui.back;
		mui.back = function() {
			if(viewApi.canBack()) { //如果view可以后退，则执行view的后退
				viewApi.back();
			} else { //执行webview后退
				oldBack();
			}
		};
		//监听页面切换事件方案1,通过view元素监听所有页面切换事件，目前提供pageBeforeShow|pageShow|pageBeforeBack|pageBack四种事件(before事件为动画开始前触发)
		//第一个参数为事件名称，第二个参数为事件回调，其中e.detail.page为当前页面的html对象
		view.addEventListener('pageBeforeShow', function(e) {
			//				console.log(e.detail.page.id + ' beforeShow');
		});
		view.addEventListener('pageShow', function(e) {
			//				console.log(e.detail.page.id + ' beforeShow');
			var pid = e.detail.page.id,
				id = e.detail.page.id.split('-')[1];
			if(id) {
				od.chat.updateChat(id);
				od.chat.setCurrentChatUser(id);
			}
		});
		view.addEventListener('pageBeforeBack', function(e) {
			//				console.log(e.detail.page.id + ' beforeShow');
		});
		view.addEventListener('pageBack', function(e) {
			//				console.log(e.detail.page.id + ' beforeShow');
		});

	},
	pulldownRefresh: function() {
		setTimeout(function() {
			mui('#app-friends-wrapper').pullRefresh().endPulldownToRefresh(); //refresh completed
		}, 1500);
	},
	pullupRefresh: function() {
		setTimeout(function() {
			//					mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2)); //参数为true代表没有更多数据了。
			//					var table = document.body.querySelector('.mui-table-view');
			//					var cells = document.body.querySelectorAll('.mui-table-view-cell');
			//					for (var i = cells.length, len = i + 20; i < len; i++) {
			//						var li = document.createElement('li');
			//						li.className = 'mui-table-view-cell';
			//						li.innerHTML = '<a class="mui-navigate-right">Item ' + (i + 1) + '</a>';
			//						table.appendChild(li);
			//					}
			alert(1500);
			mui('#app-friends-wrapper').pullRefresh().endPullupToRefresh(false);
		}, 1500);
	},
	
	loadFriends: function() {
		var uid = plus.storage.getItem("uid");
		if(uid === undefined) {
			//			alert("请先登录");
			closeWaiting();
			return;
		}
		//		$("#content").html("");
//		od.friend.ui.friends.innerHTML = '';
		mui.ajax(
			od.host + "/oneday/willow/info/" + uid + "?currentPage="+(od.friend.currentPage+1)+"&count=1", 
			{
				type: "get",
				dataType: "json",
				success: od.friend.onLoadFriends,
				error: function(e) {
					console.log(e);
					alert("error " + e);
				},
				timeout: 10000
			}
		);
	},
	onGetUserInfoSuccess: function(data) {
		//		console.log(data);
		if(data.code && data.code != "0") {
			alert(data.message);
			return;
		}

		od.friend.cache.setPersonlist([data.data]);
	},
	refresh: function() {
		plus.webview.currentWebview().reload();
	},
	inits: function() {
		//	$.cookie('uid','3',{expires:7,path:'/'});
		//		window.uid = 7;
		//		$.cookie('sdktoken',"7",{expires:7,path:'/'});
		od.friend.cache = new Cache();
		template.config('escape', false);
		//初始化页面
		od.friend.initPage();
		//初始化聊天组件
		od.chat.inits();
		
		plus.webview.currentWebview().setStyle({
			softinputMode: "adjustResize"
		});
		//绑定相关事件
		od.friend.bindAcceptedClickEvent();
		od.friend.bindOpClickEvent();
		od.friend.bindDropEvent();
		//		od.base.currentViewId="view-list";

		//		od.friend.getUser();

		////		od.friend.bindUserClickEvent();
		//		od.friend.bindChatClickEvent();
		//		
		//		od.friend.bindSendBtnClick();
		//		od.friend.bindWebviewShowEvent();
		//		document.addEventListener('touchmove', false);
	}
}

od.chat = {
	data: {},
	MIN_SOUND_TIME: 800,
	ui: {},
	inits: function() {
		if (!od.isNull(window.nim)) {
			return;
		}
		od.chat.initEvents();
		od.chat.initSDKBridge();
	},
	initEvents: function() {
		//		$("#view-chat .chat-send").click(od.chat.onSendClick);
	},
	/**
	 * 音频播放点击事件
	 * @param {Object} uid
	 */
	bindMsgContentTap: function(uid) {
		var topObjId = od.friend.CHAT_PAGE_ID_PRE + uid;
		mui("#" + topObjId).on('tap', '.msg-content', od.chat.msgItemTap);
	},
	/**
	 * 用户头像点击事件
	 * @param {Object} uid
	 */
	bindUserTap: function(uid) {
		var topObjId = od.friend.CHAT_PAGE_ID_PRE + uid;
		mui("#" + topObjId).on('tap', '.msg-img', od.chat.onUserHeadTap);
	},
	onUserHeadTap: function(e) {
		var uid = this.getAttribute('msg-uid'),
			url;
		if(!uid) {
			return;
		}
		url = 'detail.html?uid=' + uid;
		var view = plus.webview.getWebviewById(url);
		if(!view) {
			//					view = mui.preload({
			view = mui.openWindow({
				url: url,
				id: url, //默认使用当前页面的url作为id
				styles: {
					top: '0',
					bottom: '0'
				}, //窗口参数
				extras: {} //自定义扩展参数
			});
		}

//		if(mui.os.ios) {
//			view.show(url);
//		} else {
//			//否则，使用fade-in动画，且保存变量
//			view.show(url, "fade-in", 300);
//		}
	},
	showKeyboard: function() {
		if(mui.os.ios) {
			var webView = plus.webview.currentWebview().nativeInstanceObject();
			webView.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
		} else {
			var Context = plus.android.importClass("android.content.Context");
			var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			var main = plus.android.runtimeMainActivity();
			var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
			//var view = ((ViewGroup)main.findViewById(android.R.id.content)).getChildAt(0);
			imm.showSoftInput(main.getWindow().getDecorView(), InputMethodManager.SHOW_IMPLICIT);
			//alert("ll");
		}
	},
	msgItemTap: function(event) {
		var msgType = this.parentElement.getAttribute('msg-type');
		var msgContent = this.parentElement.getAttribute('msg-url')
		if(msgType == 'audio') {
			player = plus.audio.createPlayer(msgContent);
			var playState = this.querySelector('.play-state')
			dur = Math.ceil(playState.getAttribute("msg-dur") / 1000);
			playState.innerText = '正在播放...';
			player.play(function() {
				playState.innerText = '点击播放 ' + dur + '秒';
			}, function(e) {
				playState.innerText = '点击播放' + dur + '秒';
			});
		}
	},
	initChats: function(users) {
		if(users.length <= 0) {
			return;
		}
		od.chat.initLocalMsgs(users);
		for(var i = 0; i < users.length; i++) {
			od.chat.initChat(users[i]);
			od.chat.bindMsgContentTap(users[i].id);
			od.chat.bindUserTap(users[i].id);
		}
		od.chat.updateSessionsUI(od.chat.data.sessions);
	},
	updateChat: function(id) {
		var topObjId = od.friend.CHAT_PAGE_ID_PRE + id,
			ui = od.chat.ui[id];
		ui.h.style.width = ui.boxMsgText.offsetWidth + 'px';
		ui['footerPadding'] = ui.footer.offsetHeight - ui.boxMsgText.offsetHeight;
		ui.areaMsgList.scrollTop = ui.areaMsgList.scrollHeight + ui.areaMsgList.offsetHeight;
	},
	initChat: function(user) {

		//$.plusReady=function(fn){fn();};
		var topObjId = od.friend.CHAT_PAGE_ID_PRE + user.id, isDisable=(user.candStatus==8);
		var record = [{
			sender: 'zs',
			type: 'text',
			content: 'Hi，我是 MUI 小管家！'
		}];
		var ui = {
			body: od.friend.ui.body,
			footer: document.querySelector('#' + topObjId + ' footer'),
			footerRight: document.querySelector('#' + topObjId + ' .footer-right'),
			footerLeft: document.querySelector('#' + topObjId + ' .footer-left'),
			btnMsgType: document.querySelector('#' + topObjId + ' .msg-type'),
			boxMsgText: document.querySelector('#' + topObjId + ' .msg-text'),
			boxMsgSound: document.querySelector('#' + topObjId + ' .msg-sound'),
			btnMsgImage: document.querySelector('#' + topObjId + ' .msg-image'),
			areaMsgList: document.querySelector('#' + topObjId + ' .msg-list'),
			boxSoundAlert: document.querySelector('#' + topObjId + ' .sound-alert'),
			h: document.querySelector('#' + topObjId + ' .h'),
			content: document.querySelector('#' + topObjId + ' .mui-page-content'),
			imageViewer: null
		};
		od.chat.ui[user['id']] = ui;
		ui.imageViewer = new mui.ImageViewer('#' + topObjId + ' .msg-content-image', {
			dbl: false
		});
		//		ui.h.style.width = ui.boxMsgText.offsetWidth + 'px';
		//alert(ui.boxMsgText.offsetWidth );
		var footerPadding = 0;
		if(ui.footer.offsetHeight) {
			footerPadding = ui.footer.offsetHeight - ui.boxMsgText.offsetHeight;
		}
		var bindMsgList = function() {
			//绑定数据:
			/*tp.bind({
				template: 'msg-template',
				element: 'msg-list',
				model: record
			});*/
			ui.areaMsgList.innerHTML = template('msg-template', {
				"record": record
			});
			//			var msgItems = ui.areaMsgList.querySelectorAll('.msg-item');
			//			[].forEach.call(msgItems, function(item, index) {
			//				item.addEventListener('tap', function(event) {
			//					od.chat.msgItemTap(item, event);
			//				}, false);
			//			});
			ui.imageViewer.findAllImage();
			ui.areaMsgList.scrollTop = ui.areaMsgList.scrollHeight + ui.areaMsgList.offsetHeight;
		};
		//		bindMsgList();
		window.addEventListener('resize', function() {
			ui.areaMsgList.scrollTop = ui.areaMsgList.scrollHeight + ui.areaMsgList.offsetHeight;
		}, false);
		var send = function(msg) {
			record.push(msg);
			bindMsgList();
			toRobot(msg.content);
		};
		var toRobot = function(info) {
			var apiUrl = 'http://www.tuling123.com/openapi/api';
			mui.getJSON(apiUrl, {
				"key": 'acfbca724ea1b5db96d2eef88ce677dc',
				"info": info,
				"userid": plus.device.uuid
			}, function(data) {
				//alert(JSON.stringify(data));
				record.push({
					sender: 'zs',
					type: 'text',
					content: data.text
				});
				bindMsgList();
			});
		};

		function msgTextFocus() {
			ui.boxMsgText.focus();
			setTimeout(function() {
				ui.boxMsgText.focus();
			}, 150);
		}
		
		
		//已经结束，则直接返回
		if (isDisable) {
			return;
		}
		
		
		//解决长按“发送”按钮，导致键盘关闭的问题；
		ui.footerRight.addEventListener('touchstart', function(event) {
			if(ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
				msgTextFocus();
				event.preventDefault();
			}
		});
		//解决长按“发送”按钮，导致键盘关闭的问题；
		ui.footerRight.addEventListener('touchmove', function(event) {
			if(ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
				msgTextFocus();
				event.preventDefault();
			}
		});
		//					ui.footerRight.addEventListener('touchcancel', function(event) {
		//						if (ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
		//							msgTextFocus();
		//							event.preventDefault();
		//						}
		//					});
		//					ui.footerRight.addEventListener('touchend', function(event) {
		//						if (ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
		//							msgTextFocus();
		//							event.preventDefault();
		//						}
		//					});
		ui.footerRight.addEventListener('release', function(event) {
			if(ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
				//showKeyboard();
				ui.boxMsgText.focus();
				setTimeout(function() {
					ui.boxMsgText.focus();
				}, 150);
				//							event.detail.gesture.preventDefault();

				//				send({
				//					sender: 'self',
				//					type: 'text',
				//					content: ui.boxMsgText.value.replace(new RegExp('\n', 'gm'), '<br/>')
				//				});
				od.chat.send({
					scene: 'p2p',
					to: od.chat.currentChatUser,
					text: ui.boxMsgText.value.replace(new RegExp('\n', 'gm'), '<br/>'),
					done: od.chat.onSendMsgDone
				});
				ui.boxMsgText.value = '';
				mui.trigger(ui.boxMsgText, 'input', null);
			} else if(ui.btnMsgType.classList.contains('mui-icon-mic')) {
				ui.btnMsgType.classList.add('mui-icon-compose');
				ui.btnMsgType.classList.remove('mui-icon-mic');
				ui.boxMsgText.style.display = 'none';
				ui.boxMsgSound.style.display = 'block';
				ui.boxMsgText.blur();
				document.body.focus();
			} else if(ui.btnMsgType.classList.contains('mui-icon-compose')) {
				ui.btnMsgType.classList.add('mui-icon-mic');
				ui.btnMsgType.classList.remove('mui-icon-compose');
				ui.boxMsgSound.style.display = 'none';
				ui.boxMsgText.style.display = 'block';
				//--
				//showKeyboard();
				ui.boxMsgText.focus();
				setTimeout(function() {
					ui.boxMsgText.focus();
				}, 150);
			}
		}, false);
		ui.footerLeft.addEventListener('tap', function(event) {
			var btnArray = [{
				title: "拍照"
			}, {
				title: "从相册选择"
			}];
			plus.nativeUI.actionSheet({
				title: "选择照片",
				cancel: "取消",
				buttons: btnArray
			}, function(e) {
				var index = e.index;
				switch(index) {
					case 0:
						break;
					case 1:
						var cmr = plus.camera.getCamera();
						cmr.captureImage(function(path) {
							//							send({
							//								sender: 'self',
							//								type: 'image',
							//								content: "file://" + plus.io.convertLocalFileSystemURL(path)
							//							});
							var url = "file://" + plus.io.convertLocalFileSystemURL(path);
							var suffix = url.substring(url.lastIndexOf('.') + 1);
							plus.zip.compressImage({
									src: url,
									dst: "_doc/tmp." + suffix,
									overwrite: true,
									quality: 20
								},
								function(event) {
									var target = event.target;
									console.log("Compress success!", event);
									var bitmap = new plus.nativeObj.Bitmap("test");
									bitmap.load(target, function() {
										var base64 = bitmap.toBase64Data();
										od.chat.send({
											scene: 'p2p',
											type: 'image',
											to: od.chat.currentChatUser,
											dataURL: base64,
											//								blob: bl,
											uploadprogress: function(obj) {
												console.log('文件总大小: ' + obj.total + 'bytes');
												console.log('已经上传的大小: ' + obj.loaded + 'bytes');
												console.log('上传进度: ' + obj.percentage);
												console.log('上传进度文本: ' + obj.percentageText);
											},
											uploaddone: function(error, file) {
												console.log(error);
												console.log(file);
												console.log('上传' + (!error ? '成功' : '失败'));
											},
											beforesend: function(msg) {
												console.log('正在发送p2p image消息, id=' + msg.idClient);
												//												pushMsg(msg);
												od.chat.onSendMsgDone(null, msg);
											},
											done: od.chat.onSendFileDone
										});
										console.log('加载图片：' + base64);
									}, function(e) {
										console.log('加载图片失败：' + JSON.stringify(e));
										mui.toast("加载图片失败");
									});
								},
								function(error) {
									console.log("Compress error!", error);
									mui.toast("压缩图片失败");
								});

						}, function(err) {
							mui.toast("加载图片失败");
						});
						break;
					case 2:
						plus.gallery.pick(function(path) {
							//							send({
							//								sender: 'self',
							//								type: 'image',
							//								content: path
							//							});
							var url = "file://" + plus.io.convertLocalFileSystemURL(path);
							var suffix = url.substring(url.lastIndexOf('.') + 1);
							plus.zip.compressImage({
									src: url,
									dst: "_doc/tmp." + suffix,
									overwrite: true,
									quality: 20
								},
								function(event) {
									var target = event.target;
									console.log("Compress success!", event);
									var bitmap = new plus.nativeObj.Bitmap("test");
									bitmap.load(target, function() {
										var base4 = bitmap.toBase64Data();
										od.chat.send({
											scene: 'p2p',
											type: 'image',
											to: od.chat.currentChatUser,
											dataURL: base4,
											//								blob: bl,
											uploadprogress: function(obj) {
												console.log('文件总大小: ' + obj.total + 'bytes');
												console.log('已经上传的大小: ' + obj.loaded + 'bytes');
												console.log('上传进度: ' + obj.percentage);
												console.log('上传进度文本: ' + obj.percentageText);
											},
											uploaddone: function(error, file) {
												console.log(error);
												console.log(file);
												console.log('上传' + (!error ? '成功' : '失败'));
											},
											beforesend: function(msg) {
												console.log('正在发送p2p image消息, id=' + msg.idClient);
												//												pushMsg(msg);
												od.chat.onSendMsgDone(null, msg);
											},
											done: od.chat.onSendFileDone
										});
										console.log('加载图片：' + base4);
									}, function(e) {
										console.log('加载图片失败：' + JSON.stringify(e));
										mui.toast("加载图片失败");
									});
								},
								function(error) {
									console.log("Compress error!", error);
									mui.toast("压缩图片失败");
								}
							);

						}, function(err) {
							mui.toast("加载图片失败");
						}, null);
						break;
				}
			});
		}, false);
		var setSoundAlertVisable = function(show) {
			if(show) {
				ui.boxSoundAlert.style.display = 'block';
				ui.boxSoundAlert.style.opacity = 1;
			} else {
				ui.boxSoundAlert.style.opacity = 0;
				//fadeOut 完成再真正隐藏
				setTimeout(function() {
					ui.boxSoundAlert.style.display = 'none';
				}, 200);
			}
		};
		var recordCancel = false;
		var recorder = null;
		var audio_tips = document.querySelector('#' + topObjId + ' .audio_tips');
		var startTimestamp = null;
		var stopTimestamp = null;
		var stopTimer = null;
		ui.boxMsgSound.addEventListener('hold', function(event) {
			recordCancel = false;
			if(stopTimer) clearTimeout(stopTimer);
			audio_tips.innerHTML = "手指上划，取消发送";
			ui.boxSoundAlert.classList.remove('rprogress-sigh');
			setSoundAlertVisable(true);
			recorder = plus.audio.getRecorder();
			if(recorder == null) {
				plus.nativeUI.toast("不能获取录音对象");
				return;
			}
			startTimestamp = (new Date()).getTime();
			recorder.record({
				filename: "_doc/audio/"
			}, function(path) {
				if(recordCancel) return;

				var url = "file://" + plus.io.convertLocalFileSystemURL(path);
				var suffix = url.substring(url.lastIndexOf('.') + 1);
				plus.io.resolveLocalFileSystemURL(url, function(entry) {
					entry.file(function(file) {
						var reader = new plus.io.FileReader();
						reader.onloadend = function(e) {
							console.log(e.target.result);

							od.chat.send({
								scene: 'p2p',
								type: 'audio',
								to: od.chat.currentChatUser,
								dataURL: e.target.result,
								//								blob: bl,
								uploadprogress: function(obj) {
									console.log('文件总大小: ' + obj.total + 'bytes');
									console.log('已经上传的大小: ' + obj.loaded + 'bytes');
									console.log('上传进度: ' + obj.percentage);
									console.log('上传进度文本: ' + obj.percentageText);
								},
								uploaddone: function(error, file) {
									console.log(error);
									console.log(file);
									console.log('上传' + (!error ? '成功' : '失败'));
								},
								beforesend: function(msg) {
									console.log('正在发送p2p audio消息, id=' + msg.idClient);
									//												pushMsg(msg);
									od.chat.onSendMsgDone(null, msg);
								},
								done: od.chat.onSendFileDone
							});

						};
						reader.readAsDataURL(file);
					}, function(e) {
						mui.toast("读写出现异常: " + e.message);
					})
				})

				//				send({
				//					sender: 'self',
				//					type: 'audio',
				//					content: path
				//				});
			}, function(e) {
				plus.nativeUI.toast("录音时出现异常: " + e.message);
			});
		}, false);
		ui.body.addEventListener('drag', function(event) {
			//console.log('drag');
			if(Math.abs(event.detail.deltaY) > 50) {
				if(!recordCancel) {
					recordCancel = true;
					if(!audio_tips.classList.contains("cancel")) {
						audio_tips.classList.add("cancel");
					}
					audio_tips.innerHTML = "松开手指，取消发送";
				}
			} else {
				if(recordCancel) {
					recordCancel = false;
					if(audio_tips.classList.contains("cancel")) {
						audio_tips.classList.remove("cancel");
					}
					audio_tips.innerHTML = "手指上划，取消发送";
				}
			}
		}, false);
		ui.boxMsgSound.addEventListener('release', function(event) {
			//console.log('release');
			if(audio_tips.classList.contains("cancel")) {
				audio_tips.classList.remove("cancel");
				audio_tips.innerHTML = "手指上划，取消发送";
			}
			//
			stopTimestamp = (new Date()).getTime();
			if(stopTimestamp - startTimestamp < od.chat.MIN_SOUND_TIME) {
				audio_tips.innerHTML = "录音时间太短";
				ui.boxSoundAlert.classList.add('rprogress-sigh');
				recordCancel = true;
				stopTimer = setTimeout(function() {
					setSoundAlertVisable(false);
				}, 800);
			} else {
				setSoundAlertVisable(false);
			}
			recorder.stop();
		}, false);
		ui.boxMsgSound.addEventListener("touchstart", function(e) {
			//console.log("start....");
			e.preventDefault();
		});
		ui.boxMsgText.addEventListener('input', function(event) {
			ui.btnMsgType.classList[ui.boxMsgText.value == '' ? 'remove' : 'add']('mui-icon-paperplane');
			ui.btnMsgType.setAttribute("for", ui.boxMsgText.value == '' ? '' : 'msg-text');
			ui.h.innerText = ui.boxMsgText.value.replace(new RegExp('\n', 'gm'), '\n-') || '-';
			ui.footer.style.height = (ui.h.offsetHeight + od.chat.ui[user.id]['footerPadding']) + 'px';
			ui.content.style.paddingBottom = ui.footer.style.height;
		});
		var focus = false;
		ui.boxMsgText.addEventListener('tap', function(event) {
			ui.boxMsgText.focus();
			setTimeout(function() {
				ui.boxMsgText.focus();
			}, 0);
			focus = true;
			setTimeout(function() {
				focus = false;
			}, 1000);
			event.detail.gesture.preventDefault();
		}, false);
		//点击消息列表，关闭键盘
		ui.areaMsgList.addEventListener('click', function(event) {
			if(!focus) {
				ui.boxMsgText.blur();
			}
		})

	},

	/**
	 * 绑定会话下拉框事件
	 * @param {Object} uid
	 *
	 **/
	//	bindChatDropEvent: function(uid) {
	//		if(od.friend.chatScrollArr[uid]) {
	//			od.friend.chatScrollArr[uid].refresh();
	//		} else {
	//			od.friend.chatScrollArr[uid] = new IScroll('#chat-cont-' + uid + " .chat-wrapper", {
	//				probeType: 1,
	//				tap: true,
	//				click: false,
	//				preventDefaultException: {
	//					tagName: /.*/
	//				},
	//				mouseWheel: true,
	//				scrollbars: true,
	//				fadeScrollbars: true,
	//				interactiveScrollbars: false,
	//				keyBindings: false,
	//				deceleration: 0.0002
	//			});
	//		}
	//
	//	},
	initLocalMsgs: function(users) {
		if(!users || users.length <= 0) return;
		var user, i=0, timestamp=Date.parse(new Date());
		for(;i<users.length;i++) {
			user = users[i];
			od.chat.initLocalMsgsByUser(user.id, 50, timestamp);
		}
	},
	initSDKBridge: function() {
		var sdktoken = plus.storage.getItem("sdktoken"),
			userUID = plus.storage.getItem("uid"),
			that = this;

		if(!userUID) {
			//       	alert("请先登录");
			return;
		}
		if(!sdktoken) {
			alert("用户异常");
			return;
		}

		window.nim = new NIM({
			//控制台日志，上线时应该关掉
			debug: true || {
				api: 'info',
				style: 'font-size:14px;color:blue;background-color:rgba(0,0,0,0.1)'
			},
			db: true,
			autoMarkRead: true,
			//应用的appkey
			appKey: 'ac630ecf21c416ad6b20784d64fdc1b8',
			//云信账号
			account: userUID,
			//云信token
			token: sdktoken,
			//连接
			onconnect: od.chat.onConnect,
			//断开连接
			ondisconnect: od.chat.onDisconnect,
			//错误
			onerror: od.chat.onError,
			//
			onwillreconnect: od.chat.onwillreconnect,
			//同步最近会话列表回调, 会传入会话列表, 按时间正序排列, 即最近聊过天的放在列表的最后面
			onsessions: od.chat.onSessions,
			//会话更新
			onupdatesession: od.chat.onUpdateSession,
			//同步漫游消息,每个会话对应一个回调, 会传入消息数组
			onroamingmsgs: od.chat.onRoamingMsgs,
			//同步离线消息,每个会话对应一个回调, 会传入消息数组
			onofflinemsgs: od.chat.onOfflineMsgs,
			//收到消息
			onmsg: od.chat.onMsg
		});
	},
	onSessions: function(sessions) {
		console.log('收到会话列表', sessions);
		od.chat.data.sessions = nim.mergeSessions(od.chat.data.sessions, sessions);
		od.chat.updateSessionsUI(sessions);
	},
	onUpdateSession: function(session) {
		console.log('会话更新了', session);
		od.chat.data.sessions = nim.mergeSessions(od.chat.data.sessions, session);
		od.chat.updateSessionsUI([session]);
	},
	updateSessionsUI: function(sessions) {
		// 刷新界面
		console.log('刷新界面');
		if (od.isNull(sessions)) {
			return;
		}
		var session;
		for(var i = 0; i < sessions.length; i++) {
			session = sessions[i];
			if(!session) continue;
			if(session["unread"] > 0) {
				od.chat.refreshUnread(session['to'], session["unread"]);
			}
			od.chat.refreshLastMsg(session['to'], session["lastMsg"]);
		}
	},
	/**
	 * 更新未读数量
	 * @param {Object} uid
	 * @param {Object} msg
	 */
	refreshLastMsg: function(uid, msg) {
		if(!uid) {
			return;
		}
		if(msg == null || msg.length <= 0) {
			return;
		}
		//		var hisu = $("#his-u-" + uid) ;
		var lastMsgObj = document.querySelector("#user-" + uid + " .mui-ellipsis"),
			lastTimeObj = document.querySelector("#user-" + uid + " .last-msg-time"),
			content = '';
		if(!lastMsgObj) {
			return;
		}
		switch(msg.type) {
			case 'text':
				content = msg.text;
				break;
			case 'image':
				//图片
				content = '[图片]';
				break;
			case 'audio':
				//音频
				content = '[音频]';
				break;
			case 'video':
				//视频
				content = '[视频]';
				break;
			case 'file':
				//文件
				content = '[文件]';
				break;
			case 'geo':
				//地理位置
				content = '[位置]';
				break;
			case 'custom':
				// 自定义消息
				break;
			case 'tip':
				// 提醒
				break;
			case 'notification':
				// 群通知
				break;
			default:
				break;
		}

		lastMsgObj.innerHTML = content;
		lastTimeObj.innerHTML = od.chat.getLastTimeStr(msg.time);
		//		obj.style.display = "block";
	},
	getLastTimeStr: function(timestamp) {
		if(!timestamp) {
			return;
		}
		var time = new Date(timestamp),
			time1 = new Date(time.toLocaleDateString()).getTime(),
			today = new Date(new Date().toLocaleDateString()).getTime();
		if(today == time1) {
			return time.getHours() + ":" + time.getMinutes();
		} else {
			var month = '' + (time.getMonth() + 1),
				day = '' + time.getDate(),
				year = time.getFullYear();
			if(month.length < 2) month = '0' + month;
			if(day.length < 2) day = '0' + day;
			return [year, month, day].join('-');;
		}
	},
	/**
	 * 更新未读数量
	 * @param {Object} uid
	 * @param {Object} count
	 */
	refreshUnread: function(uid, count) {
		if(!uid) {
			return false;
		}
		if(count == null || count <= 0) {
			return od.chat.clearUnread(uid);
		}
		//		var hisu = $("#his-u-" + uid) ;
		var hisu = document.querySelector("#user-" + uid + " .mui-badge");
		if (hisu) {
			hisu.innerHTML = count;
			hisu.style.display = "block";
			return true;
		} else {
			return false;
		}
		
	},
	/**
	 * 
	 * @param {Object} uid
	 */
	clearUnread: function(uid) {
		var hisu = document.querySelector("#user-" + uid + " .mui-badge");
		if (hisu) {
			hisu.innerHTML = "";
			hisu.style.display = "none";
			return true;
		} else {
			return false;
		}
		
	},
	/**
	 * 设置当前session
	 * @param {Object} uid
	 */
	setCurrentSession: function(uid) {
		if(!uid || !nim) return;
		nim.setCurrSession("p2p-" + uid);
	},
	/**
	 * 根据用户获取历史信息
	 * @param {Object} uid
	 * @param {Object} limit
	 */
	initLocalMsgsByUser: function(uid, limit, endTime) {
		if(!uid) return;
		var sessionId = "p2p-" + uid;
		if(od.isNull(nim)) {
			return;
		}
		var chatObj = mui("#" + od.friend.CHAT_PAGE_ID_PRE + uid);
		if(chatObj.length <= 0) {
			return;
		}
		if(!limit) {
			limit = 100;
		}
		nim.getLocalMsgs({
			sessionId: sessionId,
			limit: limit,
			desc: false,
			end: endTime,
			done: od.chat.getLocalMsgsDone
		})
	},
	getLocalMsgsDone: function(error, obj) {
		console.log('获取本地消息' + (!error ? '成功' : '失败'), error, obj);
		if(error) return;
		if(!obj.msgs || obj.msgs.length <= 0) {
			return;
		}
		var i = 0,
			msg, fuid;
		fuid = obj.sessionId.split("-")[1];
		if(!fuid) return;

		od.chat.refreshUserUI(fuid, obj.msgs, true);

	},

	onSendMsgDone: function(error, msg) {
		console.log(error);
		console.log(msg);
		console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error ? '成功' : '失败') + ', id=' + msg.idClient);
		od.chat.pushMsg(msg);
		od.chat.refreshUserUI(msg.to, [msg]);
		//		$("#chat-cont-" + od.chat.currentChatUser + " .messages").val("");
	},
	onSendFileDone: function(error, msg) {
		console.log(error);
		console.log(msg);
		console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error ? '成功' : '失败') + ', id=' + msg.idClient);
		//		od.chat.pushMsg(msg);
		//		od.chat.refreshUserUI(msg.to, [msg]);
		//		$("#chat-cont-" + od.chat.currentChatUser + " .messages").val("");
	},
	deleteMsgDone: function(error) {
		console.log('撤回消息' + (!error ? '成功' : '失败'), error);
	},
	//发送信息
	send: function(msg) {
		if(!msg) return;
		var res;

		console.log('正在发送消息, ', msg);

		switch(msg.type) {
			case 'text':
				res = nim.sendText(msg);
				break;
			case 'image':
				//图片
				res = nim.sendFile(msg);
				break;
			case 'audio':
				//音频
				res = nim.sendFile(msg);
				break;
			case 'video':
				//视频
				res = nim.sendFile(msg);
				break;
			case 'file':
				//文件
				res = nim.sendFile(msg);
				break;
			case 'geo':
				//地理位置
				break;
			case 'custom':
				// 自定义消息
				break;
			case 'tip':
				// 提醒
				break;
			case 'notification':
				// 群通知
				break;
			default:
				res = nim.sendText(msg);
				break;
		}

	},
	//发送提醒消息
	sendTipMsg: function(account, content) {
		var msg = nim.sendTipMsg({
			scene: 'p2p',
			to: account,
			tip: content,
			done: od.chat.onSendMsgDone
		});
		console.log('正在发送p2p提醒消息, id=' + msg.idClient);
		od.chat.pushMsg(msg);
	},
	//撤回消息
	delete: function(content) {
		nim.deleteMsg({
			msg: content,
			done: od.chat.deleteMsgDone
		})
		console.log('正在撤回消息', content)

		function deleteMsgDone(error) {
			console.log('撤回消息' + (!error ? '成功' : '失败'), error);
		}
	},
	onConnect: function() {
		console && console.log('连接成功');
		//初始化朋友列表
		od.friend.loadFriends();
	},
	onError: function(e) {
		console && console.log('失败onError', e);
		//初始化朋友列表
		od.friend.loadFriends();
	},
	onwillreconnect: function(e) {
		console && console.log('onwillreconnect', e);
	},
	onDisconnect: function(error) {
		var that = this;
		console.log('连接断开');
		if(error) {
			switch(error.code) {
				// 账号或者密码错误, 请跳转到登录页面并提示错误
				case 302:
					alert(error.message);
					//              delCookie('uid');
					//              delCookie('sdktoken');
					//              window.location.href = './index.html'; 
					break;
					// 被踢, 请提示错误后跳转到登录页面
				case 'kicked':
					var map = {
						PC: "电脑版",
						Web: "网页版",
						Android: "手机版",
						iOS: "手机版",
						WindowsPhone: "手机版"
					};
					var str = error.from;
					alert("你的帐号于" + dateFormat(+new Date(), "HH:mm") + "被" + (map[str] || "其他端") + "踢出下线，请确定帐号信息安全!");
					//              delCookie('uid');
					//              delCookie('sdktoken');
					//跳转至登录页面
					//              window.location.href = './index.html';     
					break;
				default:
					break;
			}
		}
	},
	onRoamingMsgs: function(obj) {
		console.log('收到漫游消息', obj);
		//		od.chat.pushMsg(obj.msgs);
		od.chat.refreshUserUI(obj.to, obj.msgs);
	},
	onOfflineMsgs: function(obj) {
		console.log('收到离线消息', obj);
		//		od.chat.pushMsg(obj.msgs);
		od.chat.refreshUserUI(obj.to, obj.msgs);
	},
	onMsg: function(msg) {
		console.log('收到消息', msg.scene, msg.type, msg);
		//		od.chat.pushMsg(msg);
		od.chat.refreshUserUI(obj.to, obj.msgs);
	},
	refreshUserUI: function(id, msgs, isHistory) {
		if(msgs.length <= 0) {
			return true;
		}
		var ui = od.chat.ui[id];
		if (!ui) {
			return false;
		}
		var i = 0,
			head = plus.storage.getItem('head'),
			friend = od.friend.cache.getUserById(id);
		for(; i < msgs.length; i++) {
			if(msgs[i].type == 'audio') {
				msgs[i].file['duration'] = Math.ceil(msgs[i].file.dur / 1000);
			}
			if(msgs[i].flow == 'out') {
				msgs[i].head = head;
			} else {
				msgs[i].head = friend['head'];
			}
		}
		
		if(isHistory) {
			ui.areaMsgList.insertAdjacentHTML('afterbegin', template('msg-template', {
				"record": msgs
			}));
		} else {
			ui.areaMsgList.insertAdjacentHTML('beforeend', template('msg-template', {
				"record": msgs
			}));
		}
		ui.imageViewer.findAllImage();
		ui.areaMsgList.scrollTop = ui.areaMsgList.scrollHeight + ui.areaMsgList.offsetHeight;
	},
	//	refreshUI: function(msg, isHistory) {
	//
	//		if(msg instanceof Array) {
	//			for(var i = 0; i < msg.length; i++) {
	//				switch(msg[i].type) {
	//					case 'custom':
	//						od.chat.onCustomMsg(msg[i]);
	//						break;
	//					case 'text':
	//						od.chat.refreshTextUI(msg[i], isHistory);
	//						break;
	//					case 'notification':
	//						// 处理群通知消息
	//						//		        onTeamNotificationMsg(msg);
	//						break;
	//					default:
	//						break;
	//				}
	//			}
	//		} else {
	//			switch(msg.type) {
	//				case 'custom':
	//					od.chat.onCustomMsg(msg);
	//					break;
	//				case 'text':
	//					od.chat.refreshTextUI(msg, isHistory);
	//					break;
	//				case 'notification':
	//					// 处理群通知消息
	//					//		        onTeamNotificationMsg(msg);
	//					break;
	//				default:
	//					break;
	//			}
	//		}
	//
	//	},
	onCustomMsg: function(obj) {
		console.log('收到onCustomMsg消息', obj);
	},
	pushMsg: function(msgs) {
		if(!Array.isArray(msgs)) {
			msgs = [msgs];
		}
		var uid = msgs[0].target;
		od.chat.data.msgs = od.chat.data.msgs || {};
		od.chat.data.msgs[uid] = nim.mergeMsgs(od.chat.data.msgs[uid], msgs);
//		var res = od.chat.refreshUserUI(uid, obj.msgs);
//		if (!res) {
//			od.chat.data.msgs[uid] = msgs;
//		}
		
	},
	//	refreshTextUI: function(msg, isHistory) {
	//		if(!msg) {
	//			return;
	//		}
	//		var userUID = od.uid;
	//		if(msg.from === userUID) {
	//			//			var html = '<div class="chat-recordboxme"><div class="user"><img src="img/helloh5.jpg"/></div><div class="chat-recordtextbg">&nbsp;</div><div class="chat-recordtext"><h3>';
	//			//			html += msg.text;
	//			//			html += '</h3></div></div>';
	//			msg["head"] = od.head;
	//			var htmlTemplate = '<div class="chat-recordboxme" d-time="{time}"><div class="user" onclick="clicked(\'detail.html?uid={from}\')"><img src="{head}"/></div><div class="chat-recordtextbg">&nbsp;</div><div class="chat-recordtext"><h3>{text}</h3></div></div>';
	//
	//			if(isHistory) {
	//				$("#chat-cont-" + msg.to + " .chat-scroller").prepend(formatTemplate(msg, htmlTemplate)).scrollTop(99999);
	//			} else {
	//				$("#chat-cont-" + msg.to + " .chat-scroller").append(formatTemplate(msg, htmlTemplate)).scrollTop(99999);
	//			}
	//			od.chat.refreshUIScroll(msg.to, isHistory);
	//		} else if(msg.to === userUID) {
	//			//			var html1 = '<div class="chat-recordbox"><div class="user"><img src="img/helloh5.jpg"/></div><div class="chat-recordtextbg">&nbsp;</div><div class="chat-recordtext"><h3>';
	//			//			html1 += msg.text;
	//			//			html1 += '</h3></div></div>';
	//			var user = od.friend.cache.getUserById(msg.from);
	//			if(user) {
	//				msg["head"] = user['head'];
	//			}
	//			var htmlTemplate1 = '<div class="chat-recordbox" d-time="{time}"><div class="user" onclick="clicked(\'detail.html?uid={from}\')"><img src="{head}"/></div><div class="chat-recordtextbg">&nbsp;</div><div class="chat-recordtext"><h3>{text}</h3></div></div>';
	//
	//			if(isHistory) {
	//				$("#chat-cont-" + msg.from + " .chat-scroller").prepend(formatTemplate(msg, htmlTemplate1)).scrollTop(99999);
	//			} else {
	//				$("#chat-cont-" + msg.from + " .chat-scroller").append(formatTemplate(msg, htmlTemplate1)).scrollTop(99999);
	//			}
	//			od.chat.refreshUIScroll(msg.from, isHistory);
	//		}
	//
	//	},
	//	refreshUIScroll: function(uid, scrollToBottom) {
	//		var chatScroll = od.friend.chatScrollArr[uid];
	//		if(chatScroll) {
	//			chatScroll.refresh();
	//			//			if (!scrollToBottom) {
	//			//				chatScroll.scrollTo(0, chatScroll.maxScrollY);
	//			//			}
	//			chatScroll.scrollTo(0, chatScroll.maxScrollY);
	//		}
	//	},
	//	onSendClick: function(e) {
	//		var message = $(this).siblings(".messages").val();
	//		console.log(message);
	//		if(!message) {
	//			return;
	//		}
	//		od.chat.send(od.chat.currentChatUser, message);
	//	},
	setCurrentChatUser: function(uid) {
		od.chat.currentChatUser = uid;
		od.chat.setCurrentSession(uid);
		od.chat.clearUnread(uid);
	},
	//	forward: function() {
	//		if(nim) {
	//			nim.resetCurrSession();
	//		}
	//		od.base.forward('view-list', 'right');
	//	}
}
mui.plusReady(function() {
	od.friend.inits();
});
//od.friend.inits();
