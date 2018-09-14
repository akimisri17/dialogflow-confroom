var accessToken = "9a6d09e69dc74cd9bd083f6c7a9998ac";
var baseUrl = "https://api.dialogflow.com/v1/";
var sessionId;

$(document).ready(function () {
	$( "div.first" ).delay(600).fadeIn(600);
	$( "div.second" ).delay(1500).fadeIn(1500);
	$( "div.third" ).delay(2000).fadeIn(2000);	
});

$('.sidenav-trigger').click(function(){
	var elems = document.querySelectorAll('.sidenav');
	M.Sidenav.init(elems);
	('sidenav-overlay').css('display','none');
})

function onReset(){
	$(".self").css("display", "none");
	$(".remote").css("display", "none");
	$(".chat-submit").css("background-color","transparent");
}

$(function() {
	var INDEX = 0; 
  
	$("#chat-submit").click(function(e) 
	{
		e.preventDefault();
		var msg = $("#chat-input").val(); 
		if(msg.trim() == '')
		{
			return false;
		}
		
		generate_message(msg, '', 'self');
		$(this).val('');
		queryBot(msg);
		
		var buttons = [
			{
				name: 'Existing User',
				value: 'existing'
			},
			{
				name: 'New User',
				value: 'new'
			}
			];
    })
  
	function generate_message(msg, param, type)
	{
		//console.log(msg);
		//console.log("Out: " + msg);
		/*if(type=="remote")
		{
			if(intent == 'stock_details')
			{
			}
		}*/
		INDEX++;
		var str="";
		if(type=="self")
		{
			str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
			str += "<div class=\"cm-msg-text z-depth-2\">";
			str += msg;
			str += "<\/div>";
			str += "<\/div>";    
		} 
		else
		{
			if(msg.fulfillment.speech)
			{
				str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
				str += "<div class=\"cm-msg-text z-depth-2\">";
				str += msg.fulfillment.speech;
				str += "<\/div>";
				str += "<\/div>";
			}
			else if(msg.metadata.intentName === 'Check Availability')
			{
				var hall = param.hall;
				var date = param.date;
				console.log(hall + " " + date);

				str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
				str += "<div class=\"cm-msg-text z-depth-2\">";
				str += "Okay! Let me confirm.<br>";
				str += "Check availability of<br><b>Hall name:<\/b> " + hall + "<br>" + "<b>Date:<\/b> " + date;
				str += "<\/div>";
				str += "<\/div>";
				str += "<div id='cm-msg-"+INDEX+"' style ='margin-left:10px;' class=\"chat-msg "+type+"\">";
				str += "<a href=\"javascript:;\" style='background:#3890E7;' class=\"waves-effect waves-light btn\" chat-value=\" Yes \">Yes<\/a>&nbsp;&nbsp;";
				str += "<a href=\"javascript:;\" style='background:#3890E7;' class=\"waves-effect waves-light btn\" chat-value=\" No \">No<\/a>&nbsp;&nbsp;";
				str += "<\/div>";
			}
			else if(msg.metadata.intentName === "Check Availability - yes")
			{
				var hall = msg.contexts[1].parameters.hall;
				var date = msg.contexts[1].parameters.date;
				console.log(hall + " " + date);
				
				var result_out = "<small style='font-size: 14px'>";
				var url1 = "/rooms/booking_details.php?hall="+hall+"&date="+date;//+msg;
				$.ajax({
				type: "GET",
				async:false,
		           url: url1,
		           contentType: "application/json; charset=utf-8",
		           dataType: "json",
		           success: function(data) {
					   console.log(data);
					   var result = data.records;
					   $.each(result,function(index,element){
						   result_out += "From " + element.start_time + " to " + element.end_time + ", Name: " + element.contact_person + ", " + element.dept + " Dept.<br>";
						});
				   }
				});
				result_out += "<\/small>"
				str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
				str += "<div class=\"cm-msg-text z-depth-2\">";
				str += "Following are the bookings for that date:<br>";
				str += result_out;
				str += "<\/div>";
				str += "<\/div>";
				str += "<div id='cm-msg-"+INDEX+"' style ='margin-left:10px;' class=\"chat-msg "+type+"\">";
				str += "<a href=\"javascript:;\" style='background:#3890E7;' class=\"waves-effect waves-light btn\" chat-value=\" Book a Hall \">Book a Hall<\/a>&nbsp;&nbsp;";
				str += "<\/div>";
			}
			else if(msg.metadata.intentName === 'Book a Hall')
			{
				var hall = param.hall;
				var date = param.date;
				var timePeriod = param.timePeriod;
				const start_time = timePeriod.substring(0,7);
				const end_time = timePeriod.substring(9,16);

				console.log(hall + " " + date + " " + start_time + " " + end_time);

				str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
				str += "<div class=\"cm-msg-text z-depth-2\">";
				str += "Okay! Let me confirm.<br>";
				str += "Check availability of<br><b>Hall name:<\/b> " + hall + "<br>" + "<b>Date:<\/b> " + date + "<br>" + "<b>Start Time:<\/b> " + start_time + "<br>" + "<b>End Time:<\/b> " + end_time;
				str += "<\/div>";
				str += "<\/div>";
				str += "<div id='cm-msg-"+INDEX+"' style ='margin-left:10px;' class=\"chat-msg "+type+"\">";
				str += "<a href=\"javascript:;\" style='background:#3890E7;' class=\"waves-effect waves-light btn\" chat-value=\" Yes \">Yes<\/a>&nbsp;&nbsp;";
				str += "<a href=\"javascript:;\" style='background:#3890E7;' class=\"waves-effect waves-light btn\" chat-value=\" No \">No<\/a>&nbsp;&nbsp;";
				str += "<\/div>";
			}
			else if(msg.metadata.intentName === "Book a Hall - yes")
			{
				var data_store = {
					hall: msg.contexts[1].parameters.hall,
					date: msg.contexts[1].parameters.date,
					end_time: msg.contexts[1].parameters.end_time,
					start_time: msg.contexts[1].parameters.start_time,
					contact_person: param.name,
					dept: param.dept
				}
				
				console.log(msg.contexts[1].parameters.hall + " " + msg.contexts[1].parameters.date + " " + 
				msg.contexts[1].parameters.end_time + " " + msg.contexts[1].parameters.start_time);
				
				var result_out = "";
				var url1 = "http://confbook.local/rooms/create_booking.php?";
				$.ajax({
					type: "POST",
					async:false,
		           	url: url1,
		           	contentType: "application/json; charset=utf-8",
		           	dataType: "json",
		           	success: function(data) {
					   console.log(data);
					   if(data.messgae == "Booked.")
					   {
						   result_out = "Your booking has been confirmed! Thank you!";
					   }
					   else{
							result_out += "There was an error while booking the hall. Please check if their is an availability.";
					   }
					},
					data: JSON.stringify(data_store)
					   
				});
				
				str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
				str += "<div class=\"cm-msg-text z-depth-2\">";
				str += result_out;
				str += "<\/div>";
				str += "<\/div>";
				str += "<div id='cm-msg-"+INDEX+"' style ='margin-left:10px;' class=\"chat-msg "+type+"\">";
				str += "<a href=\"javascript:;\" style='background:#3890E7;' class=\"waves-effect waves-light btn\" chat-value=\" Book a Hall \">Book a Hall<\/a>&nbsp;&nbsp;";
				str += "<a href=\"javascript:;\" style='background:#3890E7;' class=\"waves-effect waves-light btn\" chat-value=\" Check availability \">Check availability<\/a>&nbsp;&nbsp;";
				result_out += "<\/div>";
			}
		}
	
		
		
		/*else
		{
			str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
			str += "<div class=\"cm-msg-text z-depth-2\">";
			str += msg;
			str += "<\/div>";
			str += "<\/div>";
		} */   
		$(".chat-logs").append(str);
		$("#cm-msg-"+INDEX).hide().fadeIn(300);
		if(type == 'self')
		{
			$("#chat-input").val(''); 
		}
		$(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight}, 1000);    
	} 
  
	$(document).delegate(".btn", "click", function() 
	{
		var value = $(this).attr("chat-value");
		var name = $(this).html();
		$("#chat-input").attr("disabled", false);
		generate_message(value, '', 'self');
		queryBot(value);
	})

	function queryBot(text)
	{
		var d = new Date();
		
		if(sessionId)
			;
		else
		{
			sessionId = d.valueOf();
			console.log(sessionId);
		}
		//console.log(sessionId);
		$.ajax({
			type: "POST",
			url: baseUrl + "query?v=20150910",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			headers: {
				"Authorization": "Bearer " + accessToken
			},
			data: JSON.stringify({query: text, lang: "en", sessionId: sessionId }),
			success: function(data) {
				console.log(data);
				generate_message(data.result, data.result.parameters, "remote");
			},
			error: function() {
				generate_message("I'm having trouble fetching information for you right now. Could you please try again after some tome. Sorry for the inconvenience caused.", "", "remote");
			}
		});
	}
})