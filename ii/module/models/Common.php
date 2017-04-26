<?php

class Common extends db_model
{
    protected $start = 0;
    protected $limit = 25;
    protected $language_id = 1;

    public function Set($params)
    {
        //table
        $this->tableName = get_called_class();
        $this->tableShortName = substr($this->tableName, 0, 1) . 1;

        $this->sql = 'SHOW COLUMNS FROM `' . $this->tableName . '`';
        parent::Show();

        $this->properties = $this->columnNames;
        $this->allowUpdate = array_values(array_diff($this->properties, array($this->columnNames[0])));
        $this->allowCreate = array_values(array_diff($this->properties, array($this->columnNames[0])));
        $this->allowSearch = $this->columnNames;
        // $this->allowSearch = (isset($this->timeColumn)) ? array_values(array_diff($this->properties, $this->timeColumn)) : array_values(array_diff($this->properties, array()));

        if (isset($params['start']))
            $this->start = $params['start'];
        if (isset($params['limit']))
            $this->limit = $params['limit'];
        if (isset($params['language_id']))
            $this->language_id = $params['language_id'];
        if (isset($params['search_type']))
            $this->search_type = $params['search_type'];
        if (isset($params['search_value']))
            $this->search_value = $params['search_value'];
        if (isset($params['order_by']))
            $this->order_by = $params['order_by'];
        if (isset($params['sort_by']))
            $this->sort_by = $params['sort_by'];

        $this->params = $params;
        
        foreach ($this->properties as $property) {
            
            $this->$property = isset($params[$property]) ? $params[$property] : '';
        }

        $this->handleJoinTable();

        $this->sortOrder();
    }

    public function DescribeTable()
    {
        //query ready
        $this->sql = "Describe ". $this->tableName . ";";

        //describe the table, get structure
        $structure = $this->Describe();

        $tmpStructure = "";

        foreach ($structure['data'] as $columns) {

            if($columns->Field !== 'Serialize') {

                foreach ($columns as $key => $value) {

                    switch ($key) {

                        case 'Field':
                            $tmpStructure .= "`" . $value . "` ";
                            break;

                        case 'Type':
                            $tmpStructure .= $value . " ";
                            break;

                        case 'Null':
                            $tmpStructure .= ($value == "NO") ? "NOT NULL " : "NULL ";
                            break;

                        case 'Key':
                            $tmpStructure .= ($value == "PRI") ? "PRIMARY KEY " : "";
                            break;

                        case 'Default':
                            // $tmpStructure .= ($value == "" ) ? "Default null " : "Default '" . $value . "' ";
                            break;

                        case 'Extra':
                            $tmpStructure .= ($value == "" ) ? "" : $value;
                            break;
                    }
                }

                $tmpStructure .= ",";
            }
        }

        $tmpStructure = substr($tmpStructure, 0, strlen($tmpStructure) - 1);

        return $tmpStructure;
    }

    public function handleJoinTable()
    {
        //join table
        $joinTable = array();

        $this->joinTable($joinTable);
    }

    public function joinTable($joinTable)
    {
        //handle join
        $this->joinQuery  = "";
        $this->joinFields = "";
        $this->joinCondition = "";

        $this->joinTable = $joinTable;
        
        if(count($joinTable) > 0) {

            //add to condition if is set in params
            foreach ($this->params as $key => $value) {

                if($key !== 'controller' && $key !== 'action' && !in_array($key, $this->properties)) {

                    foreach ($this->joinTable as $tableKey => $table) {

                        if(isset($table['joinColumn'])) {
                            
                            if(in_array($key, $table['joinColumn'])) {

                                $newKey = array_search($key, $table['joinColumn']);

                                $this->joinTable[$tableKey]['joinCondition'][$newKey] = $value;
                            }
                        }
                    }
                }
            }
            
            if (count($this->joinTable) > 0) {
                
                foreach ($this->joinTable as $table) {
                    
                    $this->joinQuery .= " LEFT JOIN `" . $table['table'] . "` " . $table['shortName'] . " ON " . $table['shortName'] . "." . $table['key'] . " = " . $table['joinKey'] . " ";
                    
                    if(isset($table['joinColumn'])) {

                        foreach ($table['joinColumn'] as $key => $value) {
                            
                            $this->joinFields .= ", " . $table['shortName'] . "." . $key . " AS " . $value;
                        }
                    }

                    //join table condition
                    if(isset($table['condition'])) {
                        
                        foreach ($table['condition'] as $key => $value) {
                        
                            $this->joinQuery .=  " AND " . $table['shortName'] . "." . $key . " = " .  "'" . $value . "'";
                        }
                    }

                    //join table condition
                    if(isset($table['joinCondition'])) {

                        foreach ($table['joinCondition'] as $key => $value) {
                            
                            $this->joinCondition .=  " AND " . $table['shortName'] . "." . $key . " = " .  "'" . $value . "'";
                        }
                    }
                }
            }
        }
    }

