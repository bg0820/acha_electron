
$(document).ready(function() {
	$('#alert').click(function() {
		$('#noti').removeClass('notification');
		var clickBack = document.getElementById('clickBackground');
		var alertView = document.getElementById('alertModal');
		clickBack.style.display = 'block';
		alertView.style.display = 'inline-block';
	});

	//
	$('#settings').click(function() {
		popupSettings();
		drawProcess((500 / 6000) * 100);
	});

	// 예약 추가 버튼 눌렀을경우
	$('#addReservBtn').click(function() {
		popupReserv();
	});
});

window.onclick = function(event) {
	// modal 백그라운드 클릭시 모달창 닫기
	var modal = document.getElementById('modalBackground');
    if (event.target == modal)
        modal.style.display = "none";

	// 컨텍스트 메뉴 배경 클릭시 컨텍스트 메뉴창 닫기
	var contextBack = document.getElementById('clickBackground');
	if(event.target == contextBack)
	{
		clickBackgroundClose();
	}

/*
	// 알림창 배경 클릭시 알림창 닫기
	var notiBack = document.getElementById('notiBackground');
	if(event.target == notiBack)*/

	$('.calendar-day').bind('click', function() {
		var clickDate = $(this).attr('date-number');

		// 예약 날짜에 선택한 날짜 넣기
		document.getElementById('reservDate').value = clickDate;

		// 날짜 선택창 없애기
		var elem = document.getElementById('calendarWrap');
		elem.style.display = 'none';

		// 입력 이벤트 초기화
		$('.calendar-day').unbind("click");
	});

	// 알림 정렬 메뉴 클릭
	$("#alertSortMenu li" ).bind( "click", function() {
		$("#alertSortMenu li" ).removeClass('select');

		var clickType = $(this).attr('type');
		$(this).addClass('select');
		switch(clickType)
		{
			case 'all':
				alertSortingView('all');
				//console.log('all');
				break;
			case 'reserved':
				alertSortingView('reserved');
				//console.log('reservconfirm');
				break;
			case 'usercancel':
				alertSortingView('usercancel');
				//console.log('reservcanel');
				break;
			case 'notice':
				alertSortingView('notice');
				//console.log('notice');
				break;
		}

		$("#alertSortMenu li" ).unbind("click");
	});

	// 테이블에 대한 ContexMenu
	var reservTableItem = $(event.target);
	if(reservTableItem.attr('table-number'))
	{
		// 예약 되어있지 않은 테이블만
		if(!event.target.firstElementChild)
		{
			var contextMenu = document.getElementById('contextMenu');

			contextBack.style.display = 'block';
			contextMenu.style.display = 'inline-block';
			var contextItem = "<li type='add' class='menuItem edit'><span>예약추가</span></li>";
			$(contextMenu).html(contextItem);

			// 오른쪽 사이즈 넘음, width = 200px 임
			if(document.body.clientWidth - contextMenu.offsetWidth < event.clientX)
				contextMenu.style.left = (event.clientX - contextMenu.offsetWidth) + 'px';
			else
				contextMenu.style.left = event.clientX + 'px';

			// 아래쪽 사이즈 넘음
			if(document.body.clientHeight - contextMenu.offsetHeight < event.clientY)
				contextMenu.style.top = (event.clientY - contextMenu.offsetHeight) + 'px';
			else
				contextMenu.style.top = event.clientY + 'px'

			var tableNumber = $(event.target).attr('table-number').split('-');
			var tableName = tableNumber[0];
			var time = tableNumber[1];
			var timeSplit = time.split('.');
			var hour = timeSplit[0];
			var minute = 0;

			if(timeSplit.length > 1)
				minute = 30;

			$("#contextMenu li" ).bind( "click", function() {
				popupReserv(tableName, hour, minute);

				$("#contextMenu li" ).unbind("click");
				contextBack.style.display = "none";
			});
		}
	}

	// 예약에 대한 ContextMenu
	var reservItem = $(event.target);
	if(reservItem.attr('reservId'))
	{
		var contextMenu = document.getElementById('contextMenu');

		contextBack.style.display = 'block';
		contextMenu.style.display = 'inline-block';
		var contextItem = "<li type='currentStatus' class='currentStatus'><span>상태 : </span><span id='statusStr'></span></li><li class='menuItemLine'></li><li type='edit' class='menuItem edit'><span>예약수정</span></li><li class='menuItemLine'></li><li type='storecancel' class='menuItem'><span>매장취소</span></li><li type='usercancel' class='menuItem'><span>고객취소</span></li><li type='visit' class='menuItem'><span>방문</span></li><li type='noshow' class='menuItem'><span>노쇼</span></li>";
		$(contextMenu).html(contextItem);

		// 오른쪽 사이즈 넘음, width = 200px 임
		if(document.body.clientWidth - contextMenu.offsetWidth < event.clientX)
			contextMenu.style.left = (event.clientX - contextMenu.offsetWidth) + 'px';
		else
			contextMenu.style.left = event.clientX + 'px';

		// 아래쪽 사이즈 넘음
		if(document.body.clientHeight - contextMenu.offsetHeight < event.clientY)
			contextMenu.style.top = (event.clientY - contextMenu.offsetHeight) + 'px';
		else
			contextMenu.style.top = event.clientY + 'px';

		var _reservId = $(reservItem).attr('reservId');

		// 예약 상태 가져와서 상태 메시지 띄워주기
		switch($(reservItem).attr('reservStatus'))
		{
			case 'reservwait':
				$('#statusStr').text('확정 대기');
				break;
			case 'reserved':
				$('#statusStr').text('예약 확정');
				break;
			case 'visit':
				$('#statusStr').text('방문 완료');
				break;
			case 'noshow':
				$('#statusStr').text('예약 부도');
				break;
		}

		// 컨텍스트 메뉴 아이템 클릭시 작동 이벤트
		$("#contextMenu li" ).bind( "click", function() {
			var clickType = $(this).attr('type');

			switch(clickType)
			{
				case 'edit':
					reservEditPopup(_reservId);
					break;
				case 'storecancel':
					reservStatusChange(_reservId, 'storeCancel');
					break;
				case 'usercancel':
					reservStatusChange(_reservId, 'userCancel');
					break;
				case 'visit':
					reservStatusChange(_reservId, 'visit');
					break;
				case 'noshow':
					reservStatusChange(_reservId, 'noshow');
					break;
			}
			$("#contextMenu li" ).unbind("click");
			contextBack.style.display = "none";
		});
	}
}


