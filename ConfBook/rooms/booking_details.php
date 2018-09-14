<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
 
// include database and object files
include_once 'conn.php';
include_once 'booking_details_obj.php';
include_once 'hall_obj.php';
 
// instantiate database and booking object
$database = new Database();
$db = $database->getConnection();
$hall = new Hall($db);
 
// initialize object
$booking = new Booking($db);

//get where

$result = $hall->getHallId($_GET['hall']??null);
$result = $result->fetch(PDO::FETCH_ASSOC);
$booking->hall_id =  $result['id'];
if(!$booking->hall_id)
{
    echo '{"error":"Hall not found"}';
    die();
}
$where = array('hall_id' => $booking->hall_id??null, 'date' => $_GET['date']??null);
 
// query booking table
$stmt = $booking->read($where);
$num = $stmt->rowCount();
 
// check if more than 0 record found
if($num>0){
 
    // products array
    $booking_arr=array();
    $booking_arr["records"]=array();
 
    // retrieve our table contents
    // fetch() is faster than fetchAll()
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
        extract($row);
 
        $booking_item=array(
            "start_time" => $start_time,
            "end_time" => $end_time,
			"contact_person" => $contact_person,
			"dept" => $dept
        );
 
        array_push($booking_arr["records"], $booking_item);
    }
 
    echo json_encode($booking_arr);
}
 
else{
    echo json_encode(
        array("message" => "No bookings found.")
    );
}
?>