    public function sortOrder()
    {
        //default order by
        if (!isset($this->order_by))
            $this->order_by = "$this->tableShortName." . $this->properties[0];
        else {

            //handle join table order by
            foreach ($this->joinTable as $tableKey => $table) {

                if(isset($table['joinColumn'])) {
                    
                    if(in_array($this->order_by, $table['joinColumn'])) {

                        $newKey = array_search($this->order_by, $table['joinColumn']);

                        $this->order_by = $table['shortName'] .".". $newKey;
                    }
                }
            }
        }
        
        //default sort by
        if (!isset($this->sort_by))
            $this->sort_by = "DESC";
    }

    public function View()
    {
        //handle condition
        $conditions = array();
        
        foreach ($this->properties as $properity) {
            
            if (strlen($this->$properity) > 0) {

                $this->bindingParams[$properity] = $this->$properity;
                
                $conditions[] = "$this->tableShortName.$properity = :$properity";
            }
        }
        
        $fields = implode(", $this->tableShortName.", $this->properties);
        
        $condition = 1;
        
        if (sizeof($conditions) > 0) {
            
            $condition = implode(" AND ", $conditions);
        }
        
        //query ready
        $sql = "SELECT $this->tableShortName.$fields $this->joinFields
        FROM `$this->tableName` $this->tableShortName 
        $this->joinQuery
        WHERE $condition $this->joinCondition 
        ORDER BY " . $this->order_by . " " . $this->sort_by . " 
        LIMIT " . $this->start . " , " . $this->limit . "
        ;";
        
        $countSql = "SELECT COUNT(DISTINCT(".$this->tableShortName.".". $this->properties[0] .")) as Total 
        FROM `$this->tableName` $this->tableShortName
        $this->joinQuery 
        WHERE $condition $this->joinCondition 
        ; ";
        
        $result = $this->executeView($sql, $countSql);

        return $result;
    }

    public function executeView($sql, $countSql)
    {
        $this->sql = $sql;

        $this->countSql = $countSql;

        return $this->Select();
    }
    
    public function Edit()
    {
        $id = $this->properties[0];
        if (strlen($this->$id) > 0) {
            
            $updateFields = array();
            foreach ($this->allowUpdate as $updated) {
                
                if (isset($this->params[$updated])) {
                    
                    $this->bindingParams[$updated] = $this->$updated;
                    $updateFields[]                = "$updated = :$updated";
                }
            }
            
            $this->bindingParams[$this->properties[0]] = $this->$id;
            
            if (sizeof($updateFields) > 0) {
                
                $toBeUpdate = implode(",", $updateFields);
                $sql  = "UPDATE `$this->tableName` SET $toBeUpdate WHERE " . $this->properties[0] . " = :" . $this->properties[0] . ";";
                $result = $this->executeEdit($sql);
            }
            else {
                
                $result = $this->result['error_msg'] = "None Field to Update.";
            }
            
            return $result;
        }
    }

    public function executeEdit($sql)
    {
        $this->sql = $sql;

        return $this->Update();
    }
    
    public function Compose()
    {
        $valid = true;
        
        foreach ($this->allowCreate as $field) {
            
            if (isset($this->params[$field])) {
                
                $this->bindingParams[$field] = $this->$field;
            } 
            else {
                
                $msg = $field;
                
                $valid = false;
                
                break;
            }
        }
        
        if ($valid) {
            
            $columns = implode(', `' . $this->tableName . '`.', $this->allowCreate);
            
            $values = implode(', :', $this->allowCreate);
            
            $sql = "INSERT INTO `$this->tableName` (`$this->tableName`.$columns) VALUES (:$values);";
            
            $result = $this->executeCompose($sql);
            
            if ($result['data']['lastID'] === '0' || $result['data']['lastID'] === 0) {
                
                $result = $this->result['error_msg'] = "Fail to Create Record : lastID = 0.";
            }
            
        } 
        else {
            
            $result = $this->result['error_msg'] = "Fail to Create Record : Missing " . $msg;
        }
        
        return $result;
    }

    public function executeCompose($sql)
    {
        $this->sql = $sql;

        return $this->Create();
    }