// 스크롤
$(function () {
    $('#reservTimeScroll').scroll(function () {
        var xPoint = $('#reservTimeScroll').scrollLeft();
        $('.timeBar').scrollLeft(xPoint);
		var yPoint = $('#reservTimeScroll').scrollTop();
		$('.nameList').scrollTop(yPoint);
    });
});

function onAlertListScroll(elem)
{
	var alertList = document.getElementById('alertList');
	var alertScrollWrap = document.getElementById('alertScrollWrap').offsetHeight;
	var yPoint = alertList.scrollTop;

	console.log('-------------------------------');
	console.log(alertScrollWrap);
	console.log(alertList.offsetHeight);
	console.log((alertScrollWrap - alertList.offsetHeight));
	console.log(yPoint);
	console.log('-------------------------------');
	// 끝자락 도착
	if((alertScrollWrap - alertList.offsetHeight) < yPoint)
	{
		getAlertItems();
		console.log("D");
	}

}

function zeroFormating(num, len = 2)
{
	if(len == 2)
		return num < 10 ? '0' + num : num;
	else if(len == 3)
		return num < 10 ? '00' + num : (num < 100 ? '0' + num : num);
	else
		return num;
}

// 0000년 00월 00일 오전/오후 00:00
function dateForm(date) {
	var monthStr = zeroFormating((date.getMonth() + 1));
	var dateStr = zeroFormating(date.getDate());
	var minuteStr = zeroFormating(date.getMinutes());
	var hour = date.getHours();
	var ampm = "오전";
	if(hour >= 12) {
		ampm = "오후"
		hour %= 12;
	}
	var hourStr = zeroFormating(hour);

	return date.getFullYear() + '년 ' + monthStr + '월 ' + dateStr + '일 ' +  ampm + ' ' + hourStr + ':' + minuteStr;
}


function requestAjaxAsync(url, type, arg)
{
	return new Promise(function (resolve, reject) {
		$.ajax({
	    	url: url, // 요청 할 주소
	    	async: true, // false 일 경우 동기 요청으로 변경
	    	type: type, // GET, PUT
	    	data: arg, // 전송할 데이터
	    	dataType: 'json', // xml, json, script, html
			success: function(result) {
				resolve(result);
			}, // 요청 완료 시
		    error: function(error) {
				reject(error);
			} // 요청 실패
		});
	});
}

function requestAjax(url, type, arg)
{
	$.ajax({
	    url: url, // 요청 할 주소
	    async: false, // false 일 경우 동기 요청으로 변경
	    type: type, // GET, PUT
	    data: arg, // 전송할 데이터
	    dataType: 'json', // xml, json, script, html
		success: function(result) {
			return result;
		}, // 요청 완료 시
		error: function(error) {
			console.log(error);
			return false;
		} // 요청 실패
	});
}

function arrayToString(_array) {
	var resultStr = "";

	for(var i = 0; i < _array.length; i++)
	{
		if(_array.length - 1 == i)
			resultStr += _array[i];
		else
			resultStr += _array[i] + ',';
	}

	return resultStr;
}

function stringToArray(_string) {
	if(!_string)
		return [];

	var resultArray = [];
	var splitArray = _string.split(',');

	// trim 때문에 반복
	for(var j =0; j < splitArray.length; j++)
		resultArray.push(splitArray[j].trim());

	return resultArray;
}
