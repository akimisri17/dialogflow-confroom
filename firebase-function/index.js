// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp(functions.config().firebase);
const hallDetails = firebaseAdmin.database().ref('/confBooking/hall_details');
const bookingDetails = firebaseAdmin.database().ref('/confBooking/booking_details');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
//   function welcome(agent) {
//     agent.add(`Welcome to my agent!`);
//   }
 
//   function fallback(agent) {
//     agent.add(`I didn't understand`);
//     agent.add(`I'm sorry, can you try again?`);
// }

   // Uncomment and edit to make your own intent handler
   // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
   // below to get this function to be run when a Dialogflow intent is matched
   function bookAhall(agent) {
    const hall_name = agent.parameters.hall;
    
	const date_in = agent.parameters.date;
	var date_rev = date_in.substring(0, 10);
	// date_rev = date_rev.split('-');
	// var date = date_rev.reverse().join('-');

	const timePeriod = agent.parameters.timePeriod;
	const startTime = timePeriod.startTime;
	const endTime = timePeriod.endTime;
	const start_time = startTime.substring(11,16);
	const end_time = endTime.substring(11,16);
	
	agent.setContext({
		name: 'booking_details',
		lifespan: 2,
		parameters: {hall: hall_name, date: date_rev, start_time: start_time, end_time: end_time}
	});
    
     agent.add(`Okay! Let me confirm.`);
     agent.add(new Card({
         title: `Booking Details`,
         text: `Hall name: ${hall_name}<br>Date: ${date_rev}<br>
         Start Time: ${start_time}<br>End Time: ${end_time}`,
       })
    );
     agent.add(new Suggestion(`Yes`));
     agent.add(new Suggestion(`No`));
   }
   
   function bookAhallYes(agent) {
       const dept = agent.parameters.dept;
       const name = agent.parameters.name;
       
       const booking_details = agent.getContext('booking_details');
       const hall_name = booking_details.parameters.hall;
       const date = booking_details.parameters.date;
       const startTime = booking_details.parameters.start_time;
       const endTime = booking_details.parameters.end_time;

       bookingDetails.push().set({
           hall_id: hall_name,
           date: date,
           start_time: startTime,
           end_time: endTime,
           name: name,
           department: dept
        });

       agent.add(`Your booking has been confirmed! Thank you!`);
       agent.add(new Suggestion(`Check availability`))
   }
   
   function bookAhallNo(agent) {
       agent.add(`Oh! I'm sorry for that. Please click on the button 
       bellow to fill in the details again.`);
       agent.add(new Suggestion(`Book a Hall`));
   }
   
   function confirmAvailability(agent) {
       const hall_name = agent.parameters.hall;
       
       const date_in = agent.parameters.date;
        var date_rev = date_in.substring(0, 10);
        // date_rev = date_rev.split('-');
        // var date = date_rev.reverse().join('-');
       
       agent.setContext({
           name: 'check_avail',
           lifespan: 2,
           parameters: {hall: hall_name, date: date_rev}
        });
        
        agent.add(`Okay! Let me confirm.`);
        agent.add(new Card({
            title: `Check availability of`,
            text: `Hall name: ${hall_name}<br>Date: ${date_rev}`,
            })
        );
        agent.add(new Suggestion(`Yes`));
        agent.add(new Suggestion(`No`));
   }
   
   function confirmAvailabilityYes(agent) {
       
       const check_avail = agent.getContext('check_avail');
       const hall_name = check_avail.parameters.hall;
       const date = check_avail.parameters.date;
       
       var result_out = "Following are the bookings for that date:<br>";
       //console.log(hall_name + " " + date);
       return bookingDetails.once("value").then( snapshot => {
        //console.log(snapshot.val());
        var result = "", count = 1;
        snapshot.forEach(data => {
            result = data.val();
            //console.log(result);
            if( result.hall_id === hall_name)
            {
                if(result.date === date)
                {
                    //console.log(result);
                    result_out += count++ + ". Start time: " + result.start_time + ", End Time: " + result.end_time + ", Name: " + result.name + ", Dept: " + result.department + ".<br>";
                }
            }
            else
                ;
        })
        
        //console.log(result_out);
        return(result_out);
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      })
      .then(result_out => {
          console.log("Data: " + result_out);
          agent.add(`${result_out}`);
          agent.add(new Suggestion(`Book a Hall`));
        })
        .catch(errorObject => {
            console.log("The read failed in function: " + JSON.stringify(errorObject.code));
        });
    
    }
   
   function confirmAvailabilityNo(agent) {
       agent.add(`Oh! I'm sorry for that. Please click on the button 
       bellow to fill in the details again.`);
       agent.add(new Suggestion(`Check Availability`));
   }
   
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  //intentMap.set('Default Welcome Intent', welcome);
  //intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Book a Hall', bookAhall);
  intentMap.set('Book a Hall - yes', bookAhallYes);
  intentMap.set('Book a Hall - no', bookAhallNo);
  intentMap.set('Check Availability', confirmAvailability);
  intentMap.set('Check Availability - yes', confirmAvailabilityYes);
  intentMap.set('Check Availability - no', confirmAvailabilityNo);
  agent.handleRequest(intentMap);
});
