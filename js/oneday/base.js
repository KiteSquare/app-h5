od = window.od || {};
od.host = localStorage.customHost || od.host || "http://10.12.194.127";
//od.host = od.host || "http://182.61.40.58";

od.base = od.base || {};
od.base = {
	getAccessToken: function() {
		return plus.storage.getItem('accessToken');
	},
	setAccessToken: function(accessToken) {
		if(od.isNull(accessToken)) {
			plus.storage.removeItem('accessToken');
		} else {
			accessToken = accessToken.replace(/\n/g, "");
			plus.storage.setItem('accessToken', accessToken);
			plus.storage.setItem("uidStoreTime", "" + Date.parse(new Date()));
		}
	},
	setSdkToken: function(token) {
		if(od.isNull(token)) {
			plus.storage.removeItem('sdktoken');
		} else {
			plus.storage.setItem('sdktoken', token);
		}
	},
	getSdkToken: function() {
		return plus.storage.getItem('sdktoken');
	},
	isLogin: function() {
		return !od.isNull(plus.storage.getItem('accessToken'));
	},
	clearLocal: function() {
		plus.storage.removeItem('accessToken');
		plus.storage.removeItem('localLoginName');
		plus.storage.removeItem('localLoginPassword');
		plus.storage.removeItem('sdktoken');
	},
	key: "518544456782354680",
	setLocalUser: function(user) {
		var name = "",
			password = "";
		if(user['name']) {
			name = user['name'];
		}
		if(user['password']) {
			password = user['password'];
		}
		if(od.isNull(name)) {
			plus.storage.removeItem('localLoginName');
		} else {
			plus.storage.setItem('localLoginName', name);
		}
		if(od.isNull(password)) {
			plus.storage.removeItem('localLoginPassword');
		} else {
			var en = new AES.Crypto(od.base.key);
			var encryData = en.encrypt(password);
			plus.storage.setItem('localLoginPassword', encryData);
		}
	},
	getLocalUser: function() {
		var user = {
				'name': plus.storage.getItem('localLoginName')
			},
			pass = plus.storage.getItem('localLoginPassword');
		if(!od.isNull(pass)) {
			var en = new AES.Crypto(od.base.key);
			var decryptedData = en.decrypt(pass);
			user['password'] = decryptedData;
		}
		return user;
	},
	refreshUser: function(force) {
		var token = od.base.getAccessToken();
		if(od.isNull(token)) {
			if(!od.isNull(force) && force) {
				mui.openWindow({
					url: "login.html",
					id: "login.html"
				});
			}
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
				success: function(data) {
					if(data.code && data.code != "0") {
						if(data.code == '0022') {
							od.base.reLogin();
							return;
						}
						return;
					}
					if(!od.isNull(force) && force) {
						od.base.reLogin();
						return;
					}
				},
				error: function(e) {
					od.base.onError("FAILED_NETWORK");
				},
				timeout: 10000
			}
		);
	},
	onError: function(errcode) {
		switch(errcode) {
			case 'FAILED_NETWORK':
				mui.toast('网络不佳');
				break;
			case 'INCORRECT_PASSWORD':
				mui.toast('密码不正确');
				break;
			case 'USER_NOT_EXISTS':
				mui.toast('用户尚未注册');
				break;
		}
	},
	reLogin: function() {
		var user = od.base.getLocalUser();
		if(od.isNull(user.name) || od.isNull(user.password)) {
			mui.openWindow({
				url: "login.html",
				id: "login.html"
			});
			return;
		}
		var param = {
			"phone": name,
			"password": password,
			"type": 1,
			"url": plus.webview.currentWebview().id
		};
		mui.ajax(
			od.host + "/oneday/user/login", {
				type: "post",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify(param),
				success: od.base.onLoginSuccess,
				error: function(e) {
					console.log(e);
					alert("error " + e);
				},
				timeout: 10000
			});
	},
	onLoginSuccess: function(data) {
		if(data.code && data.code != "0") {
			mui.toast(data.message, {
				duration: 'short',
				type: 'div'
			})
			return;
		}
		var info = data.data;

		od.base.setLocalUser({
			"name": od.login.param['phone'],
			"password": od.login.param['password']
		});
		od.base.setAccessToken(info['accessToken']);
		od.base.setSdkToken(info.sdktoken);
		var main = plus.webview.getWebviewById(plus.runtime.appid);
		mui.fire(main, 'refresh');

		if(info && info.url) {
			var page = plus.webview.getWebviewById(info.url);
			if(page) {
				page.show();
			} else {
				mui.openWindow({
					url: info.url,
					id: info.url
				});
			}
		} else {
			main.show();
		}
		plus.webview.currentWebview().close();
	}
}
/**
 * 获取地址栏的参数
 * @param {Object} name
 */
