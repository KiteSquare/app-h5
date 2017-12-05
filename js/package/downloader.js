/**
 * 创建于:2017-12-1<br>
 * 文件下载器，该下载器应该是全局唯一的，以便进行下载管理，比如控制同时进行的下载的任务数，同资源合并等
 * @author chender
 * @version 0.9
 * TODO 下载任务数控制
 */
(function() {
	od = window.od = window.od || {};
	var downloading = {};
	od.downloader = {
		download: function(param, cb) {
			var fn = param.filename;
			if(downloading[fn]) { //已存在相同的下载任务，直接加入监听(我们约定相同的资源应该使用相同的下载参数)
				downloading[fn].push(cb);
				return;
			} else {
				downloading[fn] = [cb];
			}
			param.retry = param.retry || 1;
			console.log("开始下载:"+param.url);
			var downloadTask = plus.downloader.createDownload(param.url, param, function(file, status) {
				var cbs = downloading[fn];
				delete downloading[fn];
				console.log("下载结束,status:"+status);
				for(var i in cbs) {
					if(status == 200) {
						cbs[i]({success:true,status:200});
					} else {
						cbs[i]({success:false,status:status});
					}
				}
			});
			downloadTask.start();
		},
		clear: function() {
			plus.downloader.clear(-1);
		}
	};
})();