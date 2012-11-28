/*!
 * 相对于1.0，1.1版把垂直方向向下前向时间改为向上为前向时间
 * 开放了不少接口
 */

/*================jQuery滚轮事件================*/
(function(d){var b=["DOMMouseScroll","mousewheel"];if(d.event.fixHooks){for(var a=b.length;a;){d.event.fixHooks[b[--a]]=d.event.mouseHooks}}d.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var e=b.length;e;){this.addEventListener(b[--e],c,false)}}else{this.onmousewheel=c}},teardown:function(){if(this.removeEventListener){for(var e=b.length;e;){this.removeEventListener(b[--e],c,false)}}else{this.onmousewheel=null}}};d.fn.extend({mousewheel:function(e){return e?this.bind("mousewheel",e):this.trigger("mousewheel")},unmousewheel:function(e){return this.unbind("mousewheel",e)}});function c(j){var h=j||window.event,g=[].slice.call(arguments,1),k=0,i=true,f=0,e=0;j=d.event.fix(h);j.type="mousewheel";if(h.wheelDelta){k=h.wheelDelta/120}if(h.detail){k=-h.detail/3}e=k;if(h.axis!==undefined&&h.axis===h.HORIZONTAL_AXIS){e=0;f=-1*k}if(h.wheelDeltaY!==undefined){e=h.wheelDeltaY/120}if(h.wheelDeltaX!==undefined){f=-1*h.wheelDeltaX/120}g.unshift(j,k,f,e);return(d.event.dispatch||d.event.handle).apply(this,g)}})(jQuery);


/**
 * yyyy-m-d h:i:s
 * 输入时间类型统一为2012-9-5
 */
