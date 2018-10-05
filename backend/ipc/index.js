const sqlite = require('../sqlite');
let loginData = {};

module.exports = {
	start: function(ipc) {
		ipc.on('loginAuth', function(event, data) {
			loginData = data; // global
		});

		ipc.on('getCookies', function(event, data) {
			event.sender.send('cookiesResponse', loginData);
		});

		ipc.on('notificationWrite', function(event, data) {
			var date = new Date(data.date);
			var reservTime = new Date(date.reservTime);

			var db = sqlite.getDb();
			db.serialize(function() {
	  			db.run("Insert into notification (type, reservUUID, reservStatus, reservTime, reservName, reservMemo, reservNumber, reservTarget, userPhoneNumber, msg, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", data.type, data.reservId, data.changeStatus, reservTime, data.reservName, data.reservMemo, data.reservNumber, data.reservTarget, data.userPhoneNumber, data.msg, date);
			});
		});

		// 마지막으로 DB에 기록되어있는 알림 timestamp 가져오기
		ipc.on('getLastNotiTime', function(event, data) {
			var db = sqlite.getDb();

			db.serialize(function() {
				var query = "SELECT date FROM notification where date = (SELECT MAX(date) FROM notification)";

				db.get(query, (err, row) => {
					if(err)
					{
						event.sender.send('lastNotification', {lastTimestamp: 0});//Number(new Date())});
						console.log(err);
					}


					if(row)
						event.sender.send('lastNotification', {lastTimestamp: row.date});
					else
						event.sender.send('lastNotification', {lastTimestamp: 0}); //Number(new Date())});
				});

			});
		});

		// 예약 10개 가져오기
		ipc.on('getAlertItems', function(event, data) {
			var db = sqlite.getDb();

			db.serialize(function() {
				var query = "SELECT * FROM notification order by date desc LIMIT " + data.num + " OFFSET " + data.offset;

				db.all(query, (err, rows) => {
					if (err) {
						console.log(err);
						event.sender.send('getAlertItems', { list: []});
					}

					event.sender.send('getAlertItems', { list: rows});
				});
			});
		});
	}
}
