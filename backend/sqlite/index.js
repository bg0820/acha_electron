const sqlite3 = require('sqlite3').verbose();
let _db;

module.exports = {
	// 연결 풀링 - 연결 유지하기(매번 연결할때마다 인증 시간이 소요되는 문제)
    connect: function ()
    {
		return new Promise(function (resolve, reject) {
			let db = new sqlite3.Database('./backend/data/data.db', (err) => {
				if (err) {
					reject(err);
				}

				_db = db;
				resolve(null); // 반환값 에러 있음, 없음
			});
		});
    },

	getDb: function()
	{
		return _db;
	}
}