    public function Find()
    {
        //handle join
        $this->joinQuery     = "";
        $this->joinFields    = "";
        $this->joinSearchId  = "";
        $this->joinCondition = "";

        //add to condition if is set in params
        foreach ($this->params as $key => $value) {

            if($key !== 'controller' && $key !== 'action' && !in_array($key, $this->properties)) {

                foreach ($this->joinTable as $tableKey => $table) {

                    if(isset($table['joinColumn'])) {
                        
                        if(in_array($key, $table['joinColumn'])) {

                            $newKey = array_search($key, $table['joinColumn']);

                            $this->joinTable[$tableKey]['joinCondition'][$newKey] = $value;
                        }
                    }
                }
            }
        }

        //handle join search_type
        $joinSearchArray = array();

        $this->newSearch_type = $this->search_type;

        foreach ($this->joinTable as $tableKey => $table) {

            if(isset($table['joinColumn'])) {

                foreach ($table['joinColumn'] as $key => $value) {

                    if ($this->search_type == $value || $this->search_type == $key) {
                        $this->search_type = $key;
                        $this->newSearch_type = $table['shortName'] . '.' . $key;
                    }

                    array_push($joinSearchArray, $key);
                }
            }
        }
        //end handle join search_type
        
        if (count($this->joinTable) > 0) {
            
            foreach ($this->joinTable as $table) {
                
                $k = 0;
                
                $this->joinQuery .= " LEFT JOIN `" . $table['table'] . "` " . $table['shortName'] . " ON " . $table['shortName'] . "." . $table['key'] . " = " . $table['joinKey'] . " ";
                
                if(isset($table['joinColumn'])) {

                    foreach ($table['joinColumn'] as $key => $value) {
                        
                        $this->joinFields .= ", " . $table['shortName'] . "." . $key . " AS " . $value;
                    }
                }
                
                //join table condition
                if(isset($table['condition'])) {

                    foreach ($table['condition'] as $key => $value) {
                    
                        $this->joinQuery .=  " AND " . $table['shortName'] . "." . $key . " = " .  "'" . $value . "'";
                    }
                }

                //join table condition
                if(isset($table['joinCondition'])) {
                    
                    foreach ($table['joinCondition'] as $key => $value) {
                        
                        $this->joinCondition .=  " AND " . $table['shortName'] . "." . $key . " = " .  "'" . $value . "'";
                    }
                }

                if(isset($table['joinColumn'])) {
                
                    $this->joinSearchId .= "OR " . $table['shortName'] . "." . $table['key'] . " IN (SELECT DISTINCT " . $table['shortName'] . "." . $table['key'] . " FROM `" . $table['table'] . "` " . $table['shortName'] . " WHERE ";

                    foreach ($table['joinColumn'] as $key => $value) {
                        
                        $k++;
                        if ($k !== count($table['joinColumn']))
                            $this->joinSearchId .= " " . $table['shortName'] . "." . $key . " LIKE BINARY '%". $this->search_value ."%' OR ";
                        else
                            $this->joinSearchId .= " " . $table['shortName'] . "." . $key . " LIKE BINARY '%". $this->search_value ."%') ";
                    }
                }
            }
        }

        //handle condition
        $conditions = array();
        
        foreach ($this->properties as $properity) {
            
            if (strlen($this->$properity) > 0) {

                $this->bindingParams[$properity] = $this->$properity;
                
                $conditions[] = "$this->tableShortName.$properity = :$properity";
            }
        }
        
        $fields = implode(", $this->tableShortName.", $this->properties);
        
        $condition = 1;
        
        if (sizeof($conditions) > 0) {
            
            $condition = implode(" AND ", $conditions);
        }
        
        if ($this->search_type == 'all') {
            
            //Concatenate all properties as Columns for Display
            $fields = implode(", $this->tableShortName.", $this->properties);
            
            $i      = 0;
            
            $search_id = "SELECT DISTINCT $this->tableShortName." . $this->properties[0] . " FROM `$this->tableName` $this->tableShortName WHERE ";
            
            foreach ($this->allowSearch as $searchField) {

                $i++;
                if ($i !== count($this->allowSearch))
                    $search_id .= "$this->tableShortName.$searchField LIKE BINARY '%". $this->search_value ."%' OR ";
                else
                    $search_id .= "$this->tableShortName.$searchField LIKE BINARY '%". $this->search_value ."%'";
            }
        } 
        else if (in_array($this->search_type, $joinSearchArray) || in_array($this->search_type, $this->properties)) { //search_type equal to the current table properties and join table properties

            //Concatenate all properties as Columns for Display
            $fields = implode(", $this->tableShortName.", $this->properties);

            $search_id = "SELECT DISTINCT $this->tableShortName." . $this->properties[0] . " FROM `$this->tableName` $this->tableShortName WHERE ";

            $search_id .= $this->newSearch_type . " LIKE BINARY '%". $this->search_value ."%'";

            $this->joinSearchId = "";
        } 
        else { //search_type incorrect

            $result = $this->result['error_msg'] = "Incorrect search_type!";

            return $result;

            exit;
        }

        $sql = "SELECT $this->tableShortName.$fields $this->joinFields
        FROM `$this->tableName` $this->tableShortName
        $this->joinQuery
        WHERE ($condition $this->joinCondition )
        AND ($this->tableShortName." . $this->properties[0] . " IN ($search_id)
        $this->joinSearchId) 
        ORDER BY " . $this->order_by . " " . $this->sort_by . "  
        LIMIT " . $this->start . " , " . $this->limit . ";";
        
        $countSql = "SELECT COUNT(DISTINCT(".$this->tableShortName.".". $this->properties[0] .")) as Total 
        FROM `$this->tableName` $this->tableShortName
        $this->joinQuery
        WHERE ($condition $this->joinCondition ) 
        AND ($this->tableShortName." . $this->properties[0] . " IN ($search_id) 
        $this->joinSearchId) 
        ; ";
        
        $result = $this->executeFind($sql, $countSql);

        return $result;
    }