function TimelineBS(aoConf, context){
	this.conf = aoConf;
	this.context = context;
	
	this.define();
}
TimelineBS.prototype = {
	define:function(){
		this.wrap = this.conf.wrap;//时间组容器[必须]
		this.dimension = this.conf.dimension || "x";//时间线方向（水平、垂直）[可选]
		this.isForbidMousewheel = this.conf.isForbidMousewheel || false;//是否禁止鼠标滚动缩放[可选]
		this.mode = this.conf.mode || "date-hour";//刻度模式[可选]
		this.order = this.conf.order || "asc";//时间顺序
		this.finishBuildingCallback = this.conf.finishBuildingCallback;//一次创建完成
		this.onDragStartCallback = this.conf.onDragStartCallback;
		this.onDraggingCallback = this.conf.onDraggingCallback;//拖动时回调方法，返回从按下鼠标到当前鼠标位移
		this.onDragEndCallback = this.conf.onDragEndCallback;
	
		this.wheelStep = 5;
		this.box;
		this.container;
		this.list;		
		//不同刻度等级的属性，"period" : [刻度周期], "periodNum" : [一次执行周期数], "refDate" : [初始化相对时间], "unit" : [最小刻度值], "refPos" : [参考位置，横向替left，纵向替top], "refSize" : [参考宽度，不建议对外使用]
		this.prop = $.extend(true, {
			"century-year" : {
				"period" : 10,
				"periodNum" : 2,
				"refDate" : "2012-8-1 5:6:7",
				"unit" : 10,
				"unitTime" : (10 * 365 * 24 * 3600 * 1000),
				"refPos" : 0,
				"refSize" : null,
				"lastMode" : "",
				"nextMode" : "tens-year"	
			},
			"tens-year" : {
				"period" : 10,
				"periodNum" : 2,
				"refDate" : "2012-8-1 5:6:7",
				"unit" : 1,
				"unitTime" : (365 * 24 * 3600 * 1000),
				"refPos" : 0,
				"refSize" : null,
				"lastMode" : "century-year",
				"nextMode" : "year-month"
			},
			"year-month" : {
				"period" : 12,
				"periodNum" : 3,
				"refDate" : "2012-8-1 5:6:7",
				"unit" : 1,
				"unitTime" : (30 * 24 * 3600 * 1000),
				"refPos" : 0,
				"refSize" : null,
				"lastMode" : "tens-year",
				"nextMode" : "month-date"
			},		
			"month-date" : {
				"period" : 30,
				"periodNum" : 2,
				"refDate" : "2012-8-1 5:6:7",
				"unit" : 1,
				"unitTime" : (1 * 3600 * 24 * 1000),
				"refPos" : 0,
				"refSize" : null,
				"lastMode" : "year-month",
				"nextMode" : "date-hour"
			},
			"date-hour" : {
				"period" : 24,
				"periodNum" : 2,
				"refDate" : "2012-8-1 5:6:7",
				"unit" : 1,
				"unitTime" : (1 * 3600 * 1000),
				"refPos" : 0,
				"refSize" : null,
				"lastMode" : "month-date",
				"nextMode" : "hour-fifteen-minute"
			},
			"hour-fifteen-minute" : {
				"period" : 4,
				"periodNum" : 10,
				"refDate" : "2012-8-1 5:16:7",
				"unit" : 15,
				"unitTime" : (15 * 60 * 1000),
				"refPos" : 0,
				"refSize" : null,
				"lastMode" : "date-hour",
				"nextMode" : "hour-minute"
			},
			"hour-minute" : {
				"period" : 60,
				"periodNum" : 1,
				"refDate" : "2012-8-1 5:16:7",
				"unit" : 1,
				"unitTime" : (60 * 1000),
				"refPos" : 0,
				"refSize" : null,
				"lastMode" : "hour-fifteen-minute",
				"nextMode" : "minute-fifty-second"
			},
			"minute-fifty-second" : {
				"period" : 4,
				"periodNum" : 10,
				"refDate" : "2012-8-1 5:16:17",
				"unit" : 15,
				"unitTime" : (15 * 1000),
				"refPos" : 0,
				"refSize" : null,
				"lastMode" : "hour-minute",
				"nextMode" : "minute-second"
			},
			"minute-second" : {
				"period" : 60,
				"periodNum" : 1,
				"refDate" : "2012-8-1 5:16:7",
				"unit" : 1,
				"unitTime" : (1 * 1000),
				"refPos" : 0,
				"refSize" : null,
				"lastMode" : "minute-fifty-second",
				"nextMode" : ""
			}			
		}, this.conf.prop);//不同刻度等级的属性[可选]
		//缩放的等级，"minSize" : [刻度最小间距，无文案], "midSize" : [刻度中间刻度，有文案最小值], "maxSize" : [刻度最大间距，有文案]
		this.scale =  $.extend(true, {
			"century-year" : {
				"minSize" : 0,
				"midSize" : 45,
				"maxSize" : 75		
			},
			"tens-year" : {
				"minSize" : 0,
				"midSize" : 45,
				"maxSize" : 75	
			},
			"year-month" : {
				"minSize" : 0,
				"midSize" : 45,
				"maxSize" : 75	
			},
			"month-date" : {
				"minSize" : 0,
				"midSize" : 45,
				"maxSize" : 75	
			},
			"date-hour" : {
				"minSize" : 0,
				"midSize" : 45,
				"maxSize" : 75
			},
			"hour-fifteen-minute" : {
				"minSize" : 30,
				"midSize" : 60,
				"maxSize" : 90
			},
			"hour-minute" : {
				"minSize" : 0,
				"midSize" : 45,
				"maxSize" : 75	
			},
			"minute-fifty-second" : {
				"minSize" : 30,
				"midSize" : 45,
				"maxSize" : 75	
			},
			"minute-second" : {
				"minSize" : 0,
				"midSize" : 45,
				"maxSize" : 75	
			}
		}, this.conf.scale); //缩放的等级[可选]
		
		this.timeResult = [];
	},
	init:function(){
		this.wrap.html("");
		this.wrap.data("isShowUnitTip", true);
		this.wrap.data("scaleValue", 0);
		
		if(this.order == "asc"){
			this.createMark = this.createMarkAsc;
			this.getPointerToTime = this.getPointerToTimeAsc;
		}

		var timelineBox;
		if(this.dimension == "y"){
			timelineBox = $('<div class="wrap_tl"><div class="mark_g_tl"><div class="tr_tl"></div></div></div>');
		}else{
			timelineBox = $('<div class="wrap_tl"><div class="mark_g_tl"><table cellpadding="0" cellspacing="0" class="table_tl"><tr class="tr_tl"></tr></table></div></div>');
		}
		this.box = timelineBox;
		this.container = timelineBox.find("div.mark_g_tl");
		this.list = timelineBox.find(".tr_tl");	
		this.wrap.append(this.box);
		this.addEffect();		
		
		this.createByMode(this.mode, this.prop[this.mode]);
		this.patchup();
		
		this.addEvent();
	},
	createByMode:function(mode, option){
		this.list.html("");
		if(option && option.refPos){
			if(this.dimension == "y"){
				this.container.css("margin-top", option.refPos);
			}else{
				this.container.css("margin-left", option.refPos);
			}	
		}
		
		var marks;
		this.box.find("div.mark_g_tl").addClass(mode);
		marks = this.createMark(mode, option);
		this.list.html(marks);
		
		if(typeof this.finishBuildingCallback != "undefined"){
			this.finishBuildingCallback(this.timeResult);
		}
	},
	createMark:function(mode, option){//倒序
		var markTemp;

		var order = option.order || 1;
		var scaleValue = this.wrap.data("scaleValue") || 0;
		var isShowUnitTip = this.wrap.data("isShowUnitTip");
		var unitW;
		if(option.refSize || option.refSize === 0){
			unitW = option.refSize;
		}else{
			unitW = this.scale[mode].midSize + scaleValue;
		}
		var unitDisplay = isShowUnitTip === false ? "display:none;" : "";
		var markTemplate;
		if(this.dimension == "y"){
			markTemplate = '<div class="td_tl" grouptime="{g}" id="{id}">{group}<span class="mark_tl" style="height:' + unitW + 'px"><label style="'+ unitDisplay +'">{time}</label></span></div>';
		}else{
			markTemplate = '<td class="td_tl" grouptime="{g}" id="{id}">{group}<span class="mark_tl" style="width:' + unitW + 'px"><label style="'+ unitDisplay +'">{time}</label></span></td>';
		}
		
		var group = [];
		//取得当前时间轴两端时间
		var refTd;
		if(order < 0){
			refTd = this.wrap.find(".td_tl:first");
		}else{
			refTd = this.wrap.find(".td_tl:last");
		}
		
		var dynamicHour, 
			dynamicMini, 
			dynamicSec,
			dynamicDate, 
			dynamicMon, 
			dynamicYear,
			gDate,
			ymdhis,
			grouptimestr;
			
		if(refTd.length){
			var grouptime = refTd.attr("grouptime").split(",");
			dynamicSec = parseInt(grouptime[1]);
			dynamicMini = parseInt(grouptime[2]);
			dynamicHour = parseInt(grouptime[3]);
			dynamicDate = parseInt(grouptime[4]);
			dynamicMon = parseInt(grouptime[5]);
			dynamicYear = parseInt(grouptime[6]);	

			switch(mode){
				case "century-year":{
				}
				case "tens-year":{
					if(order < 0){
						dynamicYear += option.periodNum * option.period * option.unit;
					}else{
						dynamicYear -= option.unit;
					}
				}break;	
				case "year-month":{
					if(order < 0){
						dynamicMon += option.periodNum * option.period * option.unit;
					}else{
						dynamicMon -= option.unit;
					}
				}break;					
				case "month-date":{	
					if(order < 0){
						dynamicDate += option.periodNum * option.period * option.unit;
					}else{
						dynamicDate -= option.unit;
					}
				}break;
				case "date-hour":{
					if(order < 0){
						dynamicHour += option.periodNum * option.period * option.unit;
					}else{
						dynamicHour -= option.unit;
					}
				}break;
				case "hour-fifteen-minute":{ 
				}
				case "hour-minute":{
					if(order < 0){
						dynamicMini += option.periodNum * option.period * option.unit;
					}else{
						dynamicMini -= option.unit;
					}
				}break;
				case "minute-fifty-second":{
				}
				case "minute-second":{
					if(order < 0){
						dynamicSec += option.periodNum * option.period * option.unit;
					}else{
						dynamicSec -= option.unit;
					}
				}
			}
		}else{
			var curTime;
			if(option.refDate){	
				var refDate = this.getTimeUnformat(option.refDate);
				curTime = new Date(refDate.y, refDate.m - 1, refDate.d, refDate.h, refDate.i, refDate.s);
			}else{
				curTime = new Date();
			}		

			dynamicHour = parseInt(curTime.getHours()); 
			dynamicMini = parseInt(curTime.getMinutes());
			dynamicSec = parseInt(curTime.getSeconds());
			dynamicDate = parseInt(curTime.getDate());
			dynamicMon = parseInt(curTime.getMonth() + 1);
			dynamicYear = parseInt(curTime.getFullYear());
		}
		
		var timeResult = [];
		switch(mode){
			case "century-year":{
			}
			case "tens-year":{
				var periodValue = option.period * option.unit;//100,10
				var unitsValue = option.periodNum * periodValue;
				var tag = this.mode == "century-year" ? "c" : "s";
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);

				dynamicYear = ymdhis.y;

				var startTime = Math.ceil(dynamicYear / option.unit) * option.unit;

				for(var t = startTime; t > -(unitsValue - startTime); t -= option.unit){

					markTemp = markTemplate;
					
					//新周期开始
					if(t % periodValue == 0){
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ t + tag + '</label></div>');
					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", t).replace("{g}", t + ",0,0,0,1,1," + t).replace("{id}", "time_" + (t + "00011" + t).replace(/,/g, ""));
					
					timeResult.push(t + ",0,0,0,1,1," + t);
					group.push(markTemp);
				}
			}break;
			case "year-month":{
				var periodValue = option.period * option.unit;//12
				var unitsValue = option.periodNum * periodValue;
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);

				dynamicMon = ymdhis.m;
				dynamicYear = ymdhis.y;
				grouptimestr = dynamicYear;

				var startTime = Math.ceil(dynamicMon / option.unit) * option.unit;				
				for(var t = startTime, realTime = t; t > -(unitsValue - startTime); t -= option.unit, realTime -= option.unit){

					markTemp = markTemplate;
					
					//新周期开始
					if(t % periodValue == 0){
						realTime = periodValue;

						dynamicMon = realTime;
						dynamicYear--;

						ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
						dynamicMon = ymdhis.m;
						dynamicYear = ymdhis.y;					

						grouptimestr = dynamicYear;	

						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ grouptimestr +'</label></div>');
					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", realTime).replace("{g}", realTime + ",0,0,0,1," + realTime + "," + grouptimestr).replace("{id}", "time_" + (realTime + "0001" + realTime + grouptimestr).replace(/,/g, ""));
					
					timeResult.push(realTime + ",0,0,0,1," + realTime + "," + grouptimestr);
					group.push(markTemp);
				}
			}break;			
			case "month-date":{	
				var periodValue = option.period * option.unit;//30
				var unitsValue = option.periodNum * periodValue;
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);

				dynamicDate = ymdhis.d;
				dynamicMon = ymdhis.m;
				dynamicYear = ymdhis.y;
				grouptimestr = dynamicMon + "," + dynamicYear;

				var startTime = Math.ceil(dynamicDate / option.unit) * option.unit;				
				var period = this.getMaxDate(dynamicYear, dynamicMon);
				for(var t = startTime, realTime = t; t > -(unitsValue - startTime); t -= option.unit, realTime -= option.unit){

					markTemp = markTemplate;

					//新周期开始
					if(realTime % period == 0){
						if(realTime != period){
							dynamicMon--;
						}
						period = this.getMaxDate(dynamicYear, dynamicMon);	
						dynamicDate = period;
						
						ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
						dynamicMon = ymdhis.m;
						dynamicYear = ymdhis.y;	
						
						realTime = period;	

						grouptimestr = dynamicMon + "," + dynamicYear;	
						
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ this.changeTimeToFormat(grouptimestr) +'</label></div>');

					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", realTime).replace("{g}", realTime + ",0,0,0," + realTime + "," + grouptimestr).replace("{id}", "time_" + (realTime + "000" + realTime + grouptimestr).replace(/,/g, ""));
					
					timeResult.push(realTime + ",0,0,0," + realTime + "," + grouptimestr);
					group.push(markTemp);
				}
				
			}break;			
			case "date-hour":{
				var periodValue = option.period * option.unit;//24
				var unitsValue = option.periodNum * periodValue;
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);

				dynamicHour = ymdhis.h;
				dynamicDate = ymdhis.d;
				dynamicMon = ymdhis.m;
				dynamicYear = ymdhis.y;
				grouptimestr = dynamicDate + "," + dynamicMon + "," + dynamicYear;

				var startTime = Math.ceil(dynamicHour / option.unit) * option.unit;				
				for(var t = startTime, realTime = t; t > -(unitsValue - startTime); t -= option.unit, realTime -= option.unit){

					markTemp = markTemplate;
					
					//新周期开始
					if(t % periodValue == -option.unit){
						realTime = periodValue - option.unit;

						dynamicHour = realTime;
						dynamicDate--;
						
						ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
						dynamicDate = ymdhis.d;
						dynamicMon = ymdhis.m;
						dynamicYear = ymdhis.y;					

						grouptimestr = dynamicDate + "," + dynamicMon + "," + dynamicYear;	
						
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ this.changeTimeToFormat(grouptimestr) +'</label></div>');

					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", realTime + ":00").replace("{g}", realTime + ",0,0," + realTime + "," + grouptimestr).replace("{id}", "time_" + (realTime + "00" + realTime + grouptimestr).replace(/,/g, ""));
					
					timeResult.push(realTime + ",0,0," + realTime + "," + grouptimestr);
					group.push(markTemp);
				}
			}break;
			case "hour-fifteen-minute":{
			}
			case "hour-minute":{
				var periodValue = option.period * option.unit;//60
				var unitsValue = option.periodNum * periodValue;
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
				dynamicMini = ymdhis.i;
				dynamicHour = ymdhis.h;
				dynamicDate = ymdhis.d;
				dynamicMon = ymdhis.m;
				dynamicYear = ymdhis.y;
				grouptimestr = dynamicHour + "," + dynamicDate + "," + dynamicMon + "," + dynamicYear;

				var startTime = Math.ceil(dynamicMini / option.unit) * option.unit;				
				for(var t = startTime, realTime = t; t > -(unitsValue - startTime); t -= option.unit, realTime -= option.unit){

					markTemp = markTemplate;
					
					//新周期开始
					if(t % periodValue == -option.unit){
						realTime = periodValue - option.unit;

						dynamicMini = realTime;
						dynamicHour--;

						ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
						dynamicHour = ymdhis.h
						dynamicDate = ymdhis.d;
						dynamicMon = ymdhis.m;
						dynamicYear = ymdhis.y;					

						grouptimestr = dynamicHour + "," + dynamicDate + "," + dynamicMon + "," + dynamicYear;
						
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ this.changeTimeToFormat(grouptimestr) +'</label></div>');

					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", dynamicHour + ":" + realTime).replace("{g}", realTime + ",0," + realTime + "," + grouptimestr).replace("{id}", "time_" + (realTime + "0" + realTime + grouptimestr).replace(/,/g, ""));
					
					timeResult.push(realTime + ",0," + realTime + "," + grouptimestr);
					group.push(markTemp);
				}
			}break;
			case "minute-fifty-second":{
			}
			case "minute-second":{
				var periodValue = option.period * option.unit;//4, 60
				var unitsValue = option.periodNum * periodValue;
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
				dynamicSec = ymdhis.s;
				dynamicMini = ymdhis.i;
				dynamicHour = ymdhis.h;
				dynamicDate = ymdhis.d;
				dynamicMon = ymdhis.m;
				dynamicYear = ymdhis.y;
				grouptimestr = dynamicMini + "," + dynamicHour + "," + dynamicDate + "," + dynamicMon + "," + dynamicYear;

				var startTime = Math.ceil(dynamicSec / option.unit) * option.unit;				
				for(var t = startTime, realTime = t; t > -(unitsValue - startTime); t -= option.unit, realTime -= option.unit){

					markTemp = markTemplate;
					
					//新周期开始
					if(t % periodValue == -option.unit){
						realTime = periodValue - option.unit;

						dynamicSec = realTime;
						dynamicMini--;
						
						ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
						dynamicMini = ymdhis.i
						dynamicHour = ymdhis.h
						dynamicDate = ymdhis.d;
						dynamicMon = ymdhis.m;
						dynamicYear = ymdhis.y;					

						grouptimestr = dynamicMini + "," + dynamicHour + "," + dynamicDate + "," + dynamicMon + "," + dynamicYear;
						
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ this.changeTimeToFormat(grouptimestr) +'</label></div>');

					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", dynamicMini + ":" + realTime).replace("{g}", realTime + "," + realTime + "," + grouptimestr).replace("{id}", "time_" + (realTime + realTime + grouptimestr).replace(/,/g, ""));
					
					timeResult.push(realTime + "," + realTime + "," + grouptimestr);
					group.push(markTemp);
				}
			}
		}
		this.timeResult = timeResult;
		return group.join("");
	},
	createMarkAsc:function(mode, option){//正序
		var markTemp;

		var order = option.order || 1;
		var scaleValue = this.wrap.data("scaleValue") || 0;
		var isShowUnitTip = this.wrap.data("isShowUnitTip");
		var unitW;
		if(option.refSize || option.refSize === 0){
			unitW = option.refSize;
		}else{
			unitW = this.scale[mode].midSize + scaleValue;
		}
		var unitDisplay = isShowUnitTip === false ? "display:none;" : "";
		var markTemplate;
		if(this.dimension == "y"){
			markTemplate = '<div class="td_tl" grouptime="{g}" id="{id}">{group}<span class="mark_tl" style="height:' + unitW + 'px"><label style="'+ unitDisplay +'">{time}</label></span></div>';
		}else{
			markTemplate = '<td class="td_tl" grouptime="{g}" id="{id}">{group}<span class="mark_tl" style="width:' + unitW + 'px"><label style="'+ unitDisplay +'">{time}</label></span></td>';
		}
		
		var group = [];
		//取得当前时间轴两端时间
		var refTd;
		if(order < 0){
			refTd = this.wrap.find(".td_tl:first");
		}else{
			refTd = this.wrap.find(".td_tl:last");
		}
		
		var dynamicHour, 
			dynamicMini, 
			dynamicSec,
			dynamicDate, 
			dynamicMon, 
			dynamicYear,
			gDate,
			ymdhis,
			grouptimestr;
			
		if(refTd.length){
			var grouptime = refTd.attr("grouptime").split(",");
			dynamicSec = parseInt(grouptime[1]);
			dynamicMini = parseInt(grouptime[2]);
			dynamicHour = parseInt(grouptime[3]);
			dynamicDate = parseInt(grouptime[4]);
			dynamicMon = parseInt(grouptime[5]);
			dynamicYear = parseInt(grouptime[6]);	

			switch(mode){
				case "century-year":{
				}
				case "tens-year":{
					if(order < 0){
						dynamicYear -= option.periodNum * option.period * option.unit;
					}else{
						dynamicYear += option.unit;
					}
				}break;	
				case "year-month":{
					if(order < 0){
						dynamicMon -= option.periodNum * option.period * option.unit;
					}else{
						dynamicMon += option.unit;
					}
				}break;					
				case "month-date":{	
					if(order < 0){
						dynamicDate -= option.periodNum * option.period * option.unit;
					}else{
						dynamicDate += option.unit;
					}
				}break;
				case "date-hour":{
					if(order < 0){
						dynamicHour -= option.periodNum * option.period * option.unit;
					}else{
						dynamicHour += option.unit;
					}
				}break;
				case "hour-fifteen-minute":{ 
				}
				case "hour-minute":{
					if(order < 0){
						dynamicMini -= option.periodNum * option.period * option.unit;
					}else{
						dynamicMini += option.unit;
					}
				}break;
				case "minute-fifty-second":{
				}
				case "minute-second":{
					if(order < 0){
						dynamicSec -= option.periodNum * option.period * option.unit;
					}else{
						dynamicSec += option.unit;
					}
				}
			}
		}else{
			var curTime;
			if(option.refDate){	
				var refDate = this.getTimeUnformat(option.refDate);
				curTime = new Date(refDate.y, refDate.m - 1, refDate.d, refDate.h, refDate.i, refDate.s);
			}else{
				curTime = new Date();
			}		

			dynamicHour = parseInt(curTime.getHours()); 
			dynamicMini = parseInt(curTime.getMinutes());
			dynamicSec = parseInt(curTime.getSeconds());
			dynamicDate = parseInt(curTime.getDate());
			dynamicMon = parseInt(curTime.getMonth() + 1);
			dynamicYear = parseInt(curTime.getFullYear());
		}
		
		var timeResult = [];
		switch(mode){
			case "century-year":{
			}
			case "tens-year":{
				var periodValue = option.period * option.unit;//100,10
				var unitsValue = option.periodNum * periodValue;
				var tag = this.mode == "century-year" ? "c" : "s";
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);

				dynamicYear = ymdhis.y;

				var startTime = parseInt(dynamicYear / option.unit) * option.unit;

				for(var t = startTime; t < unitsValue + startTime; t += option.unit){

					markTemp = markTemplate;
					
					//新周期开始
					if(t % periodValue == 0){
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ t + tag + '</label></div>');
					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", t).replace("{g}", t + ",0,0,0,1,1," + t).replace("{id}", "time_" + (t + "00011" + t).replace(/,/g, ""));
					
					timeResult.push(t + ",0,0,0,1,1," + t);
					group.push(markTemp);
				}
			}break;
			case "year-month":{
				var periodValue = option.period * option.unit;//12
				var unitsValue = option.periodNum * periodValue;
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);

				dynamicMon = ymdhis.m;
				dynamicYear = ymdhis.y;
				grouptimestr = dynamicYear;

				var startTime = parseInt(dynamicMon / option.unit) * option.unit;				
				for(var t = startTime, realTime = t; t < unitsValue + startTime; t += option.unit, realTime += option.unit){

					markTemp = markTemplate;
					
					//新周期开始
					if(t % periodValue == 1){
						realTime = 1;
					
						if(t != 1){
							dynamicMon = realTime;
							dynamicYear++;
						}
						
						ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
						dynamicMon = ymdhis.m;
						dynamicYear = ymdhis.y;					

						grouptimestr = dynamicYear;	
						
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ grouptimestr +'</label></div>');

					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", realTime).replace("{g}", realTime + ",0,0,0,1," + realTime + "," + grouptimestr).replace("{id}", "time_" + (realTime + "0001" + realTime + grouptimestr).replace(/,/g, ""));
					
					timeResult.push(realTime + ",0,0,0,1," + realTime + "," + grouptimestr);
					group.push(markTemp);
				}
			}break;			
			case "month-date":{	
				var periodValue = option.period * option.unit;//30
				var unitsValue = option.periodNum * periodValue;
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);

				dynamicDate = ymdhis.d;
				dynamicMon = ymdhis.m;
				dynamicYear = ymdhis.y;
				grouptimestr = dynamicMon + "," + dynamicYear;

				var startTime = parseInt(dynamicDate / option.unit) * option.unit;				
				var period = this.getMaxDate(dynamicYear, dynamicMon);
				for(var t = startTime, realTime = t; t < unitsValue + startTime; t += option.unit, realTime += option.unit){

					markTemp = markTemplate;

					//新周期开始
					if(realTime % period == 1){
						realTime = 1;
					
						if(t != 1){
							dynamicDate = realTime;
							dynamicMon++;
						}


						
						ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
						dynamicMon = ymdhis.m;
						dynamicYear = ymdhis.y;					
						period = this.getMaxDate(dynamicYear, dynamicMon);


						
						grouptimestr = dynamicMon + "," + dynamicYear;	
						
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ this.changeTimeToFormat(grouptimestr) +'</label></div>');

					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", realTime).replace("{g}", realTime + ",0,0,0," + realTime + "," + grouptimestr).replace("{id}", "time_" + (realTime + "000" + realTime + grouptimestr).replace(/,/g, ""));
					
					timeResult.push(realTime + ",0,0,0," + realTime + "," + grouptimestr);
					group.push(markTemp);
				}
				
			}break;			
			case "date-hour":{
				var periodValue = option.period * option.unit;//24
				var unitsValue = option.periodNum * periodValue;
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);

				dynamicHour = ymdhis.h;
				dynamicDate = ymdhis.d;
				dynamicMon = ymdhis.m;
				dynamicYear = ymdhis.y;
				grouptimestr = dynamicDate + "," + dynamicMon + "," + dynamicYear;

				var startTime = parseInt(dynamicHour / option.unit) * option.unit;				
				for(var t = startTime, realTime = t; t < unitsValue + startTime; t += option.unit, realTime += option.unit){

					markTemp = markTemplate;
					
					//新周期开始
					if(t % periodValue == 0){
						realTime = 0;
					
						if(t != 0){
							dynamicHour = realTime;
							dynamicDate++;
						}
						
						ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
						dynamicDate = ymdhis.d;
						dynamicMon = ymdhis.m;
						dynamicYear = ymdhis.y;					

						grouptimestr = dynamicDate + "," + dynamicMon + "," + dynamicYear;	
						
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ this.changeTimeToFormat(grouptimestr) +'</label></div>');

					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", realTime + ":00").replace("{g}", realTime + ",0,0," + realTime + "," + grouptimestr).replace("{id}", "time_" + (realTime + "00" + realTime + grouptimestr).replace(/,/g, ""));
					
					timeResult.push(realTime + ",0,0," + realTime + "," + grouptimestr);
					group.push(markTemp);
				}
			}break;
			case "hour-fifteen-minute":{
			}
			case "hour-minute":{
				var periodValue = option.period * option.unit;//60
				var unitsValue = option.periodNum * periodValue;
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
				dynamicMini = ymdhis.i;
				dynamicHour = ymdhis.h;
				dynamicDate = ymdhis.d;
				dynamicMon = ymdhis.m;
				dynamicYear = ymdhis.y;
				grouptimestr = dynamicHour + "," + dynamicDate + "," + dynamicMon + "," + dynamicYear;

				var startTime = parseInt(dynamicMini / option.unit) * option.unit;				
				for(var t = startTime, realTime = t; t < unitsValue + startTime; t += option.unit, realTime += option.unit){

					markTemp = markTemplate;
					
					//新周期开始
					if(t % periodValue == 0){
						realTime = 0;
					
						if(t != 0){
							dynamicMini = realTime;
							dynamicHour++;
						}
						
						ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
						dynamicHour = ymdhis.h
						dynamicDate = ymdhis.d;
						dynamicMon = ymdhis.m;
						dynamicYear = ymdhis.y;					

						grouptimestr = dynamicHour + "," + dynamicDate + "," + dynamicMon + "," + dynamicYear;
						
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ this.changeTimeToFormat(grouptimestr) +'</label></div>');

					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", dynamicHour + ":" + realTime).replace("{g}", realTime + ",0," + realTime + "," + grouptimestr).replace("{id}", "time_" + (realTime + "0" + realTime + grouptimestr).replace(/,/g, ""));
					timeResult.push(realTime + ",0," + realTime + "," + grouptimestr);
					group.push(markTemp);
				}
			}break;
			case "minute-fifty-second":{
			}
			case "minute-second":{
				var periodValue = option.period * option.unit;//4, 60
				var unitsValue = option.periodNum * periodValue;
				ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
				dynamicSec = ymdhis.s;
				dynamicMini = ymdhis.i;
				dynamicHour = ymdhis.h;
				dynamicDate = ymdhis.d;
				dynamicMon = ymdhis.m;
				dynamicYear = ymdhis.y;
				grouptimestr = dynamicMini + "," + dynamicHour + "," + dynamicDate + "," + dynamicMon + "," + dynamicYear;

				var startTime = parseInt(dynamicSec / option.unit) * option.unit;				
				for(var t = startTime, realTime = t; t < unitsValue + startTime; t += option.unit, realTime += option.unit){

					markTemp = markTemplate;
					
					//新周期开始
					if(t % periodValue == 0){
						realTime = 0;
					
						if(t != 0){
							dynamicSec = realTime;
							dynamicMini++;
						}
						
						ymdhis = this.makeLegalTime(dynamicYear, dynamicMon, dynamicDate, dynamicHour, dynamicMini, dynamicSec);
						dynamicMini = ymdhis.i
						dynamicHour = ymdhis.h
						dynamicDate = ymdhis.d;
						dynamicMon = ymdhis.m;
						dynamicYear = ymdhis.y;					

						grouptimestr = dynamicMini + "," + dynamicHour + "," + dynamicDate + "," + dynamicMon + "," + dynamicYear;
						
						markTemp = markTemp.replace("{group}", '<div class="group_label_tl"><label>'+ this.changeTimeToFormat(grouptimestr) +'</label></div>');

					}else{
						markTemp = markTemp.replace("{group}", "");
					}
					
					markTemp = markTemp.replace("{time}", dynamicMini + ":" + realTime).replace("{g}", realTime + "," + realTime + "," + grouptimestr).replace("{id}", "time_" + (realTime + realTime + grouptimestr).replace(/,/g, ""));
					
					timeResult.push(realTime + "," + realTime + "," + grouptimestr);
					group.push(markTemp);
				}
			}
		}
		this.timeResult = timeResult;
		return group.join("");
	},
	makeLegalTime:function(y, m, d, h, i, s){
		var gDate = new Date(y, m - 1, d, h, i, s);
		return {
			"y":gDate.getFullYear(), 
			"m":gDate.getMonth() + 1, 
			"d":gDate.getDate(), 
			"h":gDate.getHours(), 
			"i":gDate.getMinutes(), 
			"s":gDate.getSeconds()
		};	
	},
	//获得一个月最后一天
	getMaxDate:function(year, month){
		if(month == 4 || month == 6 || month == 9 || month == 11 ){  
			return 30;  
		}
		if(month == 2){  
			if(year % 4 == 0 && year % 100 != 0 || year % 400 == 0){ 
				return 29;  
			}else{  
				return 28;  
			}
		}
		return 31;  
	},
	addEffect:function(){
		var wrap = this.wrap;
		var container = this.container;	
		var that = this;
		this.drag(container, wrap, {"mousemoveCallback" : function(option){that.draggingCallback(option);}});
	},
	drag:function(dom, delegate, option){
		var that = this;
		var mouseoverCallback = option.mouseoverCallback, 
			mousemoveCallback = option.mousemoveCallback, 
			mouseoutCallback = option.mouseoutCallback;
		var handle = dom;
		var moveNode = dom;
		var mouseStartX, 
			mlStartX, 
			pointX, 
			mx, 
			mouseStartY, 
			mlStartY, 
			pointY, 
			my, 
			status;
		var dragCond = true;
		handle.bind("mousedown", function(e){
			status = true;
			if(!dragCond)return;
			
			mouseStartX = e.pageX;	
			mouseStartY = e.pageY;
			
			mlStartX = parseFloat(moveNode.css("margin-left"));
			mlStartX = isNaN(mlStartX) ? 0 : mlStartX;

			mlStartY = parseFloat(moveNode.css("margin-top"));
			mlStartY = isNaN(mlStartY) ? 0 : mlStartY;
			
			if(that.dimension == "y"){
				moveNode.data("dynamicM", mlStartY);
			}else{
				moveNode.data("dynamicM", mlStartX);
			}	

			if(typeof that.onDragStartCallback == "function"){
				that.onDragStartCallback();
			}						
		}).bind("mousemove", function(e){
			if(!dragCond)return;
			if(!status)return;
			if($.browser.msie){
				try{
					window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
				}catch(e){}
			}
			
			if(that.dimension == "y"){
				pointY = e.pageY;
				my = pointY - mouseStartY;
				mlStartY = moveNode.data("dynamicM");
				moveNode.css("margin-top", mlStartY + my);
			}else{
				pointX = e.pageX;
				mx = pointX - mouseStartX;
				mlStartX = moveNode.data("dynamicM");
				moveNode.css("margin-left", mlStartX + mx);
			}			
			if(typeof mousemoveCallback == "function"){
				mousemoveCallback({
				"action" : "drag"
				});
			}
			if(typeof that.onDraggingCallback == "function"){
				that.onDraggingCallback(mx);
			}
		}).bind("mouseup", function(){
			status = false;
			if(!dragCond)return;
			if(typeof that.onDragEndCallback == "function"){
				that.onDragEndCallback();
			}	
		}).bind("mouseover", function(){
			if(!dragCond){
				$(this).css("cursor", "default");
				return;
			}
			$(this).css("cursor", "move");
		}).bind("mouseout", function(){
			if(!dragCond)return;
			$(this).css("cursor", "default");
		});
		$(document).bind("mouseup", function(){
			status = false;
			if(!dragCond)return;
		});	
	},
	draggingCallback:function(option){
		this.patchup(option);
	},
	patchup:function(option){
		var mode = this.mode;
		var boxWidth;
		var containerWidth;
		var containerL;
		if(this.dimension == "y"){
			boxWidth = this.box.height();
			containerWidth = this.container.height();
			containerL = parseFloat(this.container.css("margin-top"));
		}else{
			boxWidth = this.box.width();
			containerWidth = this.container.width();
			containerL = parseFloat(this.container.css("margin-left"));
		}
		//向后添加时间
		var marks;
		if(containerWidth - Math.abs(containerL) <= boxWidth){
			marks = this.createMark(mode, {
			"period" : this.prop[mode].period,
			"periodNum" : this.prop[mode].periodNum,
			"unit" : this.prop[mode].unit,
			"order" : 1
			});
			this.list.append($(marks));
			
			if(typeof this.finishBuildingCallback != "undefined"){
				this.finishBuildingCallback(this.timeResult, 1);
			}			
		}
		//向前添加时间
		if(containerL > 0){	
			marks = this.createMark(mode, {
			"period" : this.prop[mode].period,
			"periodNum" : this.prop[mode].periodNum,
			"unit" : this.prop[mode].unit,		
			"order" : -1
			});
			this.list.prepend($(marks));

			//修正拖动时元素的初始margin-left
			var newNum = $(marks).length;
			var allWidth;
			if(this.dimension == "y"){
				allWidth = this.list.find(".td_tl:first").height() * newNum;
			}else{
				allWidth = this.list.find(".td_tl:first").width() * newNum;
			}
			if(option.action == "drag"){
				this.container.data("dynamicM", this.container.data("dynamicM") - allWidth);
			}else{
				//修正当前位置
				if(this.dimension == "y"){
					this.container.css("margin-top", containerL - allWidth);
				}else{
					this.container.css("margin-left", containerL - allWidth);
				}
			}
			
			if(typeof this.finishBuildingCallback != "undefined"){
				this.finishBuildingCallback(this.timeResult, -1);
			}			
		}
	
	},
	addEvent:function(){
		var that = this;
		var container = this.container;
		var wrap =  this.wrap;
		var scaleValue = 0;
		var wheelStep = this.wheelStep;
		
		if(this.isForbidMousewheel){
			return;
		}
		this.box.unbind("mousewheel");
		this.box.delegate(".td_tl", "mousewheel", function(event, delta){
			wrap.data("mousesheelTarget", $(this));//当前触发元素
		});		
		this.box.bind("mousewheel", function(event, delta){
			allNodes = wrap.find("span.mark_tl");//所有需要设置缩放后大小的元素

			var tiPos = container.offset();
			if(that.dimension == "y"){
				var tiHei = container.height();
				var imsT = event.pageY - tiPos.top;
				irT = imsT / tiHei;
			}else{
				//变化前结构的大小位置
				var tiWid = container.width();
				//变化前鼠标相对container的位置
				var imsL = event.pageX - tiPos.left;
				//变化前鼠标相对container的比例位置
				irL = imsL / tiWid;
			}
			
			//放大点
			var direct;
			if(delta < 0){//放大
				direct = -wheelStep;
			}else{
				direct = wheelStep;
			}
			
			//保存当前缩放的值，为后续变化提供参考
			if(!wrap.data("scaleValue")){
				wrap.data("scaleValue", 0);
			}
			scaleValue = wrap.data("scaleValue") + direct;
			
			//到达边界则停止
			if(((scaleValue < that.scale[that.mode].minSize - that.scale[that.mode].midSize)  && !that.prop[that.mode].lastMode) || (scaleValue > that.scale[that.mode].maxSize - that.scale[that.mode].midSize && !that.prop[that.mode].nextMode))return false;
			
			wrap.data("scaleValue", scaleValue);
			
			allNodes.each(function(i, e){
				if(e){
					if(that.dimension == "y"){
						var eh = parseFloat(that.getFinalStyle(e, "height"));	
						e.style.height = ((eh + direct) < 0) ? 0 : (eh + direct) + "px";
					}else{
						var ew = parseFloat(that.getFinalStyle(e, "width"));
						e.style.width = ((ew + direct) < 0) ? 0 : (ew + direct) + "px";
					}
				}
			});
			
			/**重新定位整个结构，以鼠标为中心缩放**/
			if(that.dimension == "y"){
				var tfHei = container.height();
				var disT = imsT - irT * tfHei;
				var imt = parseFloat(that.getFinalStyle(container[0], "marginTop"));
				var mt = (isNaN(imt) ? 0 : imt) + disT;
				
				container.css({
					"margin-top" : mt
				});				
			}else{
				//变化后结构的大小
				var tfWid = container.width();
				//变化
				var disL = imsL - irL * tfWid;
				var iml = parseFloat(that.getFinalStyle(container[0], "marginLeft"));
				var ml = (isNaN(iml) ? 0 : iml) + disL;

				container.css({
					"margin-left" : ml
				});
			}
			
			that.onMousewheelCallback(event, {"scaleValue" : scaleValue});
			
			return false;
		});	

	},
	//获得鼠标指针对应的时间
	getPointerToTime:function(event){
		var mousesheelTarget = this.wrap.data("mousesheelTarget");
		if(!mousesheelTarget || !mousesheelTarget.length)return;
		var timeNode, grouptime;
		timeNode = mousesheelTarget;
		grouptime = timeNode.attr("grouptime").split(",");
		//当前鼠标时间段毫秒数
		var ptime = (new Date(grouptime[6], grouptime[5] - 1, grouptime[4], grouptime[3], grouptime[2], grouptime[1])).getTime();
		//鼠标所在位置时间毫秒数
		var mtime;
		if(this.dimension == "y"){
			var nh = timeNode.height();
			mtime = ptime + (nh - (event.pageY - timeNode.offset().top)) / nh * this.prop[this.mode].unitTime;
		}else{
			mtime = ptime + (event.pageX - timeNode.offset().left) / timeNode.width() * this.prop[this.mode].unitTime;
		}
		//当前鼠标所在的时间点
		var refTime = new Date();
		refTime.setTime(mtime);

		return refTime;
	},
	//获得鼠标指针对应的时间[正序]
	getPointerToTimeAsc:function(event){
		var mousesheelTarget = this.wrap.data("mousesheelTarget");
		if(!mousesheelTarget || !mousesheelTarget.length)return;
		var timeNode, grouptime;
		timeNode = mousesheelTarget;
		grouptime = timeNode.attr("grouptime").split(",");
		//当前鼠标时间段毫秒数
		var ptime = (new Date(grouptime[6], grouptime[5] - 1, grouptime[4], grouptime[3], grouptime[2], grouptime[1])).getTime();
		//鼠标所在位置时间毫秒数
		var mtime;
		if(this.dimension == "y"){
			mtime = ptime + (event.pageY - timeNode.offset().top) / timeNode.height() * this.prop[this.mode].unitTime;
		}else{
			mtime = ptime + (event.pageX - timeNode.offset().left) / timeNode.width() * this.prop[this.mode].unitTime;
		}
		//当前鼠标所在的时间点
		var refTime = new Date();
		refTime.setTime(mtime);

		return refTime;
	},	
	onMousewheelCallback:function(event, option){
		var mode = this.mode;
		var scaleValue = option.scaleValue;
		var isShowUnitTip = this.wrap.data("isShowUnitTip");
		if(scaleValue < 0 && isShowUnitTip){
			this.wrap.data("isShowUnitTip", false);
			this.wrap.find("span.mark_tl label").hide();
		}else if(scaleValue >= 0 && !isShowUnitTip){
			this.wrap.data("isShowUnitTip", true);
			this.wrap.find("span.mark_tl label").show();
		}
		//转向上一种模式
		var toLast = scaleValue < this.scale[mode].minSize - this.scale[mode].midSize;
		var toNext = scaleValue > this.scale[mode].maxSize - this.scale[mode].midSize;
		
		if(toLast || toNext){
			var refPos;
			if(this.dimension == "y"){
				refPos = event.pageY - this.box.offset().top;
			}else{
				refPos = event.pageX - this.box.offset().left;
			}	
			if(toLast){
				//var refPos = event.pageX - this.box.offset().left;
				var refTime = this.getPointerToTime(event);
				
				if(this.prop[mode].lastMode){
					this.mode = this.prop[mode].lastMode;
					this.wrap.data("scaleValue", this.scale[this.mode].maxSize - this.scale[this.mode].midSize);
					this.wrap.data("isShowUnitTip", true);
					this.createByMode(this.mode, {
					"period" : this.prop[this.mode].period,
					"periodNum" : this.prop[this.mode].periodNum,
					"unit" : this.prop[this.mode].unit,			
					"refSize" : this.scale[this.mode].maxSize, 
					"refDate" : this.getTimeFormat(refTime), 
					"refPos" : refPos
					});					
				}		
			}
			//转向下一种模式
			if(toNext){
				//var refPos = event.pageX - this.box.offset().left;
				var refTime = this.getPointerToTime(event);
				if(this.prop[mode].nextMode){
					this.mode = this.prop[mode].nextMode;
					this.wrap.data("scaleValue", this.scale[this.mode].minSize - this.scale[this.mode].midSize);
					this.wrap.data("isShowUnitTip", false);
					this.createByMode(this.mode, {
					"period" : this.prop[this.mode].period,
					"periodNum" : this.prop[this.mode].periodNum,
					"unit" : this.prop[this.mode].unit,				
					"refSize" : this.scale[this.mode].minSize, 
					"refDate" : this.getTimeFormat(refTime), 
					"refPos" : refPos
					});					
				}
			}			
		}

		this.patchup({"action" : "mousewheel"});

	},
	//yyyy-m-d h:i:s => {"y":"", "m":"", "d":"", "h":"", "i":"", "s":""}
	getTimeUnformat:function(time){
		if(!time)return null;
		var arr = time.split(" ");
		if(time.length < 2)return null;
		var ymd = arr[0].split("-");
		var his = arr[1].split(":");
		return {
			"y":ymd[0], 
			"m":ymd[1], 
			"d":ymd[2], 
			"h":his[0], 
			"i":his[1], 
			"s":his[2]
		};
	},
	//new Date() => yyyy-mm-dd hh:ii:ss
	getTimeFormat:function(date, format){
		format =  format || "yyyy-mm-dd hh:ii:ss";
		return format
				.replace("yyyy", date.getFullYear())
				.replace("mm", date.getMonth() + 1)
				.replace("dd", date.getDate())
				.replace("hh", date.getHours())
				.replace("ii", date.getMinutes())
				.replace("ss", date.getSeconds());
	},
	//s,i,h,d,m,yyyy => yyyy-m-d h:i:s
	changeTimeToFormat:function(date){
		var dateArr = date.split(",");
		var time = [];
		for(var len = dateArr.length, i = len - 1, type = 0; i >= 0; i--){
			type = len - i;
			switch(type){
				case 1:{//年
					
				}break;
				case 2:{//月
					time.push("-");
				}break;
				case 3:{//日
					time.push("-");
				}break;
				case 4:{//时
					time.push(" ");
				}break;
				case 5:{//分
					time.push(":");
				}break;
				case 6:{//秒
					time.push(":");
				}break;
			}
			time.push(dateArr[i]);
		}
		return time.join("");
	},	
	getFinalStyle:function (aeP, asName){
		if(aeP.style[asName]){
			return aeP.style[asName];
		}else if(aeP.currentStyle){
			return aeP.currentStyle[asName];
		}else if(document.defaultView && document.defaultView.getComputedStyle){
			asName = asName.replace(/([A-Z])/g, "-$1");
			asName = asName.toLowerCase();

			var s = document.defaultView.getComputedStyle(aeP, "");
			return s && s.getPropertyValue(asName);
		}else{
			return null;
		}

	}	
};