od.getUrlParam = function(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return unescape(r[2]);
	return null;
}
/**
 * 判空
 * @param {Object} data
 */
od.isNull = function(data) {
	return(data == "" || data == undefined || data == null) ? true : false;
}

var AES = {
	sbox: [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16],
	Invsbox: [0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb, 0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb, 0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e, 0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25, 0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92, 0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84, 0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06, 0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b, 0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73, 0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e, 0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b, 0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4, 0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f, 0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef, 0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61, 0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d],
	rcon: [
		[0x00, 0x00, 0x00, 0x00],
		[0x01, 0x00, 0x00, 0x00],
		[0x02, 0x00, 0x00, 0x00],
		[0x04, 0x00, 0x00, 0x00],
		[0x08, 0x00, 0x00, 0x00],
		[0x10, 0x00, 0x00, 0x00],
		[0x20, 0x00, 0x00, 0x00],
		[0x40, 0x00, 0x00, 0x00],
		[0x80, 0x00, 0x00, 0x00],
		[0x1b, 0x00, 0x00, 0x00],
		[0x36, 0x00, 0x00, 0x00]
	],
	cipher: function(input, w) {
		var nb = 4;
		var nr = w.length / nb - 1;
		var state = [new Array(nb), new Array(nb), new Array(nb), new Array(nb)];
		var output = new Array(4 * nb);
		var i, round;
		for(i = 0; i < input.length; i++) {
			state[i % 4][Math.floor(i / 4)] = input[i];
		}
		this.addRoundKey(state, w, 0, nb);
		for(round = 1; round < nr; round++) {
			this.subBytes(state, nb, 0);
			this.shiftRows(state, nb, 0);
			this.mixColumns(state, nb, 0);
			this.addRoundKey(state, w, round, nb);
		}
		this.subBytes(state, nb, 0);
		this.shiftRows(state, nb, 0);
		this.addRoundKey(state, w, nr, nb);
		for(i = 0; i < output.length; i++) {
			output[i] = state[i % 4][Math.floor(i / 4)];
		}
		return output;
	},
	Invcipher: function(input, w) {
		var nb = 4;
		var nr = w.length / nb - 1;
		var state = [new Array(nb), new Array(nb), new Array(nb), new Array(nb)];
		var output = new Array(4 * nb);
		var i, round;
		for(i = 0; i < input.length; i++) {
			state[i % 4][Math.floor(i / 4)] = input[i];
		}
		this.addRoundKey(state, w, nr, nb);
		for(round = nr - 1; round >= 1; round--) {
			this.shiftRows(state, nb, 1);
			this.subBytes(state, nb, 1);
			this.addRoundKey(state, w, round, nb);
			this.mixColumns(state, nb, 1);
		}
		this.shiftRows(state, nb, 1);
		this.subBytes(state, nb, 1);
		this.addRoundKey(state, w, round, nb);
		for(i = 0; i < output.length; i++) {
			output[i] = state[i % 4][Math.floor(i / 4)];
		}
		return output;
	},
	subBytes: function(state, nb, type) {
		var r, c;
		var type = type || 0;
		var tempBox = type === 0 ? this.sbox : this.Invsbox;
		for(c = 0; c < nb; c++) {
			for(r = 0; r < 4; r++) {
				state[r][c] = tempBox[state[r][c]];
			}
		}
	},
	shiftRows: function(state, nb, type) {
		var temp = new Array(nb);
		var type = type || 0;
		var r, c;
		type = type === 0 ? 1 : -1;
		for(r = 1; r < 4; r++) {
			for(c = 0; c < nb; c++) {
				temp[c] = state[r][(c + r * type + nb) % nb];
			}
			for(c = 0; c < 4; c++) {
				state[r][c] = temp[c];
			}
		}
	},
	mixColumns: function(state, nb, type) {
		var r, c, i;
		var t = new Array(nb);
		var n = [
			[0x02, 0x03, 0x01, 0x01],
			[0x0e, 0x0b, 0x0d, 0x09]
		];
		for(c = 0; c < nb; c++) {
			for(r = 0; r < 4; r++) {
				t[r] = state[r][c];
			}
			for(r = 0; r < 4; r++) {
				state[r][c] = 0;
				for(i = 0; i < 4; i++) {
					state[r][c] ^= this.FFmul(n[type][i], t[(r + i) % 4]);
				}
			}
		}
	},
	FFmul: function(a, b) {
		var bw = new Array(4);
		var res = 0;
		var i;
		bw[0] = b;
		for(i = 1; i < 4; i++) {
			bw[i] = bw[i - 1] << 1;
			if(bw[i - 1] & 0x80) {
				bw[i] ^= 0x11b;
			}
		}
		for(i = 0; i < 4; i++) {
			if((a >> i) & 0x01) {
				res ^= bw[i];
			}
		}
		return res;
	},
	addRoundKey: function(state, w, round, nb) {
		var r, c;
		for(c = 0; c < nb; c++) {
			for(r = 0; r < 4; r++) {
				state[r][c] ^= w[round * 4 + c][r];
			}
		}
	},
	keyExpansion: function(key) {
		var nk = key.length / 4;
		var nb = 4;
		var nr = nk + 6;
		var w = new Array(nb * (nr + 1));
		var temp = new Array(4);
		var i, j;
		for(i = 0; i < nk; i++) {
			w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
		}
		for(i = nk; i < w.length; i++) {
			w[i] = new Array(4);
			for(j = 0; j < 4; j++) {
				temp[j] = w[i - 1][j];
			}
			if(i % nk === 0) {
				this.rotWord(temp);
				this.subWord(temp);
				for(j = 0; j < 4; j++) {
					temp[j] ^= AES.rcon[i / nk][j];
				}
			} else if(nk > 6 && i % nk === 4) {
				this.subWord(temp);
			}
			for(j = 0; j < 4; j++) {
				w[i][j] = w[i - nk][j] ^ temp[j];
			}
		}
		return w;
	},
	rotWord: function(w) {
		var temp = w[0];
		var i;
		for(i = 0; i < 3; i++) {
			w[i] = w[i + 1];
		}
		w[3] = temp;
	},
	subWord: function(w) {
		var i;
		for(i = 0; i < 4; i++) {
			w[i] = this.sbox[w[i]];
		}
	}
};
AES.Crypto = function(key) {
	this.String2Array = function(input, block) {
		var i;
		if(block != null) {
			var output = new Array(16);
			for(i = 0; i < 16; i++) {
				output[i] = input.charCodeAt(16 * block + i) || 0;
			}
		} else {
			var realLength = input.length <= 16 ? 16 : input.length <= 24 ? 24 : 32;
			var output = new Array(realLength);
			for(i = 0; i < realLength; i++) {
				output[i] = input.charCodeAt(i) || 0;
			}
		}
		return output;
	}
	this.Byte2Char = function(input) {
		var i;
		var output = '';
		for(i = 0; i < input.length / 2; i++) {
			output += String.fromCharCode(parseInt(input[i * 2], 16) * 16 + parseInt(input[i * 2 + 1], 16));
		}
		return output;
	}
	this.encrypt = function(input) {
		var blockCount = Math.ceil(input.length / blockSize);
		var output = new Array();
		var counterBlock, byteCount, offset;
		var block, c;
		for(block = 0; block < blockCount; block++) {
			counterBlock = AES.cipher(this.String2Array(input, block), this.keySchedule);
			offset = block * blockSize;
			for(c = 0; c < 16; c++) {
				output[offset + c] = counterBlock[c] < 16 ? ('0' + counterBlock[c].toString(16)) : counterBlock[c].toString(16);
			}
		}
		return output.join("");
	};
	this.decrypt = function(input) {
		var blockCount = Math.ceil(input.length / blockSize * 0.5);
		var output = new Array();
		var counterBlock, byteCount, offset;
		var block, c;
		input = this.Byte2Char(input);
		for(block = 0; block < blockCount; block++) {
			counterBlock = AES.Invcipher(this.String2Array(input, block), this.keySchedule);
			offset = block * blockSize;
			for(c = 0; c < 16 && counterBlock[c] != 0; c++) {
				output[offset + c] = String.fromCharCode(counterBlock[c]);
			}
		}
		return output.join("");
	};
	var blockSize = 16;
	this.key = this.String2Array(key, null);
	this.keySchedule = AES.keyExpansion(this.key);
};