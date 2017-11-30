od = window.od || {};
od.base.addRefreshBtn();
od.search = {
	inits: function() {
		od.search.initPage();
	},
	initPage: function() {
		mui.init();
	}
}
mui.plusReady(function() {
	od.search.inits();
});