var multer	=	require('multer');

path = require('path')

var pg = require("pg")
var http = require("http")


var storage	=	multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
  	callback(null, file.originalname);
  }
});
var upload = multer({ storage : storage}).single('userPhoto');


function list_users(req,callback){
	var conString = "pg://postgres:postgres@localhost:5432/focus";
	var client = new pg.Client(conString);
	client.connect(); 
	var result=new Array();
	var query=client.query("Select username from tinyfocus GROUP BY username ORDER BY count(*) DESC LIMIT 20");
	query.on("row",function(row){
		result.push({"username":row.username});
	});
	query.on("end",function(){
		callback(result);
		
	});
}

function avg_focus_records(req, callback) {

	var conString = "pg://postgres:postgres@localhost:5432/focus";
	var client = new pg.Client(conString);
	client.connect(); 
	var all_data = {};
 	for(var i=0; i<7; i++){
 		all_data[i] = {"sum":0, "count":0};
 	}
		
	
	re=GetTimezoneOffset(user, function(hour){
		hour_offset=Math.floor(hour);
	   	min_offset=(hour%1)*60;

	var query = client.query("SELECT FocusLevel, DateTime as DateVal FROM TinyFocus WHERE Username = '" + user + "'" );
	query.on("row",function(row){
		var DateVal=new Date(row.dateval);
		// To add the offset
		var x=new Date(DateVal.getTime()+ min_offset*60000+(hour_offset*60*60000));
		// To convert the timezone offset to GMT
		var DateTime=new Date(x.valueOf() + x.getTimezoneOffset() * 60000);
		row.dateval=DateTime.getDay();
		var x=row.dateval;
		all_data[x].sum += parseFloat(row.focuslevel);
		all_data[x].count++;
	});
	query.on("end",function(){
		callback(all_data);
    });	
			
});

}


function focus_last_week(req,callback){

	var conString = "pg://postgres:postgres@localhost:5432/focus";
	var client = new pg.Client(conString);
	client.connect(); 

	var r = {};
 	for(var i=0; i<7; i++){
 		r[i] = {"sum":0, "count":0};
 	}


	re=GetTimezoneOffset(user, function(hour){
		hour_offset=Math.floor(hour);
	   	min_offset=(hour%1)*60;

	var query = client.query(
			"SELECT tinyfocus.focuslevel, tinyfocus.DateTime as DateVal	FROM tinyfocus,(select * from tinyfocus where Username='"+user+"' ORDER BY DateTime DESC LIMIT 1) lastDate WHERE tinyfocus.datetime > lastDate.datetime - interval '7 days' and tinyfocus.username='"+user+"'");
	query.on("row",function(row){
		var DateVal=new Date(row.dateval);
		// To add the offset
		var x=new Date(DateVal.getTime()+ min_offset*60000+(hour_offset*60*60000));
		// To convert the timezone offset to GMT
		var DateTime=new Date(x.valueOf() + x.getTimezoneOffset() * 60000);
		row.dateval=DateTime.getDay();
		var x=row.dateval;
		r[x].sum += parseFloat(row.focuslevel);
		r[x].count++;
	});
	query.on("end",function(){
		callback(r);
    });	
			
});

	

}

function heatmap_records(req, callback) {

	var conString = "pg://postgres:postgres@localhost:5432/focus";
	var client = new pg.Client(conString);
	client.connect(); 
	var r = {};
 	for(var day=0; day<7; day++){
 		for(var hour=0; hour< 24; hour++){
 			x=day*24+hour;
 			r[x]= {"sum":0, "count":0};
 		}
 		
 	}		
	
	re=GetTimezoneOffset(user, function(hour){
		hour_offset=Math.floor(hour);
	   	min_offset=(hour%1)*60;

	var query = client.query("SELECT FocusLevel, DateTime as DateVal FROM TinyFocus WHERE Username = '" + user + "'" );
	query.on("row",function(row){
		var DateVal=new Date(row.dateval);
		// To add the offset
		var x=new Date(DateVal.getTime()+ min_offset*60000+(hour_offset*60*60000));
		// To convert the timezone offset to GMT
		var DateTime=new Date(x.valueOf() + x.getTimezoneOffset() * 60000);
		row.dateval=DateTime.getDay();
		row.timeval=DateTime.getHours();
		var x=(row.dateval*24)+row.timeval;
		r[x].sum += parseFloat(row.focuslevel);
		r[x].count++;
	});
	query.on("end",function(){
		callback(r);
    });	
			
});

}

