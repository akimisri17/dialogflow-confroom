<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
 
// get database connection
include_once 'conn.php';
 
// instantiate booking object
include_once 'booking_details_obj.php';
include_once 'hall_obj.php';
 
$database = new Database();
$db = $database->getConnection();
 
$booking = new Booking($db);
$hall = new Hall($db);
 
// get posted data
$data = json_decode(file_get_contents("php://input"));
 
// set booking property values
$result = $hall->getHallId($data->hall);
$result = $result->fetch(PDO::FETCH_ASSOC);
$booking->hall_id =  $result['id'];
if(!$booking->hall_id)
{
    echo '{"error":"Hall not found"}';
    die();
}
$booking->date = $data->date;
$booking->start_time = $data->start_time;
$booking->end_time = $data->end_time;
$booking->contact_person = $data->contact_person;
$booking->dept = $data->dept;
$validate = $booking->validate($booking);

if($validate===true)
{ 
    // create the booking
    if($booking->create()){
        echo '{';
            echo '"message": "Booked."';
        echo '}';
    }
     
    // if unable to create the booking, tell the user
    else{
        echo '{';
            echo '"error": "Unable to book."';
        echo '}';
    }
}
else
{
    echo '{"error":"'.$validate.'"}';
}
?>