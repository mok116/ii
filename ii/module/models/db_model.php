<?php
class db_model
{
	protected $db;
	protected $sql;
	protected $countSql;
	protected $bindingParams;
	protected $result;

	public function __construct() {

		$db = new DB();

        $this->db = $db->connectDB();
	}

	public function Describe()
	{
		// reset result
		unset($this->result);

		try {

			$executeSql = $this->db->prepare($this->sql);

			$executeSql->execute();

			while($row = $executeSql->fetch(PDO::FETCH_OBJ)) {

				$this->result['data'][] = $row;
			}
			
		} 
		catch (Exception $e) {
			
			echo $e->getMessage();
			exit();
		}

		return $this->result;
	}

	public function TransactionsSelect()
	{
		// reset result
		unset($this->result);

		try {

			$this->db->beginTransaction();

	        foreach ($this->sql as $sql) {

	        	$executeSql = $this->db->prepare($sql);

	        	if(sizeof($this->bindingParams) > 0) {

					foreach($this->bindingParams as $key=>$value) {

						$executeSql->bindValue("$key", "$value");
					}
				}

	        	$executeSql->execute();
	        }

	        $this->db->commit();

	        while($row = $executeSql->fetch(PDO::FETCH_OBJ)) {

				$this->result['data'][] = $row;
			}

			if(isset($this->countSql) && strlen($this->countSql)>0) {

				$executeCountSql = $this->db->prepare($this->countSql);

				if(sizeof($this->bindingParams) > 0) {

					foreach($this->bindingParams as $key=>$value) {

						$executeCountSql->bindValue("$key", "$value");
					}
				}
				
				$executeCountSql->execute();

				$row = $executeCountSql->fetch(PDO::FETCH_OBJ);

				$this->result['total'] = $row->Total;
			}
		} 
		catch (Exception $e) {
			
			$this->db->rollBack();
			echo 'Select failed: ' . $e->getMessage();
			exit();
		}

		return $this->result;
	}

	public function Show()
	{
		// reset result
		unset($this->result);

        try {    

			$executeSql = $this->db->prepare($this->sql);

			$executeSql->execute();
            
            $rawColumnData = $executeSql->fetchAll();

            $dateAndTime = array('timestamp', 'date', 'datetime', 'time', 'year');
            
            foreach($rawColumnData as $outerKey => $array) {

                foreach($array as $innerKey => $value) {
                        
                    if ($innerKey === 'Field') {

                        if (!(int)$innerKey) {

                            $this->columnNames[] = $value;
                        }
                    }

                    if ($innerKey === 'Type') {

                    	if(in_array($value, $dateAndTime)) {

                    		$this->timeColumn[] = $array['Field'];
                    	}
                    }
                }
            }

            return true;
        } 
        catch (Exception $e) {

            return $e->getMessage(); //return exception
        }
    }
	
	public function Select()
	{
		// reset result
		unset($this->result);

		try {

			$executeSql = $this->db->prepare($this->sql);

			if(sizeof($this->bindingParams) > 0) {

				foreach($this->bindingParams as $key=>$value) {

					$executeSql->bindValue("$key", "$value");
				}
			}

			$executeSql->execute();
			while($row = $executeSql->fetch(PDO::FETCH_OBJ)) {

				$this->result['data'][] = $row;
			}
		
			if(isset($this->countSql) && strlen($this->countSql)>0) {

				$executeCountSql = $this->db->prepare($this->countSql);
				
				if(sizeof($this->bindingParams) > 0) {

					foreach($this->bindingParams as $key=>$value) {

						$executeCountSql->bindValue("$key", "$value");
					}
				}

				$executeCountSql->execute();

				$row = $executeCountSql->fetch(PDO::FETCH_OBJ);

				$this->result['total'] = $row->Total;
			}
			
		}
		catch(Exception $e) {

			echo 'Select failed: ' . $e->getMessage();
			exit();
		}

		return $this->result;
	}
	
	public function Update()
	{
		// reset result
		unset($this->result);

		$executeSql = $this->db->prepare($this->sql);

		if(sizeof($this->bindingParams) > 0) {

			foreach($this->bindingParams as $key=>$value) {

				$executeSql->bindValue("$key", "$value");
			}
		}

		$executeSql->execute();

		$this->result['data'][] = $executeSql->rowCount();

		return $this->result;
	}
	
	public function Create()
	{
		// reset result
		unset($this->result);

		$executeSql = $this->db->prepare($this->sql);

		if(sizeof($this->bindingParams) > 0) {

			foreach($this->bindingParams as $key=>$value) {

				$executeSql->bindValue("$key", "$value");
			}
		}

		$executeSql->execute();

		$this->result['data']['lastID'] = $this->db->lastInsertId();
		
		return $this->result;
	}

	public function Search()
	{
		// reset result
		unset($this->result);

		try {

			$executeSql = $this->db->prepare($this->sql);

			if(sizeof($this->bindingParams) > 0) {

				foreach($this->bindingParams as $key=>$value) {
					
					$executeSql->bindValue("$key", "$value");
				}		
			}

			$executeSql->execute();
			while($row = $executeSql->fetch(PDO::FETCH_OBJ)) {

				$this->result['data'][] = $row;
			}
		
			if(isset($this->countSql) && strlen($this->countSql)>0) {

				$db = new DB();

				$this->db = $db->connectDB();

				$executeCountSql = $this->db->prepare($this->countSql);

				if(sizeof($this->bindingParams) > 0) {

					foreach($this->bindingParams as $key=>$value) {

						$executeCountSql->bindValue("$key", "$value");
					}		
				}

				$executeCountSql->execute();
				
				$row = $executeCountSql->fetch(PDO::FETCH_OBJ);

				$this->result['total'] = $row->Total;
			}
			
		}
		catch(Exception $e) {

			echo 'Select failed: ' . $e->getMessage();
			exit();
		}

		return $this->result;
	}	
}
?>
