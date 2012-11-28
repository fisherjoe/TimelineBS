TimelineBS
==========

TimelineBS��һ��ʵ�ּ�ˮƽ����ֱ��ʽʱ���ߵ�javascript�⣬Ŀǰ���������С�����

ʹ����������������ذ����timeline.html����

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

	"wrap" : $("#timeline1_bs .timeline_wrap_bs"),//ʱ��������[�ɱ�]

	"mode" : "hour-fifteen-minute",//ʱ�����ͣ������ʾ15����Ϊ��С��λ[�ȹ̶�]

	"scale" : {

		"hour-fifteen-minute" : {

			"midSize" : 50 //ʱ����С�̶ȿ��[�ɱ�]

		}

	},

	"prop" : {

		"hour-fifteen-minute" : {

			"refDate" : "2012-10-22 12:0:0",//��������ߵ�ʱ�����[�����]

			"periodNum" : 24,//Сʱ����24��ʾʱ����һ�μ���24Сʱ����[�ɱ�]

			"unit" : 15//��С�̶�ֵ[�ȹ̶�]

		}

	},

	"finishBuildingCallback" : finishBuildingCallback,//һ�μ�����ɺ�Ĳ���[����д]

	"onDragStartCallback" : onDragStartCallback,//�϶���ʼʱ�ص�����

	"onDraggingCallback" : onDraggingCallback//�϶�ʱ�ص����������شӰ�����굽��ǰ���λ��
});

window.TL1.init();

function onDragStartCallback(mx){

	//document.title = mx;
}

function onDraggingCallback(mx){

	//document.title = mx;
}

//timeResult��ʾ��ǰ����ʱ�������ݣ�order��ʾ��קʱ��˳�䣺ֵ1ʱ��ǰ��ק��-1ʱ�����ק

//����timeResultԪ�ظ�ʽ��:

//"15,0,15,17,22,10,2012"����Ӧ"[��ǰʱ��,��,��,ʱ,��,��,��]"����2012/10/22 17:15:0

function finishBuildingCallback(timeResult, order){

	//console.log(timeResult);
}

function demo(){

	/**==������Ҫ���ľ��Ǵ�ʱ��ؼ��л��t��ʱ��==*/

	var t = "2012/10/16 15:11:0";


	t = t.replace(/\//g, "-");

	window.TL1.prop["hour-fifteen-minute"].refDate = t;

	window.TL1.init();
}