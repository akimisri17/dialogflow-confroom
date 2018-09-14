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
		
		generate_message(msg, 'self');
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
  
	function generate_message(msg, type)
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
			if(msg.speech)
			{
				str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
				str += "<div class=\"cm-msg-text z-depth-2\">";
				str += msg.speech;
				str += "<\/div>";
				str += "<\/div>";
			}
			else
			{
				const result = msg.messages;
				//console.log(result);
				for(let data of result){
					//console.log(data);
					const responsetype = data.type;
					switch (responsetype) {
						case 0: 
							str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
							str += "<div class=\"cm-msg-text z-depth-2\">";
							str += data.speech;
							str += "<\/div>";
							str += "<\/div>";
							break;
						case 1: 
							const card = data;
							//console.log(card);
							str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
							str += "<div class='row'>";
							str += "<div class='col s12 m6'>";
							str += "<div class='card' style='background:#f5f5f5;'>";
							str += "<div class='card-content'>";
							if(card.imageUrl)
							{
								str += "<span class='card-title'>" + card.title + "<img style=' float: right; width:75px; height:60px; border-radius:5px;' src=\"" + card.imageUrl + "\" \><\/span>";
							}
							else
							{
								str += "<span class='card-title'>" + card.title + "<\/span>";
							}
							str += "<p>" + card.subtitle + "<\/p>";
							str += "<\/div>";
							var button = card.buttons;
							if(button.length)
							{
								str += "<div class='card-action'>";
								str += "<a href=\"" + card.buttons[0].postback + "\" target=\"_blank\"'>Vist Website<\/a>";
								str += "<\/div>";
							}
							str += "<\/div>";
							str += "<\/div>";
							str += "<\/div>";
							str += "<\/div>";
							break;
							
						case 2:	
							//console.log(data.replies);
							const suggestions = data.replies;
							str += "<div id='cm-msg-"+INDEX+"' style ='margin-left:10px;' class=\"chat-msg "+type+"\">";
							for(let value of suggestions){
								str += "<a href=\"javascript:;\" style='background:#3890E7;' class=\"waves-effect waves-light btn\" chat-value=\"" + value + "\">" + value + "<\/a>&nbsp;&nbsp;";
							}
							str += "<\/div>";
							break;
						default:
							msg = "Sorry";
							break;
					}
				}
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
		generate_message(value, 'self');
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
				generate_message(data.result.fulfillment, "remote");
			},
			error: function() {
				generate_message("I'm having trouble fetching information for you right now. Could you please try again after some tome. Sorry for the inconvenience caused.", "remote");
			}
		});
	}
})