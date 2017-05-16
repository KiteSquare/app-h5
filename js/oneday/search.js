od = window.od || {};
od.search = {
	inits: function() {
		od.search.initPage();
	},
	initPage: function() {
		mui.init();
		template.config('escape', false);
	}
}
mui.plusReady(function() {
	od.search.inits();
});