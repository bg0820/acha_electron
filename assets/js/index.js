let currentDate = new Date();
let dayStrArr = ['일', '월', '화', '수', '목', '금', '토'];
let tables = [];
let managers = [];
let alarmInterval = [];
let storeSetting;

// 10초마다 refresh
setInterval(currentTimeBar, 10000);

function indexLoad()
{
	getCookies().then(function() {
		// 매장 설정 정보 가져오기
		return getStoreSetting();
	}).then(function(result) {
		$('#storeName').text(result.storeInfo.storeName);

		// 서버 쪽 연결후 매장 정보 보내기
		socket.emit('conn', cookies);

		// 알림창 초기 세팅
		initAlertView();
		// 최신 알림정보 15개 가져오기
		getAlertItems();

		// 테이블 배치
		indexInit();
	});
}

window.onload = indexLoad;

function getAlertItems()
{
	$.ajax({
	url: 'http://test.acha.io:3000/store/push', // 요청 할 주소
	async: false, // false 일 경우 동기 요청으로 변경
	type: 'GET', // GET, PUT
	data: {
		token: cookies.token,
		number: 15,
		offset: _gOffset,
	}, // 전송할 데이터
	dataType: 'json', // xml, json, script, html
		success: function(result) {
			for(var item = 0; item < result.alarmList.length; item++)
				addNotification(result.alarmList[item], 'last');

			_gOffset += 15;
			console.log(result);
		}, // 요청 완료 시
		error: function(error) {
			alert('문의 주세요(010-9291-9215)', alert);
		} // 요청 실패
	});
	/*
	ipc.send('getAlertItems', {offset: _gOffset, num: 15});

	ipc.once('getAlertItems', function(event, response) {
		if( response.list.length != 0)
		{
			for(var item = 0; item < response.list.length; item++)
				addNotification(response.list[item], 'last');

			_gOffset += 15;
		}
	});*/
}

function popupReserv(tableName, hour, minute)
{
	selectTableList = [];
	showModal('assets/modalView/ajax-reservadd.html');
	reservPopupInit(tableName, hour, minute);
}

function initAlertView() {
	$.ajax({
	url: 'assets/modalView/ajax-alertview.html', // 요청 할 주소
	async: false, // false 일 경우 동기 요청으로 변경
	type: 'GET', // GET, PUT
	data: {}, // 전송할 데이터
	dataType: 'html', // xml, json, script, html
		success: function(result) {
			document.getElementById('alertModal').innerHTML = result;
		}, // 요청 완료 시
		error: function(error) {
			alert('문의 주세요(010-9291-9215)', alert);
		} // 요청 실패
	});
}

function getStoreSetting() {
	return new Promise(function(resolve, reject) {
		$.ajax({
		url: 'http://test.acha.io:3000/store/setting', // 요청 할 주소
		async: true, // false 일 경우 동기 요청으로 변경
		type: 'GET', // GET, PUT
		data: {
			token: cookies.token
		}, // 전송할 데이터
		dataType: 'json', // xml, json, script, html
			success: function(result) {
				console.log('store/setting', result);
				storeSetting = result.storeInfo;

				resolve(result);
			}, // 요청 완료 시
			error: function(error) {
				alert('문의 주세요(010-9291-9215)', alert);
				reject(error);
			} // 요청 실패
		});
	});
}

// 특정 날짜 예약 검색
function getReservSearch(year, month, day) {
	var searchTimeStamp = Number(new Date(year, month - 1, day));

	$.ajax({
    url: 'http://test.acha.io:3000/store/reserv/search', // 요청 할 주소
    async: true, // false 일 경우 동기 요청으로 변경
    type: 'GET', // GET, PUT
    data: {
		token: cookies.token,
        startDate: searchTimeStamp,
        endDate: searchTimeStamp + 86400000 // 오늘 ~ 내일 전까지
    }, // 전송할 데이터
    dataType: 'json', // xml, json, script, html
	    success: function(result) {
			attachReservToTable(result);
		}, // 요청 완료 시
	    error: function(error) {
			console.log(error);
		} // 요청 실패.
	});
}