// Times are in UTC, so for any localized analysis, need to get offset.
function GetTimezoneOffset(user, callback){
	var conString = "pg://postgres:postgres@localhost:5432/focus";
	var client = new pg.Client(conString);
	client.connect(); 
	var query=client.query("SELECT offset_val FROM Users WHERE Username='"+user+"'");
	query.on("row",function(row){
		var hour=0.0;
		var offset=row.offset_val;
  		//0 days 07:00:00.00000000
  		if(offset.indexOf('-')==-1){
  			var atoms=offset.split(" days ");
  			var time=atoms[1].split(":");
			hour=parseInt(time[0])+parseInt(time[1])/60.0;
  		}

  		//-1 days +19:00:00.00000000
  		else{
  			var atoms=offset.split(" days +");
  			var time=atoms[1].split(":");
			hour=(parseInt(time[0])+parseInt(time[1])/60.0)-24;
  		}
  		callback(hour);
	});

}



function categoryVsFocus(req,callback){
	var conString = "pg://postgres:postgres@localhost:5432/focus";
	var client = new pg.Client(conString);
	client.connect(); 

	var category_data = [];
	var query = client.query("Select subquery.category as cat,sum(subquery.focus) as sum,count(*) as count FROM ( Select tinyfocus.focuslevel as focus, activity.category as category from tinyfocus,activity WHERE tinyfocus.username=activity.username and tinyfocus.datetime=activity.hour and tinyfocus.username='"+user+"') subquery GROUP BY subquery.category");
	query.on("row",function(row){

		var category=row.cat;
		if(category.length==0){
			category='Unknown';
		}
		var sum=parseFloat(row.sum);
		var count=row.count;
		var focus=sum/count;
		focus=Math.round(focus*100)/100;
		category_data.push({"category":category,"avg_focus":focus});
	});
	query.on("end",function(){
		callback(category_data);
    });	
			
}

function categoryVsNav(req,callback){
	var conString = "pg://postgres:postgres@localhost:5432/focus";
	var client = new pg.Client(conString);
	client.connect(); 

	var category_data = [];
	var query = client.query("select category, sum (navigationcount) as sum, count(*) as count from activity where username='"+user+"' GROUP BY category");
	query.on("row",function(row){

		var category=row.category;
		if(category.length==0){
			category='Unknown';
		}
		var sum=parseFloat(row.sum);
		var count=row.count;
		var nav=sum/count;
		nav=Math.round(nav*100)/100;
		category_data.push({"category":category,"nav":nav});
	});
	query.on("end",function(){
		callback(category_data);
    });	
			
}


