TimelineBS
==========

TimelineBS是一款实现简单水平及垂直方式时间线的javascript库，目前尚在完善中。。。

使用用例（具体见下载包里的timeline.html）：

/*

century-year

tens-year

year-month

month-date

date-hour

hour-fifteen-minute

hour-minute

minute-fifty-second

minute-second

*/

window.TL1 = new TimelineBS({

	"wrap" : $("#timeline1_bs .timeline_wrap_bs"),//时间线容器[可变]

	"mode" : "hour-fifteen-minute",//时间类型，这里表示15分钟为最小单位[先固定]

	"scale" : {

		"hour-fifteen-minute" : {

			"midSize" : 50 //时间最小刻度宽度[可变]

		}

	},

	"prop" : {

		"hour-fifteen-minute" : {

			"refDate" : "2012-10-22 12:0:0",//容器最左边的时间起点[必须变]

			"periodNum" : 24,//小时数，24表示时间线一次加载24小时长度[可变]

			"unit" : 15//最小刻度值[先固定]

		}

	},

	"finishBuildingCallback" : finishBuildingCallback,//一次加载完成后的操作[可重写]

	"onDragStartCallback" : onDragStartCallback,//拖动开始时回调方法

	"onDraggingCallback" : onDraggingCallback//拖动时回调方法，返回从按下鼠标到当前鼠标位移
});

window.TL1.init();

function onDragStartCallback(mx){

	//document.title = mx;
}

function onDraggingCallback(mx){

	//document.title = mx;
}

//timeResult表示当前新增时间组数据，order表示拖拽时间顺充：值1时向前拖拽，-1时向后拖拽

//数组timeResult元素格式如:

//"15,0,15,17,22,10,2012"，对应"[当前时间,秒,分,时,日,月,年]"，如2012/10/22 17:15:0

function finishBuildingCallback(timeResult, order){

	//console.log(timeResult);
}

function demo(){

	/**==这里需要做的就是从时间控件中获得t的时间==*/

	var t = "2012/10/16 15:11:0";


	t = t.replace(/\//g, "-");

	window.TL1.prop["hour-fifteen-minute"].refDate = t;

	window.TL1.init();
}