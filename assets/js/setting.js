function setting_store() {
	show('assets/modalView/setting/ajax-setting-store.html').then(function(result) {
		$('#setting_content_title').text('매장 설정');
		$('#storename').val(cookies.storeInfo.storeName);
		$('#storePhoneNumber').val(cookies.storeInfo.phoneNumber);
		$('#storeCEOPhoneNumber').val(cookies.storeInfo.ceoPhoneNumber);
		$('#address').val(cookies.storeInfo.fullAddress);
	});
}

function setting_reserv() {
	show('assets/modalView/setting/ajax-setting-reserv.html').then(function(result) {
		$('#setting_content_title').text('예약 설정');
	});
}

function setting_alarmTalk() {
	show('assets/modalView/setting/ajax-setting-alarmTalk.html').then(function(result) {
		$('#setting_content_title').text('알림톡 설정');
		drawProcess((500 / 6000) * 100);
	});
}

function setting_table() {
	show('assets/modalView/setting/ajax-setting-table.html').then(function(result) {
		$('#setting_content_title').text('테이블 설정');

		for(var i = 0; i < storeSetting.targets.length; i++)
		{
			var target = storeSetting.targets[i];
			$('#tableList').append('<li>' + target.targetName + '</li>');
		}

	});
}

function show(_url) {
	return new Promise(function(resolve, reject) {
		$.ajax({
		url: _url, // 요청 할 주소
		async: false, // false 일 경우 동기 요청으로 변경
		type: 'GET', // GET, PUT
		data: {}, // 전송할 데이터
		dataType: 'html', // xml, json, script, html
			success: function(result) {
				document.getElementById('setting_content_item').innerHTML = result;
				resolve(true);
			}, // 요청 완료 시
			error: function(error) {
				alert('문의 주세요(010-9291-9215)', alert);
				reject(error);
			} // 요청 실패
		});
	});
}

function drawProcess(_val) {
	var canvas = document.getElementById('canvas'),
	    spanPercent = document.getElementById('percentStr'),
	    canvasContext = canvas.getContext('2d');

	var posX = canvas.width / 2,
	    posY = canvas.height / 2,
	    percent = 0, // 현재 %
	    onePercentDegree = 360 / 100, // 1% 각도 = 360도 / 100% 맵핑
	    result = onePercentDegree * _val; // 돌아야하는 각도

	canvasContext.lineCap = 'round';
	var deegres = 0;
    var acrInterval = setInterval (function() {
	  	canvasContext.clearRect( 0, 0, canvas.width + 100, canvas.height + 100 );
	  	percent = deegres / onePercentDegree;
	  	spanPercent.innerHTML = percent.toFixed();

	  	canvasContext.beginPath();
	  	canvasContext.arc( posX, posY, 90, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) );
	  	canvasContext.strokeStyle = '#ccc';
	  	canvasContext.lineWidth = '3';
	  	canvasContext.stroke();

	  	canvasContext.beginPath();
	  	canvasContext.strokeStyle = '#ff7860';
	  	canvasContext.lineWidth = '6';
	  	canvasContext.arc( posX, posY, 90, (Math.PI/180) * 270, (Math.PI/180) * (270 + deegres) );
	  	canvasContext.stroke();

		deegres++;

		// 정해진 각도가 되면 타이머 탈출
	  	if( deegres >= result )
			clearInterval(acrInterval);
	}, 5);
}
