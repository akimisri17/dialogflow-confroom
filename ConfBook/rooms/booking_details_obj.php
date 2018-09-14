<?php
class Booking{
 
    // database connection and table name
    private $conn;
    private $table_name = "booking_details";
 
    // object properties
    public $hall_id;
    public $date;
    public $start_time;
    public $end_time;
 
    // constructor with $db as database connection
    public function __construct($db){
        $this->conn = $db;
    }

    
    public function read($where){
        $additionalwhere = '';
        if($where['hall_id'])
            $additionalwhere = " WHERE hall_id='{$where['hall_id']}' ";
        if($where['date'])
            $additionalwhere .= " AND date='{$where['date']}' ";
        //select all data
        $query = "SELECT
                    *
                FROM
                    " . $this->table_name . $additionalwhere;
     
        $stmt = $this->conn->prepare( $query );
        $stmt->execute();
     
        return $stmt;
    }

    // create booking
    function create(){
     
        // query to insert record
        $query = "INSERT INTO
                    " . $this->table_name . "
                SET
                    hall_id=:hall_id, date=:date, start_time=:start_time, end_time=:end_time, contact_person=:contact_person, dept=:dept";
     
        // prepare query
        $stmt = $this->conn->prepare($query);
     
        // sanitize
        $this->hall_id=htmlspecialchars(strip_tags($this->hall_id));
        $this->date=htmlspecialchars(strip_tags($this->date));
        $this->start_time=htmlspecialchars(strip_tags($this->start_time));
        $this->end_time=htmlspecialchars(strip_tags($this->end_time));
        $this->contact_person=htmlspecialchars(strip_tags($this->contact_person));
        $this->dept=htmlspecialchars(strip_tags($this->dept));
     
        // bind values
        $stmt->bindParam(":hall_id", $this->hall_id);
        $stmt->bindParam(":date", $this->date);
        $stmt->bindParam(":start_time", $this->start_time);
        $stmt->bindParam(":end_time", $this->end_time);
        $stmt->bindParam(":contact_person", $this->contact_person);
        $stmt->bindParam(":dept", $this->dept);
     
        // execute query
        if($stmt->execute()){
            return true;
        }
     
        return false;
         
    }

    public function validate($data)
    {
        if($this->validateDate($data->date))
            if($data->start_time < $data->end_time)
           {
                $where = array('hall_id' => $data->hall_id, 'date' => $data->date, 'start_time' => null, 'end_time' => null);
                $stmt = $this->read($where);
                while ($result = $stmt->fetch(PDO::FETCH_ASSOC)) {
                   if(($data->start_time >=  $result['start_time']) && ($data->start_time <= $result['end_time']))
                    return "Start time is not available";
                    elseif(($data->end_time >=  $result['start_time']) && ($data->end_time <= $result['end_time']))
                        return "End time is not available";
                }
                
                return true;
           }
           else return "Invalid start and end time";
        else return "Invalid Date";

        return false;
    }

    public function validateDate($date, $format = 'Y-m-d')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }

}