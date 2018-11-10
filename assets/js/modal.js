let _editReservId;
let selectTableList;

// offset[first, last]
function addNotification(data, offset) {
	// 예약 알림 동그라미
	$('#noti').addClass('notification');

	var _reservId = data.reservUUID;
	if(!_reservId)
		_reservId = data.reservUUID;

	var _status = data.status;
	if(!_status)
		_status = data.changeStatus;

	if(!(_status == 'reserved' || _status == 'usercancel'))
		return;

	var _timestamp = data.timestamp;
	if(!_timestamp)
		_timestamp = data.date;

	// D-DAY 계산
	var reservTime = new Date(data.reservTime);
	var reservDate = new Date(reservTime.getFullYear(), reservTime.getMonth() + 1, reservTime.getDate());
	var nowDate = new Date();
	var toDay = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate());
	var diff = reservDate - toDay;
	var currDay = 24 * 60 * 60 * 1000;// 시 * 분 * 초 * 밀리세컨
	var diffDay = parseInt(diff / currDay);

	var phoneNumber = '';
	if(data.phoneNumber)
	{
		var regex = /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/;
		phoneNumber = data.phoneNumber.toString().replace(regex, "$1-$2-$3");
	}
	var ddayStr = "D-Day";
	if(diffDay > 0)
		ddayStr = "D-" + diffDay;

	var reservDateStr = dateForm(reservTime);
	var dateStr = dateForm(new Date(_timestamp));

	var stateStr = "";
	if(_status == 'reserved')
		stateStr = "예약확정"
	else if(_status == 'usercancel')
		stateStr = "예약취소";

	var alertListItem = "";
	alertListItem += "<div type=\"" +_status +  "\" class=\"alert_list_item\">";
	alertListItem += "<div class=\"alert_top\">";
	alertListItem += "<div class=\"time\">" + dateStr + "</div>";
	alertListItem += "</div>";
	alertListItem += "<div class=\"alert_content\">";
	alertListItem += "<div class=\"flexcenter_align\">";
	alertListItem += "<div class=\"alert_state flexcenter " + _status +"\">" + stateStr + "</div>";
	alertListItem += "</div>";
	alertListItem += "<div class=\"alert_msg_area\">";
	alertListItem += "<div class=\"alert_msg\">";
	//alertListItem += "<div class=\"remain_day\">" + ddayStr + "</div>";
	alertListItem += "<div class=\"reserv_name_str\">" + data.reservName + "</div>";
	alertListItem += "<div class=\"reserv_phoneNumber\">" + phoneNumber + "</div>";

	alertListItem += "</div>";
	alertListItem += "<div class=\"alert_msg_detail\">";
	alertListItem += "<div class=\"reserv_time\">";
	alertListItem += "<i class=\"time_icon\"></i>";
	alertListItem += "<span>" + reservDateStr + "</span>";
	alertListItem += "</div>";
	alertListItem += "<div class=\"reserv_number\">";
	alertListItem += "<i class=\"reserv_number_icon\"></i>";
	alertListItem += "<span>" + data.reservNumber + "</span>";
	alertListItem += "</div>";
	alertListItem += "<div class=\"position_name\">";
	alertListItem += "<i class=\"table_icon\"></i>";
	alertListItem += "<span>"  + data.reservTarget + "</span>";
	alertListItem += "</div>";
	alertListItem += "</div>";
	alertListItem += "</div>";
	alertListItem += "</div>";
	alertListItem += "</div>";

	if(offset == 'first')
		$('#alertScrollWrap').prepend(alertListItem);
	else if(offset == 'last')
		$('#alertScrollWrap').append(alertListItem);
}

function alertSortingView(_type)
{
	var listItem = $('#alertList .alert_list_item');
	listItem.removeClass('disabled');

	if(_type != 'all')
	{
		for(var i = 0; i < listItem.length; i++)
		{
			if($(listItem[i]).attr('type') != _type)
				$(listItem[i]).addClass('disabled');
		}
	}
}

function reservStatusChange(_reservId, _status) {
	$.ajax({
	url: 'http://test.acha.io:3000/store/reserv/edit/status', // 요청 할 주소
	async: true, // false 일 경우 동기 요청으로 변경
	type: 'GET', // GET, PUT
	data: {
		token: cookies.token,
		reservId: _reservId,
		status: _status,
		reason: '사유'
	}, // 전송할 데이터
	dataType: 'json', // xml, json, script, html
		success: function(result) {
		}, // 요청 완료 시
		error: function(error) {
			alert('문의 주세요(010-9291-9215)', alert);
		} // 요청 실패
	});
}