// 예약 있으면 테이블 연결
// TODO 오후 12시에 예약할시에 전날 0시, 다음날 0시 둘다 뜨는 문제 해결해야함
function attachReservToTable(json)
{
	var _reservList = json.reservList;

	for(var i = 0; i< _reservList.length; i++)
	{
		var reserv = _reservList[i];
		//console.log(reserv);
		var date = new Date(reserv.reservTime);
		var minute = date.getMinutes() / 30; // 0 or 1 -> 0분 이거나 30분 이거나
		var minstr = '';
		if(minute == 1)
			minstr = '.5';
		var reservTimeSpan = reserv.reservTimeSpanMin / 30;
		var widthReserv = 90 * reservTimeSpan;

		// 표시되는 이름
		var viewName = "";
		if(reserv.reservName)
			viewName = reserv.reservName;
		else
		{
			if(reserv.phoneNumber)
			{
				viewName = reserv.phoneNumber.substring(7, reserv.phoneNumber.length);
			}
			else
				viewName = "사용자가 정보를 등록하지 않았습니다."
		}


		var div = "<div reservStatus='" + reserv.reservStatus + "' reservId='" + reserv.reservUUID + "' class='flexcenter reservInfo " + reserv.reservStatus + "'>" + viewName + "</div>";
		for(var j = 0 ; j< reserv.reservTarget.length; j++)
		{
			var tableItem = $('*[table-number="' + reserv.reservTarget[j] + '-' + date.getHours() + minstr + '"]');
			tableItem.html(div);

			$($(tableItem)[0].children[0]).css('width', widthReserv);

			// 예약이 몇분짜리인지 판별후 뒤에 테이블 지우기
			/*for(var k = 2; k < reservTimeSpan; k++)
				$('*[table-name="' + reserv.reservTarget[j] + '"]')[(date.getHours() * 2) + k].remove();*/
		}
	}
}

function indexInit() {
	tableInitialize();
	// 오늘 세팅
	updateDate(currentDate);
	// 초록색 막대로 현재 시간 표시
	currentTimeBar();
	// 현재 시간 위치로 테이블 스크롤 이동
	setTime();
}

// 테이블 배치
function tableInitialize()
{
	document.getElementById('nameList').innerHTML = "";
	document.getElementById('reservTimeTable').innerHTML = "";

	var nameListhtmlStr = "";
	var tableshtmlStr = "";
	var targets = storeSetting.targets;

	// nameList 생성
	nameListhtmlStr += "<tbody>";
	for(var tr = 0; tr < targets.length; tr++)
		nameListhtmlStr += "<tr><td>" + targets[tr].targetName + "</br>(" + targets[tr].targetNumber + "인석)</td></tr>";
	nameListhtmlStr += "</tbody>"

	// 테이블 생성
	tableshtmlStr += "<tbody>";
	for(var tr = 0; tr < targets.length; tr++)
	{
		tableshtmlStr += "<tr>";
		var i = 0;

		for(var td = 0 ; td < 48; td++)
		{
			if(td % 2 != 0)
				tableshtmlStr += "<td class='hourEnd' table-name='" + targets[tr].targetName +  "' table-number='" + targets[tr].targetName + "-" + (td / 2) + "'></td>";
			else
				tableshtmlStr += "<td table-name='" + targets[tr].targetName +  "' table-number='" + targets[tr].targetName + "-" + (td / 2) + "'></td>";
		}

		tableshtmlStr += "</tr>";
	}
	tableshtmlStr += "</tbody>"

	document.getElementById('nameList').innerHTML  += nameListhtmlStr;
	document.getElementById('reservTimeTable').innerHTML  += tableshtmlStr;

	var reservTimeTable = document.getElementById('reservTimeTable').offsetHeight;
	document.getElementById('currentTime').style.height = reservTimeTable + "px";
}

function removeReserv(_reservId)
{
	$('*[reservid="' + _reservId + '"]').remove();
}

