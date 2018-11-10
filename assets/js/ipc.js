const ipc = require('electron').ipcRenderer;
let cookies = {};
let _gOffset = 0;

console.log('isElectron : ', window && window.process && window.process.type);
console.log('isElectron : ', process.versions['electron']);
/*
function getAlertItems()
{
	ipc.send('getAlertItems', {offset: _gOffset, num: 15});

	ipc.once('getAlertItems', function(event, response) {
		if( response.list.length != 0)
		{
			for(var item = 0; item < response.list.length; item++)
				addNotification(response.list[item], 'last');

			_gOffset += 15;
		}
	});
}

function notificationWrite(data)
{
	console.log('render, ', data);
	ipc.send('notificationWrite', data); // setCookie
}

function getLastNotiTime()
{
	ipc.send('getLastNotiTime', {}); // setCookie

	return new Promise(function(resolve, rejct) {
		ipc.once('lastNotification', function(event, response) {
			// 밀린 알림 정보 가져오기
			var lastTime = response.lastTimestamp;
			getWaitNotification(lastTime);

			resolve(true);
		});
	});
}*/

function login() {
	$.ajax({
    url: 'http://test.acha.io:3000/store/auth/login', // 요청 할 주소
    async: true, // false 일 경우 동기 요청으로 변경
    type: 'POST', // GET, PUT
    data: {
		id: $('#id').val(),
        pw: $('#pw').val(),
    }, // 전송할 데이터
    dataType: 'json', // xml, json, script, html
	    success: function(result) {
			if(result.result == "success")
			{
				//console.log(JSON.stringify(result));
				//$.cookie("store", JSON.stringify(result), { expires: 7, path: '/' });

				 ipc.send('loginAuth', result); // setCookie
				 location.href = 'index.html';
				// post_to_url('index.html', result);
			}
			else
				document.getElementById('resultMsg').innerHTML = result.msg;
		}, // 요청 완료 시
	    error: function(error) {
			document.getElementById('resultMsg').innerHTML = '로그인 실패 문의 주세요(010-9291-9215)';
		} // 요청 실패
	});
}

function getCookies() {
	/*return new Promise(function (resolve, reject) {
		cookies = JSON.parse($.cookie("store"));
		console.log(cookies);
		resolve(true);
	});
	*/
	ipc.send('getCookies', '');

	return new Promise(function (resolve, reject) {
		ipc.once('cookiesResponse', function(event, response){
			cookies = response;
			console.log(cookies);
			resolve(true);
		});
	});
}