function reservEditPopup(_reservId) {
	_editReservId = _reservId;
	selectTableList = [];

	showModal('assets/modalView/ajax-reservedit.html');
	var data = {
		token: cookies.token,
		reservId: _reservId
	};

	requestAjaxAsync('http://test.acha.io:3000/store/reserv/inquery', 'GET', data).then(function(result) {
		var reserv = result.reserv;
		var reservTime = new Date(reserv.reservTime);
		var monthStr = zeroFormating((reservTime.getMonth() + 1));
		var dateStr = zeroFormating(reservTime.getDate());
		var hourStr = zeroFormating(reservTime.getHours());
		var minuteStr = zeroFormating(reservTime.getMinutes());
		var date = reservTime.getFullYear() + '-' + monthStr + '-' + dateStr;
		var time = hourStr + ':' + minuteStr;

		$('#reservDate').val(date);
		$('#reservTime').val(time);
		$('#numberStr').text(reserv.reservNumber);
		// $('#reservMoney').val(reserv.reservMoney);
		selectTableList = reserv.reservTarget;
		$('#table').val(selectTableList);
		// $('#manager').val(reserv.manager);
		$('#memo').val(reserv.memo);
	});

}

function reservEdit()
{
	var reservDate = $('#reservDate').val();
	var reservTime = $('#reservTime').val();
	var reservDateArr = reservDate.split('-');
	var reservTimeArr = reservTime.split(':');

	var date = new Date(reservDateArr[0], Number(reservDateArr[1]) - 1, reservDateArr[2], reservTimeArr[0], reservTimeArr[1], 0);
	var reservTimestamp = Number(date);

	var data = {
		token: cookies.token,
		reservId: _editReservId, // undefined
		reservNumber: $('#numberStr').text().trim(),
		// manager: $('#manager').val(),
		reservTime: reservTimestamp,
		//reservMoney: $('#reservMoney').val(),
		tableName: selectTableList,
		memo: $('#memo').val(),
	};

	requestAjaxAsync(
		'http://test.acha.io:3000/store/reserv/edit',
		'POST',
		data
	).then(function(result) {
		if(result.result == "success")
		{
			close();
			removeReserv(_editReservId);
			// 오늘 세팅
			updateDate(currentDate);

			alert('예약이 수정되었습니다.');
		}
		else
			alert(result.msg);

	});
}

function cancel() {
	close();
}

function seclectPopupMenuClose()
{
	var modal1 = document.getElementById('seclectPopupMenu');
	modal1.style.display = 'none';
}

function close()
{
	var modal = document.getElementById('modalBackground');
	modal.style.display = 'none';
	var setting = document.getElementById('settingView');
	setting.style.display = 'none';
}

function clickBackgroundClose()
{
	var clickBack = document.getElementById('clickBackground');
	var alertModal = document.getElementById('alertModal');
	clickBack.style.display = 'none';
	alertModal.style.display = 'none';
}

function reservPopupInit(tableName, hour, minute)
{
	// 빈 테이블 클릭해서 테이블 지정하고 예약 추가창 열렸을경우 tableName 이 지정되어있음
	if(tableName)
	{
		selectTableList.push(tableName);
		$('#table').val(selectTableList);
	}

	$('#reservTimeSpan').val(cookies.storeInfo.defaultReservTimeSpanMin + "분");

	var date = currentDate;

	var _hour = hour;
	var _minute = minute;

	if(!_hour)
		_hour = date.getHours();
	if(!_minute)
		_minute = 0;

	var monthStr = zeroFormating((date.getMonth() + 1));
	var dateStr = zeroFormating(date.getDate());
	var hourStr = zeroFormating(_hour);
	var minuteStr = zeroFormating(_minute);

	document.getElementById('reservDate').value = date.getFullYear() + '-' + monthStr + '-' + dateStr;
	document.getElementById('reservTime').value = hourStr + ':' + minuteStr;
}

function showModal(_url) {
	return new Promise(function(resolve, reject) {
		var modal = document.getElementById('modalBackground');
		modal.style.display = "flex";

		$.ajax({
		url: _url, // 요청 할 주소
		async: false, // false 일 경우 동기 요청으로 변경
		type: 'GET', // GET, PUT
		data: {}, // 전송할 데이터
		dataType: 'html', // xml, json, script, html
			success: function(result) {
				document.getElementById('modalBackground').innerHTML = result;
				resolve(true);
			}, // 요청 완료 시
			error: function(error) {
				alert('문의 주세요(010-9291-9215)', alert);
				reject(error);
			} // 요청 실패
		});
	});
}

