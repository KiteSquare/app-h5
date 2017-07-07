od = window.od || {};
od.addtopic = {
	inits: function() {
		mui.init();
		od.addtopic.bindInfoDetailEvent();
		od.addtopic.bindAddImageTap();
		od.addtopic.bindSubmitTap();
	},
	bindInfoDetailEvent: function() {
		var detailObj = document.getElementById('info-detail')
		od.addtopic.makeExpandingArea(detailObj);
	},
	bindAddImageTap: function() {
		mui("#content").on("tap", "#add-image", od.addtopic.onAddImageTap);
	},
	bindSubmitTap: function() {
		mui("#content").on("tap", "#create", od.addtopic.onSubmitTap);
		mui(".mui-bar").on("tap", "#create0", od.addtopic.onSubmitTap);
	},
	onSubmitTap: function(e) {
		var accessToken = od.base.getAccessToken(),
			title = document.getElementById("title").value,
			content = document.getElementById("tcontent").value;
		if(od.isNull(accessToken)) {
			mui.toast("请先登录哦");
			return;
		}
		if(od.isNull(title) || title.length == 0) {
			mui.toast("请输入标题");
			return;
		}
		if(title.length <= 5) {
			mui.toast("标题不能少于5个字哦");
			return;
		}
		if(od.isNull(content) || content.length == 0) {
			mui.toast("请输入内容");
			return;
		}
		if(content.length <= 5) {
			mui.toast("内容太少了，再写点吧");
			return;
		}
		plus.nativeUI.showWaiting( "正在上传");
		accessToken = accessToken.replace(/\n/g, "");
		var param = {
			"accessToken": accessToken,
			"title": title,
			"content": content,
			"category": 1,
		}
		var lat = plus.storage.getItem("lat");
		if (lat) {
			param["lat"] = lat;
			param["lon"] = plus.storage.getItem("lon");
			param["cityCode"] = plus.storage.getItem("cityCode");
			param["city"] = plus.storage.getItem("city");
		}
		var list = mui("#image-list img");
		od.addtopic.images = [];
		if(list && list.length > 0) {

			var i = 0,
				length = list.length,
				imgObj;
			for(; i < length; i++) {
				imgObj = list[i];

				var task = plus.uploader.createUpload(od.host + "/sr/upload", {
					method: "POST"
				}, function(response, status) {
					//					alert(response);
					console.log(response);
					if(status != 200) {
						od.base.onError("FAILED_NETWORK");
						return;
					}
					var data = JSON.parse(response.responseText);
					//			if(callback) {
					//				callback(data);
					//			}
					if(!data.code || data.code != "0") {
						mui.toast(data.message);
						return;
					}
					var url = data.data;
					if(url.indexOf("http") != 0) {
						url = od.host + "/" + url;
					}
					od.addtopic.images.push(url);
				});

				task.addFile(imgObj.src, {
					key: "image" + i
				});
				task.setRequestHeader("accessToken", accessToken);
				task.start();
			}
			od.addtopic.checkUploadAndAddTopick(param);

		} else {
			mui.ajax(
				od.host + "/topic/create", {
					type: "post",
					dataType: "json",
					contentType: "application/json",
					data: JSON.stringify(param),
					success: od.addtopic.onCreateTopicSuccess,
					error: function(e) {
						od.base.onError("FAILED_NETWORK");
					},
					timeout: 10000
				}
			);
		}

	},
	checkUploadAndAddTopick: function(param) {
		mui.later(function() {
			plus.uploader.enumerate(function(tasks) {
				console.log(tasks);
				var state = true,
					i = 0;
				for(; i < tasks.length; i++) {
					if(tasks[i].state != 4) {
						state = false;
					}
				}

				if(state) {
					param['images'] = od.addtopic.images.join(",");
					mui.ajax(
						od.host + "/topic/create", {
							type: "post",
							dataType: "json",
							contentType: "application/json",
							data: JSON.stringify(param),
							success: od.addtopic.onCreateTopicSuccess,
							error: function(e) {
								od.base.onError("FAILED_NETWORK");
								plus.nativeUI.closeWaiting();
							},
							timeout: 10000
						}
					);
				} else {
					od.addtopic.checkUploadAndAddTopick(param);
				}
			}, 2);
		}, 300);

	},
	onCreateTopicSuccess: function(data) {
		plus.nativeUI.closeWaiting();
		if(data.code && data.code != "0") {
			mui.toast(data.message);
			return;
		}
		mui.toast("添加成功");
		plus.webview.currentWebview().close();
	},
	onAddImageTap: function(e) {
		if(mui.os.plus) {
			var a = [{
				title: "拍照"
			}, {
				title: "从手机相册选择"
			}];
			plus.nativeUI.actionSheet({
				title: "上传图片",
				cancel: "取消",
				buttons: a
			}, function(b) {
				switch(b.index) {
					case 0:
						break;
					case 1:
						od.addtopic.uploadImageFromCapture();
						break;
					case 2:
						od.addtopic.uploadImageFromgallery();
						break;
					default:
						break
				}
			})
		}
	},
	uploadImageFromCapture: function() {
		var c = plus.camera.getCamera();
		c.captureImage(function(e) {

			plus.io.resolveLocalFileSystemURL(e, function(entry) {
				var s = entry.toLocalURL() + "?version=" + new Date().getTime();
				console.log(s);
				//				document.getElementById("head-img").src = s;
				od.addtopic.createDisplayImage(s);
			}, function(e) {
				mui.toast("读取拍照文件错误：" + e.message);
			});
		}, function(s) {
			console.log("error" + s);
		}, {
			filename: "_doc/tempUpload.jpg"
		});
	},
	uploadImageFromgallery: function() {
		plus.gallery.pick(function(path) {
			od.addtopic.createDisplayImage(path);
		}, function(a) {}, {
			filter: "image"
		});
	},
	createDisplayImage: function(path) {
		var image = new Image();
		image.src = path || "_doc/tempUpload.jpg";
		image.classList.add("small-image");
		document.getElementById("image-list").appendChild(image);
	},
	makeExpandingArea: function(container) {
		var area = container.getElementsByTagName('textarea')[0];
		var span = container.getElementsByTagName('span')[0];
		if(area.addEventListener) {
			area.addEventListener('input', function() {
				span.textContent = area.value;
			}, false);
			span.textContent = area.value;
		} else if(area.attachEvent) {
			area.attachEvent('onpropertychange', function() {
				var html = area.value.replace(/\n/g, '<br/>');
				span.innerText = html;
			});
			var html = area.value.replace(/\n/g, '<br/>');
			span.innerText = html;
		}
		if(window.VBArray && window.addEventListener) { //IE9
			area.attachEvent("onkeydown", function() {
				var key = window.event.keyCode;
				if(key == 8 || key == 46) span.textContent = area.value;

			});
			area.attachEvent("oncut", function() {
				span.textContent = area.value;
			}); //处理粘贴
		}
		container.className += "active";
	},

}
mui.plusReady(function() {
	od.addtopic.inits();
});