function toolVsCount(req,callback){
	var conString = "pg://postgres:postgres@localhost:5432/focus";
	var client = new pg.Client(conString);
	client.connect(); 

	var tool_data = [];
	var query = client.query("select tool ,count(*) as count from activity where username='"+user+"' GROUP BY tool");
	query.on("row",function(row){

		var tool=row.tool;
		if(tool.length!=0){
			tool_data.push({"tool":tool,"count":row.count});	
		}
		
	});
	query.on("end",function(){
		callback(tool_data);
    });	

}
function initialize(app){

	//These are the API end points that you can write.

	//Setting up an event listener for GET request to '/' 
	app.get('/index', function(req, res){ 
		queryName= req.query.name;
		var username=queryName.split("-");
		user=username[0];

		avg_focus_records(req,function(r){
			var day=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
			var focus_day_dt=[];
			var total_avg=0;
			var total_count=0;
			var week_avg=0;
			var week_count=0;
			
			focus_last_week(req,function(week_data){
				var day=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
				var focus_week_dt=[];

				
				for(var i=0;i<7;i++){
					var week_focus=week_data[i].sum/week_data[i].count;
					week_focus=Math.round(week_focus*100)/100;
					var avg_focus=r[i].sum/r[i].count;
					avg_focus=Math.round(avg_focus*100)/100;
					focus_week_dt.push({"x":day[i],"week_focus":week_focus, "all_focus":avg_focus});

					total_avg+=r[i].sum;
					total_count+=r[i].count;

					week_avg+=week_data[i].sum;
					week_count+=week_data[i].count;

				}

				gen_focus_avg=total_avg/total_count;
				gen_focus_avg=Math.round(gen_focus_avg*100)/100;

				week_focus_avg=week_avg/week_count;
				week_focus_avg=Math.round(week_focus_avg*100)/100;


				heatmap_records(req,function(r){
					var heatmap_dt=[];
					var max_day=0;
					var max_hour=0;
					var max_value=0;
					var min_value=1000;
					var min_hour=0;
					var min_day=0;
					for(var i=0;i<7;i++){
						for(var j=0;j<24;j++){
							var x=i*24+j;
							if(r[x].count==0){
								heatmap_dt.push({"day":i+1,"hour":j+1,"value":0});
							}
							else{
								var hour_focus=r[x].sum/r[x].count;
								hour_focus=Math.round(hour_focus*100)/100;
								heatmap_dt.push({"day":i+1,"hour":j+1,"value":hour_focus});
								if(hour_focus>max_value){
									max_value=hour_focus;
									max_hour=j;
									max_day=i;
								}
								if(hour_focus<min_value){
									min_value=hour_focus;
									min_hour=j;
									min_day=i;
								}
							}
							
						}
						
					}

					categoryVsFocus(req,function(catVsfoc){

						categoryVsNav(req, function(catVsNav){

							toolVsCount(req,function(tool_data){
								res.render('index.html',{"heatmap":JSON.stringify(heatmap_dt), "week_dt":JSON.stringify(focus_week_dt),
								"focus_overall":gen_focus_avg, "most_prod_day":max_day, "most_prod_hour":max_hour, "focus_week":week_focus_avg, 
								"min_prod_day":min_day,"min_prod_hour":min_hour, "user":user.toUpperCase(),
								"category_data":JSON.stringify(catVsfoc), "navigation_dt":JSON.stringify(catVsNav), "tool_dt":JSON.stringify(tool_data) });


							})
							

						})
						
					})
			
				})


			
			})

		});
	});	

		//File upload function
			
		/*var fastCsv = require("fast-csv");
 		var fs = require("fs");

		var fileStream = fs.createReadStream("./uploads/"+req.query.name),
		    parser = fastCsv();
		 
		fileStream
		    .on("readable", function () {
		        var data;
		        while ((data = fileStream.read()) !== null) {
		            parser.write(data);
		        }
		    })
		    .on("end", function () {
	focus_day_dt	        parser.end();
		    });
 		var r = {};
 		for(var i=1; i<8; i++){
 			r[i] = {"sum":0, "count":0};
 		}
		parser
		    .on("readable", function () {
		        var data;

		        while ((data = parser.read()) !== null) {
		        	var n = Number(data[1]);
		        	if(!isNaN(n)){
			        	r[n].sum += Number(data[0]);
			 			r[n].count += 1;
			 		}
		        }
		    })
		    .on("end", function () {
		        var focus_day_dt = [];
		        for(var i=1; i<8; i++){
		        	var num = r[i].sum/r[i].count;
		        	num = Math.round(num * 100) / 100;
		        	focus_day_dt.push({"y": i.toString(), "item1": num});
		        }
		        res.render('index.html', {"data": JSON.stringify(focus_day_dt)});
		    });*/


	

	
	app.get('/', function(req, res){
		list_users(req,function(r){
			res.render('upload.html',{"data":JSON.stringify(r)});
		});
		
    });

		app.post('/index/photo', upload, function(req,res,next){
		res.end(req.file.originalname);			
	});
    

}

exports.initialize = initialize;




