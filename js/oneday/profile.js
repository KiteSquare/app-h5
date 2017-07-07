od = window.od || {};
od.profile = {
	inits: function() {
		mui.init();
		od.profile.initData();
		od.profile.initEvents();
	},
	initEvents: function() {
		od.profile.bindHeadTap();
		od.profile.bindNameTap();
		od.profile.bindSignatureTap();
		od.profile.bindSexTap();
		od.profile.bindBirthTap();
		od.profile.bindHeightTap();
		od.profile.bindWeightTap();
		od.profile.bindEducationTap();
		od.profile.bindIncomeTap();
		od.profile.bindMarriageTap();
		od.profile.bindCityTap();
		od.profile.bindDetailTap();
		od.profile.bindAddImageTap();
		od.profile.clipImageCallbackEvent();
		od.profile.bindImageViewer();
		od.profile.bindRequirementTap();
	},
	bindImageViewer: function() {
		od.profile.imageViewer = new mui.ImageViewer('#content .small-image', {
			dbl: false
		});
	},

	initData: function() {
		var token = od.base.getAccessToken();
		if(!token) {
			mui.toast("你还未登录哦");
			return;
		}
		var param = {
			'accessToken': token,
			'uid': 0
		};
		mui.ajax(
			od.host + "/oneday/user/get", {
				type: "post",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(param),
				success: od.profile.onUserInfoSuccess,
				error: function(e) {
					od.base.onError("FAILED_NETWORK");
				},
				timeout: 10000
			}
		);
	},
	updateUserProfile: function(param, callback) {
		if(!param) {
			return;
		}

		var token = od.base.getAccessToken();
		if(!token) {
			mui.toast("你还未登录哦");
			return;
		}
		param['accessToken'] = token;

		mui.ajax(
			od.host + "/oneday/user/update", {
				type: "post",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(param),
				success: function(data) {
					if(callback) {
						callback(data);
					}
					if(data.code && data.code != "0") {
						mui.toast(data.message);
						return;
					}
					mui.toast("更新成功");
				},
				error: function(e) {
					od.base.onError("FAILED_NETWORK");
				},
				timeout: 10000
			}
		);
	},

	onUserInfoSuccess: function(data) {
		if(data.code && data.code != "0") {
			mui.toast(data.message);
			return;
		}
		var obj = document.getElementById("content");
		obj.innerHTML = template('content-template', {
			"user": data.data
		});
		od.profile.bindInfoDetailEvent();
	},
	bindHeadTap: function() {
		//更换头像
		mui("#content").on("tap", "#head", function(e) {
			if(mui.os.plus) {
				var a = [{
					title: "拍照"
				}, {
					title: "从手机相册选择"
				}];
				plus.nativeUI.actionSheet({
					title: "修改头像",
					cancel: "取消",
					buttons: a
				}, function(b) {
					switch(b.index) {
						case 0:
							break;
						case 1:
							od.profile.getImage();
							break;
						case 2:
							od.profile.galleryImg();
							break;
						default:
							break
					}
				})
			}

		});
	},
	clipImage: function(filepath) {
		var pid = "cutpicture.html";
		mui.openWindow({
			url: pid,
			id: pid, //默认使用当前页面的url作为id
			styles: {
				top: '0',
				bottom: '0'
			}, //窗口参数
			extras: {
				resImg: filepath,
				callPageId: plus.webview.currentWebview().id
			} //自定义扩展参数
		});
	},
	clipImageCallbackEvent: function() {
		document.addEventListener("cropperImgCallback", function(event) {
			var clipImageSrc = event.detail.resImg;
			if(clipImageSrc) {
				document.getElementById("head-img").src = clipImageSrc;
				mui.ajax(
					od.host + "/oneday/user/uploadHead", {
						type: "post",
						dataType: "json",
						data: {
							data: clipImageSrc
						},
						success: function(data) {
							if(data.code && data.code != "0") {
								mui.toast(data.message);
								return;
							}
							mui.toast("上传成功");
							var url = data.data;

							if(url.indexOf("http") != 0) {
								url = od.host + "/" + url;
							}
							document.getElementById("head").setAttribute("data-head", url);
							od.profile.updateUserProfile({
								"head": url
							});
						},
						error: function(e) {
							od.base.onError("FAILED_NETWORK");
						},
						timeout: 10000
					}
				);
			}
		});
	},
	getImage: function() {
		var c = plus.camera.getCamera();
		c.captureImage(function(e) {
			plus.io.resolveLocalFileSystemURL(e, function(entry) {
				var s = entry.toLocalURL() + "?version=" + new Date().getTime();
				console.log(s);
				//				document.getElementById("head-img").src = s;
				//变更大图预览的src
				od.profile.clipImage(s);
				//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
				//				document.querySelector("#__mui-imageview__group .mui-slider-item img").src = s + "?version=" + new Date().getTime();
			}, function(e) {
				console.log("读取拍照文件错误：" + e.message);
			});
		}, function(s) {
			console.log("error" + s);
		}, {
			filename: "_doc/head.jpg"
		})
	},
	galleryImg: function() {
		plus.gallery.pick(function(a) {
			plus.io.resolveLocalFileSystemURL(a, function(entry) {
				plus.io.resolveLocalFileSystemURL("_doc/", function(root) {
					root.getFile("head.jpg", {}, function(file) {
						//文件已存在
						file.remove(function() {
							console.log("file remove success");
							entry.copyTo(root, 'head.jpg', function(e) {
									var e = e.fullPath + "?version=" + new Date().getTime();
									//									document.getElementById("head-img").src = e;
									//变更大图预览的src
									od.profile.clipImage(e);
									//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
									//									document.querySelector("#__mui-imageview__group .mui-slider-item img").src = e + "?version=" + new Date().getTime();;
								},
								function(e) {
									console.log('copy image fail:' + e.message);
								});
						}, function() {
							console.log("delete image fail:" + e.message);
						});
					}, function() {
						//文件不存在
						entry.copyTo(root, 'head.jpg', function(e) {
								var path = e.fullPath + "?version=" + new Date().getTime();
								//								document.getElementById("head-img").src = path;
								od.profile.clipImage(path);
								//变更大图预览的src
								//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
								//								document.querySelector("#__mui-imageview__group .mui-slider-item img").src = path;
							},
							function(e) {
								console.log('copy image fail:' + e.message);
							});
					});
				}, function(e) {
					console.log("get _www folder fail");
				})
			}, function(e) {
				console.log("读取拍照文件错误：" + e.message);
			});
		}, function(a) {}, {
			filter: "image"
		})
	},
	bindNameTap: function() {
		//		var birthObj = document.getElementById("name");
		mui("#content").on("tap", "#name", od.profile.onNameTap);
	},
	bindSignatureTap: function() {
		mui("#content").on("tap", "#signature", od.profile.onSignatureTap);
	},
	bindSexTap: function() {
		//不允许修改性别
		//		mui("#content").on("tap", ".sex-selected", od.profile.onSexTap);
	},
	bindBirthTap: function() {
		mui("#content").on("tap", "#birth", od.profile.onBirthTap);
	},
	bindHeightTap: function() {
		mui("#content").on("tap", "#height", od.profile.onHeightTap);
	},
	bindWeightTap: function() {
		mui("#content").on("tap", "#weight", od.profile.onWeightTap);
	},

	bindEducationTap: function() {
		mui("#content").on("tap", "#education", od.profile.onEducationTap);
	},
	bindIncomeTap: function() {
		mui("#content").on("tap", "#income", od.profile.onIncomeTap);
	},
	bindMarriageTap: function() {
		mui("#content").on("tap", "#marriage", od.profile.onMarriageTap);
	},
	bindCityTap: function() {
		mui("#content").on("tap", "#city", od.profile.onCityTap);
	},
	bindDetailTap: function() {
		mui("#content").on("tap", "#submit-detail", od.profile.onDetailTap);
	},
	bindRequirementTap: function() {
		mui("#content").on("tap", "#submit-requirement", od.profile.onRequirementTap);
	},
	bindInfoDetailEvent: function() {
		var detailObj = document.getElementById('info-detail'),
			requirementObj=document.getElementById('info-requirement');
		od.profile.makeExpandingArea(detailObj);
		od.profile.makeExpandingArea(requirementObj);
		od.profile.imageViewer.findAllImage();
	},
	bindAddImageTap: function() {
		mui("#content").on("tap", "#add-image", od.profile.onAddImageTap);
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
						od.profile.uploadImageFromCapture();
						break;
					case 2:
						od.profile.uploadImageFromgallery();
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
			od.profile.uploadUserImage();
			//			plus.io.resolveLocalFileSystemURL(e, function(entry) {
			//				var s = entry.toLocalURL() + "?version=" + new Date().getTime();
			//				console.log(s);
			////				document.getElementById("head-img").src = s;
			//				alert(s);
			//				
			//			}, function(e) {
			//				console.log("读取拍照文件错误：" + e.message);
			//			});
		}, function(s) {
			console.log("error" + s);
		}, {
			filename: "_doc/tempUpload.jpg"
		})
	},
	uploadImageFromgallery: function() {
		plus.gallery.pick(function(path) {
			od.profile.uploadUserImage(path);
		}, function(a) {}, {
			filter: "image"
		})
	},
	uploadUserImage: function(path, callback) {
		var task = plus.uploader.createUpload(od.host + "/oneday/user/uploadUserImg", {method:"POST"}, function(response, status) {
			if(status != 200) {
				od.base.onError("FAILED_NETWORK");
				return;
			}
			var data = JSON.parse(response.responseText);
			if(callback) {
				callback(data);
			}
			if (!data.code || data.code != "0") {
				mui.toast(data.message);
				return;
			}
			var url = data.data;
			if(url.indexOf("http") != 0) {
				url = od.host + "/" + url;
			}
			// 上传完成
			var img = new Image(), obj=document.getElementById("images-box");
			img.src = url;
			img.classList.add("small-image");
			obj.appendChild(img);
			od.profile.imageViewer.findAllImage();
		});
		task.addFile(path || "_doc/tempUpload.jpg", {
			key: "testdoc"
		});
//		task.addData( "accessToken", od.base.getAccessToken());
		var accessToken = od.base.getAccessToken();
		accessToken = accessToken.replace(/\n/g,"");
		task.setRequestHeader( "accessToken", accessToken);
//		alert(task.addData( "accessToken", "1111"));
		task.start();
		mui('body').progressbar({
			progress: 0
		}).show();
		od.profile.simulateLoading(0);
	},
	simulateLoading: function(container, progress) {
		if(typeof container === 'number') {
			progress = container;
			container = 'body';
		}
		setTimeout(function() {
			progress += Math.random() * 20;
			mui(container).progressbar().setProgress(progress);
			if(progress < 100) {
				od.profile.simulateLoading(container, progress);
			} else {
				mui(container).progressbar().hide();
			}
		}, Math.random() * 200 + 200);
	},
	onNameTap: function(e) {
		e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['取消', '更新'],
			that = this,
			val = this.getAttribute('data-name') || '昵称';
		mui.prompt('请输入昵称，不超过30个字', val, '昵称', btnArray, function(e) {
			if(e.index == 1) {
				if(e.value != '' && e.value.length < 30) {
					od.profile.updateUserProfile({
						"name": e.value
					});
					that.getElementsByTagName("span")[0].innerText = e.value;
					that.setAttribute("data-name", e.value);
				} else {
					return false;
				}
			}
		}, 'div');
	},
	onSignatureTap: function(e) {
		e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['取消', '更新'],
			that = this,
			val = this.getAttribute('data-signature') || '签名';
		mui.prompt('请输入签名，不超过50字', val, '签名', btnArray, function(e) {
			if(e.index == 1) {
				if(e.value != '' && e.value.length < 50) {
					od.profile.updateUserProfile({
						"signature": e.value
					});
					that.getElementsByTagName("p")[0].innerText = e.value;
					that.setAttribute("data-signature", e.value);
				} else {
					return false;
				}
			}
		}, 'div');
	},
	onSexTap: function(e) {
		var userPicker = new mui.PopPicker();
		userPicker.setData([{
			value: '0',
			text: '男'
		}, {
			value: '1',
			text: '女'
		}]);
		var that = this,
			education = this.getAttribute("data-sex") || '0';
		userPicker.pickers[0].setSelectedValue(education, 500);
		userPicker.show(function(items) {
			var data = items[0];
			od.profile.updateUserProfile({
				"sex": data.value
			}, function(data) {
				if(data.code == "0") {
					document.getElementById("sex").classList.remove("sex-selected");
				}
			});
			that.getElementsByTagName("span")[0].innerText = data.text;
			that.setAttribute("data-sex", data.value);
			//返回 false 可以阻止选择框的关闭
			//return false;
		});
	},
	onEducationTap: function(e) {
		var userPicker = new mui.PopPicker();
		userPicker.setData([{
			value: '0',
			text: '小学以下'
		}, {
			value: '1',
			text: '小学'
		}, {
			value: '2',
			text: '初中'
		}, {
			value: '3',
			text: '高中'
		}, {
			value: '4',
			text: '中专'
		}, {
			value: '5',
			text: '大专'
		}, {
			value: '6',
			text: '本科'
		}, {
			value: '7',
			text: '硕士'
		}, {
			value: '8',
			text: '博士'
		}]);
		var that = this,
			education = this.getAttribute("data-education") || '1';
		userPicker.pickers[0].setSelectedValue(education, 1000);
		userPicker.show(function(items) {
			var data = items[0];
			od.profile.updateUserProfile({
				"education": data.value
			});
			that.getElementsByTagName("span")[0].innerText = data.text;
			that.setAttribute("data-education", data.value);
			//返回 false 可以阻止选择框的关闭
			//return false;
		});
	},
	onIncomeTap: function(e) {
		var userPicker = new mui.PopPicker();
		userPicker.setData([{
			value: '1',
			text: '3万以下'
		}, {
			value: '2',
			text: '3万-5万'
		}, {
			value: '3',
			text: '5万-10万'
		}, {
			value: '4',
			text: '10万-20万'
		}, {
			value: '5',
			text: '20万-30万'
		}, {
			value: '6',
			text: '30万-50万'
		}, {
			value: '7',
			text: '50万-80万'
		}, {
			value: '8',
			text: '80万-200万'
		}, {
			value: '9',
			text: '200万以上'
		}]);
		var that = this,
			income = this.getAttribute("data-income") || '1';
		userPicker.pickers[0].setSelectedValue(income, 1000);
		userPicker.show(function(items) {
			var data = items[0];
			od.profile.updateUserProfile({
				"income": data.value
			});
			that.getElementsByTagName("span")[0].innerText = data.text;
			that.setAttribute("data-income", data.value);
			//返回 false 可以阻止选择框的关闭
			//return false;
		});
	},
	onMarriageTap: function(e) {
		var userPicker = new mui.PopPicker();
		userPicker.setData([{
			value: '1',
			text: '未婚'
		}, {
			value: '2',
			text: '已婚'
		}, {
			value: '3',
			text: '离异'
		}]);
		var that = this,
			marriage = this.getAttribute("data-marriage") || '1';
		userPicker.pickers[0].setSelectedValue(marriage, 1000);
		userPicker.show(function(items) {
			var data = items[0];
			od.profile.updateUserProfile({
				"marriage": data.value
			});
			that.getElementsByTagName("span")[0].innerText = data.text;
			that.setAttribute("data-marriage", data.value);
			//返回 false 可以阻止选择框的关闭
			//return false;
		});
	},
	onHeightTap: function(e) {
		var userPicker = new mui.PopPicker();
		userPicker.setData([{
			value: '130',
			text: '130cm'
		}, {
			value: '131',
			text: '131cm'
		}, {
			value: '132',
			text: '132cm'
		}, {
			value: '133',
			text: '133cm'
		}, {
			value: '134',
			text: '134cm'
		}, {
			value: '135',
			text: '135cm'
		}, {
			value: '136',
			text: '136cm'
		}, {
			value: '137',
			text: '137cm'
		}, {
			value: '138',
			text: '138cm'
		}, {
			value: '139',
			text: '139cm'
		}, {
			value: '140',
			text: '140cm'
		}, {
			value: '141',
			text: '141cm'
		}, {
			value: '142',
			text: '142cm'
		}, {
			value: '143',
			text: '143cm'
		}, {
			value: '144',
			text: '144cm'
		}, {
			value: '145',
			text: '145cm'
		}, {
			value: '146',
			text: '146cm'
		}, {
			value: '147',
			text: '147cm'
		}, {
			value: '148',
			text: '148cm'
		}, {
			value: '149',
			text: '149cm'
		}, {
			value: '150',
			text: '150cm'
		}, {
			value: '151',
			text: '151cm'
		}, {
			value: '152',
			text: '152cm'
		}, {
			value: '153',
			text: '153cm'
		}, {
			value: '154',
			text: '154cm'
		}, {
			value: '155',
			text: '155cm'
		}, {
			value: '156',
			text: '156cm'
		}, {
			value: '157',
			text: '157cm'
		}, {
			value: '158',
			text: '158cm'
		}, {
			value: '159',
			text: '159cm'
		}, {
			value: '160',
			text: '160cm'
		}, {
			value: '161',
			text: '161cm'
		}, {
			value: '162',
			text: '162cm'
		}, {
			value: '163',
			text: '163cm'
		}, {
			value: '164',
			text: '164cm'
		}, {
			value: '165',
			text: '165cm'
		}, {
			value: '166',
			text: '166cm'
		}, {
			value: '167',
			text: '167cm'
		}, {
			value: '168',
			text: '168cm'
		}, {
			value: '169',
			text: '169cm'
		}, {
			value: '170',
			text: '170cm'
		}, {
			value: '171',
			text: '171cm'
		}, {
			value: '172',
			text: '172cm'
		}, {
			value: '173',
			text: '173cm'
		}, {
			value: '174',
			text: '174cm'
		}, {
			value: '175',
			text: '175cm'
		}, {
			value: '176',
			text: '176cm'
		}, {
			value: '177',
			text: '177cm'
		}, {
			value: '178',
			text: '178cm'
		}, {
			value: '179',
			text: '179cm'
		}, {
			value: '180',
			text: '180cm'
		}, {
			value: '181',
			text: '181cm'
		}, {
			value: '182',
			text: '182cm'
		}, {
			value: '183',
			text: '183cm'
		}, {
			value: '184',
			text: '184cm'
		}, {
			value: '185',
			text: '185cm'
		}, {
			value: '186',
			text: '186cm'
		}, {
			value: '187',
			text: '187cm'
		}, {
			value: '188',
			text: '188cm'
		}, {
			value: '189',
			text: '189cm'
		}, {
			value: '190',
			text: '190cm'
		}, {
			value: '191',
			text: '191cm'
		}, {
			value: '192',
			text: '192cm'
		}, {
			value: '193',
			text: '193cm'
		}, {
			value: '194',
			text: '194cm'
		}, {
			value: '195',
			text: '195cm'
		}, {
			value: '196',
			text: '196cm'
		}, {
			value: '197',
			text: '197cm'
		}, {
			value: '198',
			text: '198cm'
		}, {
			value: '199',
			text: '199cm'
		}, {
			value: '200',
			text: '200cm'
		}]);

		var that = this,
			height = this.getAttribute("data-height") || '170';
		userPicker.pickers[0].setSelectedValue(height, 2000);
		userPicker.show(function(items) {
			var data = items[0];
			od.profile.updateUserProfile({
				"height": data.value
			});
			that.getElementsByTagName("span")[0].innerText = data.text;
			that.setAttribute("data-height", data.value);
			//返回 false 可以阻止选择框的关闭
			//return false;
		});
	},
	onWeightTap: function(e) {
		e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		//		e.detail.gesture.stopPropagation();
		var btnArray = ['取消', '更新'],
			that = this,
			val = this.getAttribute('data-weight') || 'kg';
		mui.prompt('请输入您的体重(kg)', val, '体重', btnArray, function(e) {
			if(e.index == 1) {
				if(e.value != '' && parseInt(e.value) == e.value && e.value > 0 && e.value < 500) {
					od.profile.updateUserProfile({
						"weight": e.value
					});
					that.getElementsByTagName("span")[0].innerText = e.value + "kg";
					that.setAttribute("data-weight", e.value);
				} else {
					return false;
				}
			}
		}, "div");
	},
	onBirthTap: function(e) {
		var birth = this.getAttribute('data-birth') || '1990-01-01',
			that = this;
		var picker = new mui.DtPicker({
			"type": "date",
			"beginYear": 1970,
			"endYear": 2016,
			"value": birth
		});
		picker.show(function(rs) {
			/*
			 * rs.value 拼合后的 value
			 * rs.text 拼合后的 text
			 * rs.y 年，可以通过 rs.y.vaue 和 rs.y.text 获取值和文本
			 * rs.m 月，用法同年
			 * rs.d 日，用法同年
			 * rs.h 时，用法同年
			 * rs.i 分（minutes 的第二个字母），用法同年
			 */
			od.profile.updateUserProfile({
				"birth": rs.text
			});
			that.getElementsByTagName("span")[0].innerText = rs.text;
			that.setAttribute("data-birth", rs.text);
			/* 
			 * 返回 false 可以阻止选择框的关闭
			 * return false;
			 */
			/*
			 * 释放组件资源，释放后将将不能再操作组件
			 * 通常情况下，不需要示放组件，new DtPicker(options) 后，可以一直使用。
			 * 当前示例，因为内容较多，如不进行资原释放，在某些设备上会较慢。
			 * 所以每次用完便立即调用 dispose 进行释放，下次用时再创建新实例。
			 */
			picker.dispose();
		});
	},
	onCityTap: function(e) {
		var province = this.getAttribute('data-province'),
			cityCode = this.getAttribute('data-cityCode'),
			provinceCode = this.getAttribute('data-provinceCode'),
			city = this.getAttribute('data-city'),
			that = this;

		var cityPicker = new mui.PopPicker({
			layer: 2
		});
		cityPicker.setData(cityData);
		if(cityCode && provinceCode) {
			cityPicker.pickers[0].setSelectedValue(provinceCode, 0, function() {
				setTimeout(function() {
					cityPicker.pickers[1].setSelectedValue(cityCode);
				}, 100);
			});
		}
		cityPicker.show(function(items) {
			//							cityResult.innerText = "你选择的城市是:" + items[0].text + " " + items[1].text;
			//返回 false 可以阻止选择框的关闭
			//return false;
			od.profile.updateUserProfile({
				"city": items[1].value
			});
			that.getElementsByTagName("span")[0].innerText = items[1].text;
			that.setAttribute("data-city", items[1].value);
			cityPicker.dispose();
		});

	},
	onDetailTap: function(e) {
		var obj = document.getElementById("detail"),
			detail = obj.value;
		if(detail.length == 0) {
			mui.toast("一个字都还没写呢");
			return;
		}
		od.profile.updateUserProfile({
			"detail": detail
		});
	},
	onRequirementTap: function(e) {
		var obj = document.getElementById("requirement"),
			detail = obj.value;
		if(detail.length == 0) {
			mui.toast("一个字都还没写呢");
			return;
		}
		od.profile.updateUserProfile({
			"requirement": detail
		});
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
	od.profile.inits();
});