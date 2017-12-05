od = window.od || {};
od.base.addRefreshBtn();
od.regist = {
	step:1,
	inits: function(){
		mui.init();
		
		od.regist.initEvents();
		od.regist.geocode();
	},
	initEvents: function() {
		od.regist.bindStepTapEvent();
		od.regist.bindHeadTap();
		od.regist.bindSexTap();
		od.regist.bindBirthTap();
		od.regist.bindCityTap();
		od.regist.clipImageCallbackEvent();
	},
	bindHeadTap: function() {
		//更换头像
		mui("#step3").on("tap", "#head", function(e) {
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
							od.regist.getImage();
							break;
						case 2:
							od.regist.galleryImg();
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
				extras: {resImg:filepath, callPageId:plus.webview.currentWebview().id} //自定义扩展参数
			});
	},
	clipImageCallbackEvent: function(){
		document.addEventListener("cropperImgCallback", function(event){
			var clipImageSrc = event.detail.resImg;
			if (clipImageSrc) {
				document.getElementById("head-img").src = clipImageSrc;
				var param={
					data:clipImageSrc
				}
				od.http.post("/oneday/user/uploadHead", JSON.stringify(param), function(data){
							if (data.code && data.code != "0") {
								mui.toast(data.message);
								return;
							}
							mui.toast("上传成功");
							var url = data.data;
							
							if (url.indexOf("http") != 0) {
								url = od.host+"/"+url;
							}
							document.getElementById("head").setAttribute("data-head",url);
						},
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
				od.regist.clipImage(s);
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
									od.regist.clipImage(e);
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
								od.regist.clipImage(path);
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
	bindSexTap: function() {
		var birthObj = document.getElementById("sex");
		birthObj.addEventListener("tap", od.regist.onSexTap, false);
	},
	bindBirthTap: function() {
		var birthObj = document.getElementById("birth");
		birthObj.addEventListener("tap", od.regist.onBirthTap, false);
	},
	bindCityTap: function() {
		var obj = document.getElementById("city");
		obj.addEventListener("tap", od.regist.onCityTap, false);
		od.regist.cityPicker = new mui.PopPicker({
			layer: 2
		});
		od.regist.cityPicker.setData(cityData);
	},
	bindStepTapEvent: function() {
		mui('.btn-next').each(function(){
			this.addEventListener("tap", od.regist.onStepTap, false);
		});
		mui('.btn-pre').each(function(){
			this.addEventListener("tap", od.regist.onStepTap, false);
		}); 
		document.getElementById("profile").addEventListener("tap",function(){
			mui.openWindow( {
											url: "profile.html", 
											id: "profile.html",
											waiting:{
										      autoShow:true,
										      title:'正在加载...',
										    }
										});
		},false);
		document.getElementById("cutpic").addEventListener("tap",function(){
			mui.openWindow( {
											url: "cutpicture.html", 
											id: "cutpicture.html",
											waiting:{
										      autoShow:true,
										      title:'正在加载...',
										    }
										});
		},false);
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
			that.getElementsByTagName("span")[0].innerText = data.text;
			that.setAttribute("data-sex", data.value);
			//返回 false 可以阻止选择框的关闭
			//return false;
		});
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
	onStepTap: function(e) {
		var step=this.getAttribute("data-step"), next=true;
		
		if (!step || step==od.regist.step) {
			return;
		} else if (step<od.regist.step) {
			next=false;
		}
		var nextobj=document.getElementById("step"+step),
			preobj=document.getElementById("step"+od.regist.step);
		
		if (next) {
				var param = od.regist.buildParam(od.regist.step);
				if (param === false) {
					return;
				}
				od.http.post("/oneday/user/regist", JSON.stringify(param), function(data) {
							if (data.code && data.code != "0") {
								mui.toast(data.message,{ duration:'short', type:'div' }) 
								return;
							}
							if (od.regist.step < 3) {
								if (preobj) {
									preobj.style.display="none";
									preobj.classList.remove("bounceInLeft");
									preobj.classList.remove("bounceInRight");
								}
								nextobj.classList.add("bounceInRight");
								nextobj.style.display="block";
								od.regist.step=step;
							} else {
								var info = data.data; 
								// 注册完成
								od.base.setLocalUser({"name":param['phone'], "password":param['password']});
								od.base.setAccessToken(info['accessToken']);
								od.base.setSdkToken(info['sdktoken']);
								
								var btnArray = ['首页', '完善信息'];
								mui.confirm('恭喜'+param["name"]+",欢迎加入梧桐大家庭！", "注册成功", 
								btnArray, 
								function(e) {
									if(e.index == 1) {
//										mui.openWindow({
//											url: "profile.html", 
//											id: "profile.html",
//											waiting:{
//										      autoShow:true,
//										      title:'正在加载...',
//										    }
//										});

									


										var profile=plus.webview.create("profile.html","profile.html");
										profile.addEventListener("loaded",function(e) {
											plus.webview.close("regist.html");
										});
										profile.show("slide-in-right");
//										plus.webview.currentWebview().close();
									} else {
										var main = plus.webview.getWebviewById( plus.runtime.appid );   
        								mui.fire(main,'gohome');
        								main.show();
        								plus.webview.currentWebview().close();
									}
								})
							}
							
				});
				
				
		} else {
			if (preobj) {
				preobj.style.display="none";
				preobj.classList.remove("bounceInLeft");
				preobj.classList.remove("bounceInRight");
			}
			nextobj.classList.add("bounceInLeft");
			nextobj.style.display="block";
			od.regist.step=step;
		}
		
	},
	buildParam: function(step) {
		var param = {"step": step};
		if (step == 1) {
			param["idcard"] = document.getElementById("idcard").value;
			if (!param["idcard"]) {
				mui.toast("请填写身份证号码");
				return false;
			}
		} else if (step == 2) {
			param["idcard"] = document.getElementById("idcard").value;
			param["phone"] = document.getElementById("phone").value;
			param["code"] = document.getElementById("code").value;
			param["password"] = document.getElementById("password").value;
			if (!param["idcard"]) {
				mui.toast("请填写身份证号码");
				return false;
			}
			if (!param["phone"]) {
				mui.toast("请填写手机号码");
				return false;
			}
			if (!param["code"]) {
				mui.toast("请填写短信验证码");
				return false;
			}
			if (!param["password"]) {
				mui.toast("请填写密码");
				return false;
			}
			if (param["password"].length < 6) {
				mui.toast("密码长度至少为6位哦");
				return false;
			}
		} else if (step == 3) {
			param["idcard"] = document.getElementById("idcard").value;
			param["phone"] = document.getElementById("phone").value;
			param["name"] = document.getElementById("name").value;
			param["password"] = document.getElementById("password").value;
			param["sex"] = document.getElementById("sex").getAttribute("data-sex");
			param["birthStr"] = document.getElementById("birth").getAttribute("data-birth");
			param["provinceCode"] = document.getElementById("city").getAttribute("data-provinceCode");
			param["province"] = document.getElementById("city").getAttribute("data-province");
			param["cityCode"] = document.getElementById("city").getAttribute("data-cityCode");
			param["city"] = document.getElementById("city").getAttribute("data-city");
			param["lat"] = document.getElementById("lat").value;
			param["lon"] = document.getElementById("lon").value;
			param["head"] = document.getElementById("head").getAttribute("data-head");
			param["deviceId"] = plus.device.uuid;
			if (!param["idcard"]) {
				mui.toast("请填写身份证号码");
				return false;
			}
			if (!param["phone"]) {
				mui.toast("请填写手机号码");
				return false;
			}
			if (!param["name"]) {
				mui.toast("请填写姓名");
				return false;
			}
			if (param["name"].length>25) {
				mui.toast("昵称长度不能超过25");
				return false;
			}
			if (!param["head"]) {
				mui.toast("请上传头像");
				return false;
			}
			if (!param["sex"]) {
				mui.toast("请选择性别");
				return false;
			}
			if (!param["birthStr"]) {
				mui.toast("请设置生日");
				return false;
			}
			if (!param["city"]) {
				mui.toast("请设置城市");
				return false;
			}
		} 
		
		return param;
	},
	onCityTap: function(e) {
		var province = this.getAttribute('data-city') ,cityCode="",
			that = this;
		od.regist.cityPicker.show(function(items) {
			//							cityResult.innerText = "你选择的城市是:" + items[0].text + " " + items[1].text;
			//返回 false 可以阻止选择框的关闭
			//return false;
			that.getElementsByTagName("span")[0].innerText = items[1].text;
			that.setAttribute("data-provinceCode", items[0].value);
			that.setAttribute("data-province", items[0].text);
			that.setAttribute("data-cityCode", items[1].value);
			that.setAttribute("data-city", items[1].text);
//			cityPicker.dispose();
		});

	},
	geocode: function() {
		plus.geolocation.getCurrentPosition( function ( p ) {
				console.log(p);
//				alert( "Geolocation\nLatitude:" + p.coords.latitude + "\nLongitude:" + p.coords.longitude + "\nAltitude:" + p.coords.altitude );
				document.getElementById("lat").value=p.coords.latitude;
				document.getElementById("lon").value=p.coords.longitude;
				if (p.address && p.address.city) {
					od.regist.setCityPickerValue(p.address.province,p.address.city);
				}
				
			}, function ( e ) {
//				alert( "Geolocation error: " + e.message );
				mui.confirm("无法获取定位，请打开gps后重试","定位失败",["确定"]);
			},
			{
//				provider:'baidu'
			}
		);
		
	},
	setCityPickerValue:function(province, city) {
		var i=0,j=0,tt,provinceCode,cityCode;
		for(;i<cityData.length;i++) {
			tt=cityData[i];
			if (tt.text == province) {
				provinceCode=tt.value;
				for(;j<tt.children.length;j++){
					if (tt.children[j].text==city){
						cityCode=tt.children[j].value;
						break;
					}
				}
				break;
			}
			
		}
		if (provinceCode && cityCode){
			od.regist.cityPicker.pickers[0].setSelectedValue(provinceCode, 0, function() {
				setTimeout(function() {
					od.regist.cityPicker.pickers[1].setSelectedValue(cityCode);
				}, 100);
			});
			var obj = document.getElementById("city");
			obj.getElementsByTagName("span")[0].innerText = city;
			obj.setAttribute("data-provinceCode", provinceCode);
			obj.setAttribute("data-province", province);
			obj.setAttribute("data-cityCode", cityCode);
			obj.setAttribute("data-city", city);
		}
	}
	
}

mui.plusReady(function() {
	od.regist.inits();
});
//od.regist.inits();

