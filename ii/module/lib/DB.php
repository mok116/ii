<?php
class DB
{
    protected $db;

	protected $server = "localhost";
	protected $dbname = "edm"; 
	protected $dbuser = 'root';
	protected $dbpassword = '';
	
	public function __construct()
    {
        $this->db = $this->connectDB();	
    }
	
	public function connectDB()
	{
		try {
			$db = new PDO("mysql:host=$this->server;dbname=$this->dbname;charset=UTF8;", $this->dbuser, $this->dbpassword);
		} catch (PDOException $e) {
			echo 'Connection failed: ' . $e->getMessage();
			exit();
		}
		return $db;
	}
}