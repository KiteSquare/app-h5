od = window.od || {};
od.base.addRefreshBtn();
od.setting = {
	inits: function() {
		od.setting.initEvents();
		od.setting.bindTapEvent()
	},
	initEvents: function() {
		od.setting.bindNameTap();
		od.setting.bindSignatureTap();
		od.setting.bindSexTap();
		od.setting.bindBirthTap();
		od.setting.bindHeightTap();
		od.setting.bindWeightTap();
		od.setting.bindEducationTap();
		od.setting.bindIncomeTap();
		od.setting.bindMarriageTap();
		od.setting.bindCityTap();
		od.setting.bindInfoDetailEvent();
	},
	bindTapEvent: function(){
		mui('.mui-page').on('tap', '.mui-table-view-cell a', function(e) {
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
	bindNameTap: function() {
		var birthObj = document.getElementById("name");
		birthObj.addEventListener("tap", od.setting.onNameTap, false);
	},
	bindSignatureTap: function() {
		var birthObj = document.getElementById("signature");
		birthObj.addEventListener("tap", od.setting.onSignatureTap, false);
	},
	bindSexTap: function() {
		var birthObj = document.getElementById("sex");
		birthObj.addEventListener("tap", od.setting.onSexTap, false);
	},
	bindBirthTap: function() {
		var birthObj = document.getElementById("birth");
		birthObj.addEventListener("tap", od.setting.onBirthTap, false);
	},
	bindHeightTap: function() {
		var obj = document.getElementById("height");
		obj.addEventListener("tap", od.setting.onHeightTap, false);
	},
	bindWeightTap: function() {
		var obj = document.getElementById("weight");
		obj.addEventListener("tap", od.setting.onWeightTap, false);
	},

	bindEducationTap: function() {
		var obj = document.getElementById("education");
		obj.addEventListener("tap", od.setting.onEducationTap, false);
	},
	bindIncomeTap: function() {
		var obj = document.getElementById("income");
		obj.addEventListener("tap", od.setting.onIncomeTap, false);
	},
	bindMarriageTap: function() {
		var obj = document.getElementById("marriage");
		obj.addEventListener("tap", od.setting.onMarriageTap, false);
	},
	bindCityTap: function() {
		var obj = document.getElementById("city");
		obj.addEventListener("tap", od.setting.onCityTap, false);
	},
	bindInfoDetailEvent: function() {
		var areas = document.getElementById('info-detail');
		od.setting.makeExpandingArea(areas);
	},
	onNameTap: function(e) {
		e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['取消', '更新'], that=this, val=this.getAttribute('data-name')||'昵称';
		mui.prompt('', val, '昵称(不超过30个字)：', btnArray, function(e) {
			if(e.index == 1) {
				if (e.value != '' && e.value.length<30) {
					that.getElementsByTagName("span")[0].innerText = e.value;
					that.setAttribute("data-name", e.value);
				} else {
					return false;
				}
			}
		})
	},
	onSignatureTap: function(e) {
		e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['取消', '更新'], that=this, val=this.getAttribute('data-signature')||'签名';
		mui.prompt('', val, '签名(不超过50个字)：', btnArray, function(e) {
			if(e.index == 1) {
				if (e.value != '' && e.value.length<50) {
					that.getElementsByTagName("p")[0].innerText = e.value;
					that.setAttribute("data-signature", e.value);
				} else {
					return false;
				}
			}
		})
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
			that.getElementsByTagName("span")[0].innerText = data.text;
			that.setAttribute("data-height", data.value);
			//返回 false 可以阻止选择框的关闭
			//return false;
		});
	},
	onWeightTap: function(e) {
		e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
		var btnArray = ['取消', '更新'], that=this, val=this.getAttribute('data-weight')||'kg';
		mui.prompt('', val, '请输入您的体重(kg)：', btnArray, function(e) {
			if(e.index == 1) {
				if (e.value != '' && parseInt(e.value) == e.value && e.value > 0 && e.value<500) {
					that.getElementsByTagName("span")[0].innerText = e.value+"kg";
					that.setAttribute("data-weight", e.value);
				} else {
					return false;
				}
			}
		})
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
	onCityTap: function(e) {
		var birth = this.getAttribute('data-city') || '北京市',
			that = this;

		var cityPicker = new mui.PopPicker({
			layer: 2
		});
		cityPicker.setData(cityData);
		cityPicker.show(function(items) {
			//							cityResult.innerText = "你选择的城市是:" + items[0].text + " " + items[1].text;
			//返回 false 可以阻止选择框的关闭
			//return false;
			that.getElementsByTagName("span")[0].innerText = items[1].text;
			that.setAttribute("data-city", items[1].value);
			cityPicker.dispose();
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

od.setting.inits();