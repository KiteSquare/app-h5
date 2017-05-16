od = window.od ||{};
od.host = od.host || "http://10.12.194.127";
od.base = od.base || {};
/**
 * 获取地址栏的参数
 * @param {Object} name
 */
od.getUrlParam = function(name)
{
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); 
	var r = window.location.search.substr(1).match(reg); 
	if (r!=null) return unescape(r[2]); return null;
} 
/**
 * 判空
 * @param {Object} data
 */
od.isNull = function(data){ 
	return (data == "" || data == undefined || data == null) ? true : false; 
}