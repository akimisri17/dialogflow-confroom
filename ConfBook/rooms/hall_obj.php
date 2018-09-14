<?php
class Hall{
 
    // database connection and table name
    private $conn;
    private $table_name = "hall";
 
    // object properties
    public $id;
    public $hall_name;
    public $description;
 
    // constructor with $db as database connection
    public function __construct($db){
        $this->conn = $db;
    }

        // used by select drop-down list
    public function getHallId($name){
        $query = "SELECT id FROM " . $this->table_name . " WHERE hall_name='".$name."'";
     
        $stmt = $this->conn->prepare( $query );
        $stmt->execute();
     
        return $stmt;
    }

}