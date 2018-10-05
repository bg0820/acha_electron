const socket = io('http://test.acha.io:3000');

socket.on('connect', function() {
	console.log("서버와 연결되었습니다.");
	if(cookies.storeInfo) // 쿠키가 존재할경우에만 보냄, 보통 reconnect 시에 사용됨
	{
		socket.emit('conn', cookies);
		// socket.emit('getNotification', {storeId: cookies.storeInfo._id, lastTimestamp: 0});
	}
});

// 사용자가 예약상태를 변경하면 받음
socket.on('userStatusChange', function(data) {
	console.log('userStatusChange', data);

	/*
		let myNotification = new Notification('Title', {
	    body: 'Lorem Ipsum Dolor Sit Amet'
	  })

	  myNotification.onclick = () => {
	    console.log('Notification clicked')
	}*/

	// 예약 내용 변경
	changeReserv(data.reservId, data.changeStatus);

	// 알림창에 추가
	addNotification(data, 'first');

	// 사용자가 예약 상태 변경한것만 DB에 기록
	if(data.type == 'User')
		notificationWrite(data); // DB에 기록
});

// 대기중인 알림 가져와서 data.type 이 User 인 경우만 기록
socket.on('getWaitNotification', function(data) {
	console.log('noti,', data);


	for(var i = 0; i < data.length; i++)
	{
		if(data[i].type == 'User')
			notificationWrite(data[i]);
	}
})


socket.on('disconnect', function() {
	console.log("서버와 연결이 끊어졌습니다.");
});

// indexLoad -> getCookies().then(function() { 다음으로 호출됨
function connectSend() {
	// socket 전송
	socket.emit('conn', cookies);
}

// 마지막으로 매장이 가지고 있는 예약에 대한 시간을 보냄, 그 이후 매장이 못받은 예약 내용을 가져옴
function getWaitNotification(_timestamp) {
	socket.emit('getNotification', {storeId: cookies.storeInfo.storeUUID, lastTimestamp: _timestamp});
}