function showSetting(_url) {
	return new Promise(function(resolve, reject) {
		var modal = document.getElementById('settingView');
		modal.style.display = "flex";

		$.ajax({
		url: _url, // 요청 할 주소
		async: false, // false 일 경우 동기 요청으로 변경
		type: 'GET', // GET, PUT
		data: {}, // 전송할 데이터
		dataType: 'html', // xml, json, script, html
			success: function(result) {
				document.getElementById('settingView').innerHTML = result;
				resolve(true);
			}, // 요청 완료 시
			error: function(error) {
				alert('문의 주세요(010-9291-9215)', alert);
				reject(error);
			} // 요청 실패
		});
	});
}



function dateInputClick(elem) {
	var elem = document.getElementById('calendarWrap');
	elem.style.display = 'flex';

	// 화면 중앙에 위치 시키기
	var left = (document.body.scrollWidth - elem.offsetWidth) / 2;
	var top = (document.body.scrollHeight - elem.offsetHeight) / 2;

	$('#calendarWrap').css('left', left);
	$('#calendarWrap').css('top', top);

	showCalendar();
}

function tableInputClick() {
	$.ajax({
	url: 'assets/modalView/contextMenu/table.html', // 요청 할 주소
	async: true, // false 일 경우 동기 요청으로 변경
	type: 'GET', // GET, PUT
	data: {}, // 전송할 데이터
	dataType: 'html', // xml, json, script, html
		success: function(result) {
			var elem = document.getElementById('seclectPopupMenu');
			elem.innerHTML = result;

			// 화면 중앙에 위치 시키기
			var left = (document.body.scrollWidth - 520) / 2;
			var top = (document.body.scrollHeight - 238) / 2;

			$('#seclectPopupMenu').css('left', left);
			$('#seclectPopupMenu').css('top', top);
			$('#seclectPopupMenu').show();

			// 테이블 init
			tableInit();
		}, // 요청 완료 시
		error: function(error) {
			alert('문의 주세요(010-9291-9215)', alert);
		} // 요청 실패
	});
}

function tableInit()
{
	var dateArr = document.getElementById('reservDate').value.split('-');
	var timeArr = document.getElementById('reservTime').value.split(':');

	var _startDate = Number(new Date(dateArr[0], Number(dateArr[1]) - 1, dateArr[2], timeArr[0], timeArr[1], 0));
	var reservTimeSpan = $('#reservTimeSpan').val().split('분')[0];
	var _endDate = Number(new Date(Number(_startDate) + (1000 * 60 * reservTimeSpan)));
	var arg = {
		token: cookies.token,
		startTime: _startDate,
		endTime: _endDate
	};

	// 테이블이 예약되어 있는지 확인
	requestAjaxAsync('http://test.acha.io:3000/store/reserv/isCheck', 'GET', arg).then(function(result) {
		$('#selectList').html('');
		for(var i = 0; i < storeSetting.targets.length; i++)
		{
			var target = storeSetting.targets[i];

			if(!result.reservedTableList.includes(target.targetName))
				$('#selectList').append('<li>' + target.targetName + '</li>');
			else
				$('#selectList').append('<li class=\"disabledTable\">' + target.targetName + '</li>');
		}

		var selectList = $('#selectList li');
		var index;

		// 선택한 테이블, 다시 테이블 선택창 들어가도 선택되어있게
		tempSelectTableList = selectTableList;
		selectTableList = [];

		if(tempSelectTableList.length > 0)
		{
			var selectList = $('#selectList li');
			for(var i = 0 ; i < selectList.length; i++)
			{
				if(tempSelectTableList.includes($(selectList[i]).text()))
				{
					$(selectList[i]).addClass('tableSelect');
					selectTableList.push($(selectList[i]).text());
				}
			}
		}

		selectList.click(function(){
			index = selectList.index(this);

			// 블락된 테이블을 클릭했을경우
			if($(this).hasClass('disabledTable'))
				alert('이미 예약이 잡혀있습니다.');
			else
			{
				// 테이블이 Select 되어있을경우 누르면 선택 해제
				if($(this).hasClass('tableSelect'))
				{
					// 테이블 선택 해제
					$(this).removeClass('tableSelect');
					// 선택된 테이블목록에서 삭제
					selectTableList.splice(selectTableList.indexOf($(this).text()), 1 );
				}
				else
				{
					$(this).addClass('tableSelect');
					console.log($(this).text());
					selectTableList.push($(this).text());
				}
			}

		});
	}).catch(function(error) {
		alert(error, '문의주세요 010-9291-9215');
	});
}