function changeReserv(_reservId, _status)
{
	// 없을경우 새로고침
	if($('*[reservid="' + _reservId + '"]').length == 0)
	{
		updateDate(currentDate);
		return;
	}
	// 매장 취소, 고객 취소의 경우 테이블에서 제거
	if(_status == 'usercancel' || _status =='storecancel')
	{
		removeReserv(_reservId);
		return;
	}

	var reservElem = $('*[reservid="' + _reservId + '"]');
	var prevStatus = reservElem.attr('reservstatus'); // 기존 상태 가져옴
	reservElem.attr('reservstatus', _status); // 기존 상태를 새로운 상태로 변경
	reservElem.removeClass(prevStatus); // 기존 상태 클래스  지우고
	reservElem.addClass(_status); // 새로운 상태 클래스로 변경
}


function updateDate(_date)
{
	var currentYear = _date.getFullYear();
	var currentMonth = _date.getMonth() + 1; // 0 = 1월
	var currentDay = _date.getDate();
	var currentDateStr = dayStrArr[_date.getDay()];
	currentMonthStr = zeroFormating(currentMonth);
	currentDayStr = zeroFormating(currentDay);
	var str = currentYear + '년' + ' ' + currentMonthStr + '월' + ' ' + currentDayStr + '일 (' + currentDateStr + ')';
	$('#dateStr').text(str); // 오늘 날짜로 예약 검색

	// 오늘 날짜로 예약 검색
	getReservSearch(currentYear, currentMonth, currentDay);
}

function prevMonth() {
	currentDate.setDate(currentDate.getDate() - 1);
	indexInit();
}

function nextMonth() {
	currentDate.setDate(currentDate.getDate() + 1);
	indexInit();
}

function currentTimeBar() {
	var date = new Date();
	var cuTime = document.getElementById('currentTime');
	var cuTimeHeader = document.getElementById('currentTimeHeader');

	// 오늘 날짜랑 조회하는 날짜가 같을경우에만 TimeBar 표시
	if(currentDate.getFullYear() == date.getFullYear()
	&& currentDate.getMonth() == date.getMonth()
	&& currentDate.getDate() == date.getDate())
	{
		var hours = date.getHours();
		var minute = date.getMinutes();
		var left = (hours * 180) + (minute * 3);

		cuTimeHeader.style.display = 'block';
		cuTime.style.display = 'block';

		cuTimeHeader.style.marginLeft = (left - 4.5) + "px";
		cuTime.style.marginLeft = left + "px";
	}
	else
	{
		cuTimeHeader.style.display = 'none';
		cuTime.style.display = 'none';
	}
}

function setTime()
{
	document.getElementById('reservTimeScroll').scrollLeft = (currentDate.getHours() * 180);
}

function left() {
	document.getElementById('reservTimeScroll').scrollLeft -= 180;
}

function right() {
	document.getElementById('reservTimeScroll').scrollLeft += 180;
}



/*
function sendTest()
{
	var tablesArr = [];
	var managerArr = ["홍길동", "흥부", "놀부"];
	var alarmIntervalArr = [1440, 60, 15];

	for(var i = 1 ; i <= 20; i++)
	{
		var tableOne = { tableName: "창가1", number: 4, // 좌석수
	    	note: '가나다라마바사'
		};
		tableOne.tableName = '창가' + i;
		console.log('d', tableOne);
		tablesArr.push(tableOne);
	}

	$.ajax({
    url: 'http://api.test.acha.io:3000/store/setting', // 요청 할 주소
    async: true, // false 일 경우 동기 요청으로 변경
    type: 'POST', // GET, PUT
    data: {
		token: '5b7c0d623f977c04ad6a9e1f-1535206545460',
		tables: tablesArr,
		managers: managerArr,
		alarmInterval: alarmIntervalArr
    }, // 전송할 데이터
    dataType: 'json', // xml, json, script, html
	    success: function(result) {
			console.log(result);
		}, // 요청 완료 시
	    error: function(error) {
			console.log(error);
		} // 요청 실패
	});
}
*/
