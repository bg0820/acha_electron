// 변해도 되는 값들
// =====================
let calendarDate = new Date();

let currentYear = calendarDate.getFullYear();
let currentMonth = calendarDate.getMonth() + 1; // 0 = 1월
let currentDay = calendarDate.getDate();
let date = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// 변경될 값
let year = currentYear;
let month = currentMonth;
let day = currentDay;

// 윤년 계산
function isLeapYear(year){
	// 4년에 한번, 100년으로 떨어지는경우를 제외하되 400년인경우 윤년
	if(year % 4 == 0 && year % 100 != 0 || year % 400 ==0)
		return true;
	else
		return false;
}

function showCalendar(){
	//xmlParsing();
	document.getElementById('calendar-day-wrap').innerHTML = "";
	document.getElementById('date-title').innerHTML = "<span>" + year + "년 " + month + "월</span>";

	console.log("Y : " + year + ", M : " + month + ", D : " + day);
	var cal = new Date(year, month-1 ,1);
	var firstDay = cal.getDay();
	var htmlStr = "";
	var count = 0;

	// 윤년 체크
	if(isLeapYear(year))
		date[1]=29;

	htmlStr += "<div class='calendar-week'>";

	var bM;
	// 저번달 일 수 가져오기
	if(month == 1)
		bM = date[11];
	else
		bM = date[month - 2];

	var startDay = (bM - firstDay) + 1;

	// 앞 공백
	for(var i=0; i < firstDay; i++){
		htmlStr += "<div class='calendar-day-blank'><div class=\"calendar-day-number\">" + (startDay++) +"</div></div>";
		count++;
	}

	var yearStr = zeroFormating(year);
	var monthStr = zeroFormating(month);

	for(var j = 1; j <= date[month-1]; j++)
	{
		var dateStr = zeroFormating(j);
		var colorStr = '';
		if(count % 7 == 0)
			colorStr = "style='color:#F15F5F;'";
		else if(count % 7 == 6)
			colorStr = "style='color:#2478FF;'";

		htmlStr += "<div class='calendar-day' date-number='" + yearStr + "-" + monthStr + "-" + dateStr + "'><div class='calendar-day-number' " + colorStr + ">" + j +"</div></div>";

		// 전위연산 증감 후 7일 넘길시 다음줄, 현재까지 출력한 일 수와 그 달의 최종 일수가 같을경우 거기서 끝
		if(++count % 7 == 0 && j != date[month-1]) {
			htmlStr += "</div><div class='calendar-week'>";
			count = 0;
		}
	}

	if(count != 0)
		count = 7 - count;

	// 나머지 공백
	for (var k = 1; k <= count; k++)
		htmlStr += "<div class='calendar-day-blank'><div class=\"calendar-day-number\">" + k +"</div></div>";

	htmlStr += "</div>";

	document.getElementById('calendar-day-wrap').innerHTML  += htmlStr;

	todayCircle();
}

function todayCircle()
{
	// 오늘 날짜에 빨간색 동그라미
	// 요번달인지 체크 현재 보고있는 달과 컴퓨터상 달, 현재 보고있는 년도 와 컴퓨터 년도
	var settingCurrentMonth = (month === currentMonth && year === currentYear);

	var cums = zeroFormating(currentMonth);
	var cuds = zeroFormating(currentDay);
	if (settingCurrentMonth)
		$('*[date-number="' + currentYear + "-" + cums + "-" + cuds + '"]').addClass("calendar-day-today");
}

function prevCalendarMonth()
{
	if(--month < 1)
	{
		month = 12;
		year -= 1;
	}

	showCalendar();
	todayCircle();
}

function nextCalendarMonth()
{
	if(++month > 12)
	{
		month = 1;
		year += 1;
	}

	showCalendar();
	todayCircle();
}