function tablePopupDone() {
	if(selectTableList.length > 0)
	{
		console.log(selectTableList);
		seclectPopupMenuClose();
		$('#table').val(selectTableList);
	}
	else
		alert('테이블을 선택해주세요.');
}


/*
function managerInputClick() {
	$.ajax({
	url: 'modalView/contextMenu/manager.html', // 요청 할 주소
	async: false, // false 일 경우 동기 요청으로 변경
	type: 'GET', // GET, PUT
	data: {}, // 전송할 데이터
	dataType: 'html', // xml, json, script, html
		success: function(result) {
			document.getElementById('seclectPopupMenu').innerHTML = result;

			var left = (document.body.scrollWidth - 520) / 2;
			var top = (document.body.scrollHeight - 238) / 2;

			$('#seclectPopupMenu').css('left', left);
			$('#seclectPopupMenu').css('top', top);
			$('#seclectPopupMenu').show();

			// 테이블 init
			$('#selectList').html('');
			for(var i = 0; i < managers.length; i++)
				$('#selectList').append('<li>' + managers[i] + '</li>');

			var selectList = $('#selectList li');
			var index;

			selectList.click(function(){
				$(this).addClass('tableSelect');
				$('#manager').val($(this).text());
				seclectPopupMenuClose();
			});
		}, // 요청 완료 시
		error: function(error) {
			alert('문의 주세요(010-9291-9215)', alert);
		} // 요청 실패
	});
}*/

function reserv()
{
	var reservDate = $('#reservDate').val();
	var reservTime = $('#reservTime').val();
	var reservDateArr = reservDate.split('-');
	var reservTimeArr = reservTime.split(':');
	var reservTimeSpan = $('#reservTimeSpan').val().split('분')[0];

	// 예약 날짜 단순화
	var date = new Date(reservDateArr[0], Number(reservDateArr[1]) - 1, reservDateArr[2], reservTimeArr[0], reservTimeArr[1], 0);
	var reservTimestamp = Number(date);
    // POST 값으로 보낼 값 정의
	var data = {
		token: cookies.token,
		phoneNumber: $('#phoneNumber').val(),
		reservNumber: $('#numberStr').text().trim(),
		//manager: $('#manager').val(),
		reservTime: reservTimestamp,
		reservTimeSpanMin: reservTimeSpan,
		//reservMoney: $('#reservMoney').val(),
		name: $('#name').val(),
		reservTarget: selectTableList,
		memo: $('#memo').val(),
	};

	close();
	// 예약 Rest API Http Request 요청
	requestAjaxAsync(
		'http://test.acha.io:3000/store/reserv',
		'POST',
		data
	).then(function(result) {
		if(result.result == "success")
		{
			// 예약이 완료되면 갱신
			updateDate(currentDate);
			alert('예약이 완료되었습니다.');
		}
		else
			alert(result.msg);

	});
}

function checkPhoneNumber(doc) {
	var regex = /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/;
	var number = doc.value.replace(/-/gi, "");
	var val = doc.value;
	val = number.replace(regex, "$1-$2-$3");
	doc.value = val;

	if(val.length >= 11)
	{
		if(regex.test(number))
		{
			requestAjaxAsync(
				'http://test.acha.io:3000/store/user/info',
				'GET',
			 	{token: cookies.token, phoneNumber: number}
			).then(function(result) {
				console.log(result);
				$('#storeReservStr').text(result.userInfo.storeReservCnt);
				$('#storeVisitStr').text(result.userInfo.storeVisitCnt);
				$('#storeCancelStr').text(result.userInfo.storeUserCancelCnt);
				$('#storeNoshowStr').text(result.userInfo.storeNoshowCnt);

				$('#totalReservStr').text('(' + result.userInfo.totalReservCnt + ')');
				$('#totalNoshowStr').text('(' + result.userInfo.totalNoshowCnt + ')');
			});
		}
	}
	else
		statisticsClear();
}

function statisticsClear()
{
	$('#storeReservStr').text(0);
	$('#storeVisitStr').text(0);
	$('#storeCancelStr').text(0);
	$('#storeNoshowStr').text(0);

	$('#totalReservStr').text('(' + 0 + ')');
	$('#totalNoshowStr').text('(' + 0 + ')');
}

function minus() {
	var n = Number(document.getElementById('numberStr').innerText);

	if(n >= 2)
		document.getElementById('numberStr').textContent = n - 1;
}

function plus() {
	var n = Number(document.getElementById('numberStr').innerText);
	document.getElementById('numberStr').textContent = n + 1;
}
