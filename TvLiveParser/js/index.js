$(function() {
	console.log("ready")
	//
	// $('#dialogs').on('click', '.weui-dialog__btn', function() {
	// 	$(this).parents('.js_dialog').fadeOut(200);
	// 	$(this).parents('.js_dialog').attr('aria-hidden', 'true');
	// 	$(this).parents('.js_dialog').removeAttr('tabindex');
	// });
	$('#bt_parse').on('click', function() {
		// var url = "https://live.fanmingming.com/tv/m3u/ipv6.m3u";
		var url = $("#input_1").val();
		if (url == "") {
			showTipRenew("请输入M3U地址");
			return;
		}
		//
		showTipRenew("执行解析：" + url);
		try {
			doParse(url);
		} catch (e) {
			console.log(e)
			showTip("解析发生异常，" + e);
		}

		// generateFile();

	})
})

function showTipRenew(text) {
	$("#tip").text(text);
}

function showTip(text) {
	var tipV = $("#tip");
	var ori = tipV.html();
	tipV.html(ori + "<br />" + text);
}

function generateFile(text) {
	var blob = new Blob([text], {
		type: "text/plain;charset=utf-8"
	});
	var date = new Date().Format("yyyy-MM-dd-HH-mm-ss");
	saveAs(blob, date + ".txt");
}

function doParse(url) {
	var self = this;
	self.doGet(url, function(result) {
			var start = 0;
			var aar = result.split(/\r?\n/);
			var res = [];
			var group = [];
			//TAG
			var tag_id = "tvg-id";
			var tag_name = "tvg-name";
			var tag_group = "group-title";
			//
			var item = null;
			for (var i = 0; i < aar.length; i++) {
				var str = aar[i];
				//
				if (str.startsWith("#EXTINF")) {
					//存储上条解析内容
					if (item) {
						//单条解析结束
						res.push(item);
						// console.log("====item:" + JSON.stringify(item));
					}
					//
					// console.log(str)
					item = {};
					var douHao = str.lastIndexOf(",");
					// console.log("douHao:" + douHao)
					if (douHao > 0) {
						str = str.slice(0, douHao);
					}
					var ary = str.split(" ");
					//属性解析
					for (var j = 0; j < ary.length; j++) {
						// console.log(ary[j]);
						var keyV = ary[j].split("=");
						if (keyV.length == 2) {
							var key = keyV[0];
							var value = keyV[1].slice(1, -1);
							if (tag_id == key) {
								item.id = value;
							} else if (tag_name == key) {
								item.name = value;
							} else if (tag_group == key) {
								item.group = value;
								var inAr = $.inArray(value, group);
								//未创建该分组
								if (inAr == -1) {
									console.log("===group.push:" + value)
									group.push(value);
								}
							}
						}
					}
				}
				//播放链接获取
				else if (!str.startsWith("#EXT")) {
					if (item && str != "") {
						item.link = str;
					}
				}
				//解析完成，内容存储结束
				if (i == aar.length - 1) {
					if (item) {
						res.push(item);
						// console.log("====item:" + JSON.stringify(item));
					}
				}
			}

			//展示数据进行确认
			var result = "";
			$.each(group, function(i, val) {
				//
				if (i > 0) {
					result += "\r\n";
				}
				result += val + ",#genre#";
				result += "\r\n";
				//
				$.each(res, function(j, entry) {
					if (val == entry.group) {
						result += entry.id;
						result += ",";
						result += entry.link;
						result += "\r\n";
					}
				});
			});
			self.generateFile(result);
			showTip(">>>>解析完成<<<<<");
			// console.log("=====result:" + result)
		},
		function(err) {
			showTip("链接请求失败:" + err);
		});

}



function doGet(url, sucCallback, failCallback) {
	console.log('====Get:' + url);
	$.get(url, function(data) {
		// console.log("data.length:" + data.length);
		// console.log("data:====" + data);
		sucCallback(data);
	}).error(function(xhr, errorText, errorType) {
		console.log("==xhr:" + JSON.stringify(xhr));
		failCallback(errorText + "..." + xhr.status);
	});
}


function showDialog(text) {
	var $iosDialog1 = $('#iosDialog1');
	$("#dialog_text").text(text);
	$iosDialog1.fadeIn(200);
	$iosDialog1.attr('aria-hidden', 'false');
	$iosDialog1.attr('tabindex', '0');
	$iosDialog1.trigger('focus');
}


//jquery将日期转换成指定格式的字符串
Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"H+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((
			"00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}