    public function executeFind($sql, $countSql)
    {
        $this->sql = $sql;

        $this->countSql = $countSql;

        return $this->Search();
    }

    public function TemporarySelect()
    {
        $tmpStructure = $this->DescribeTable();

        // join table
        $joinTable = array(

            array(
                'table' => 'Parcel', 
                'shortName' => 'P1',
                'key' => 'ParcelID', 
                'joinKey' => 'tmp_'.$this->tableShortName.'.ParcelID',
                'joinColumn' => array(
                    'ProductName' => 'ProductName',
                )
            ), 

        );

        $this->joinTable($joinTable);

        //fix order by
        //handle join table order by
        foreach ($this->joinTable as $tableKey => $table) {

            if(isset($table['joinColumn'])) {
                
                if(in_array($this->order_by, $table['joinColumn'])) {

                    $newKey = array_search($this->order_by, $table['joinColumn']);

                    $this->order_by = $table['shortName'] .".". $newKey;
                }
                else {

                    $this->order_by = "tmp_" . $this->order_by;
                }
            }
        }

        //handle condition
        $conditions = array();

        foreach ($this->properties as $properity) {

            if (strlen($this->$properity) > 0) {

                $this->bindingParams[$properity] = $this->$properity;

                $conditions[] = "$this->tableShortName.$properity = :$properity";
                $tmpConditions[] = "tmp_$this->tableShortName.$properity = :$properity";
            }
        }

        // del Serialize
        array_pop($this->properties);

        $fields = implode(", $this->tableShortName.", $this->properties);
        $tmpFields = implode(", tmp_$this->tableShortName.", ($this->properties));

        $condition = 1;
        $tmpCondition = 1;

        if (sizeof($conditions) > 0) {

            $condition = implode(" AND ", $conditions);
        }

        if (sizeof($tmpConditions) > 0) {

            $tmpCondition = implode(" AND ", $tmpConditions);
        }

        //query ready
        $sql = array(

            "DROP TEMPORARY TABLE IF EXISTS `tmp_". strtolower($this->tableName) ."`;",

            "CREATE TEMPORARY TABLE `tmp_". strtolower($this->tableName) ."` (" . $tmpStructure . ") ENGINE=MEMORY DEFAULT CHARACTER SET=utf8;",

            "INSERT INTO `tmp_". strtolower($this->tableName) ."` SELECT $this->tableShortName.$fields FROM `$this->tableName` $this->tableShortName WHERE $condition ;",

            "SELECT tmp_" . "$this->tableShortName.$tmpFields $this->joinFields FROM `tmp_" . strtolower($this->tableName) ."` tmp_" . "$this->tableShortName $this->joinQuery WHERE $tmpCondition $this->joinCondition ORDER BY " . $this->order_by . " " . $this->sort_by . " LIMIT " . $this->start . " , " . $this->limit . " ;",

        );

        $countSql = "SELECT COUNT(DISTINCT(tmp_".$this->tableShortName.".". $this->properties[0] .")) as Total
        FROM `tmp_$this->tableName` tmp_$this->tableShortName
        $this->joinQuery
        WHERE $tmpCondition $this->joinCondition
        ; ";

        $result = $this->executeTemporarySelect($sql, $countSql);

        return $result;
    }

    public function executeTemporarySelect($sql, $countSql)
    {
        $this->sql = $sql;

        $this->countSql = $countSql;

        return $this->TransactionsSelect();

    }
}
?>
