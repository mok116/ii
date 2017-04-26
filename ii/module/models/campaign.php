<?php

class campaign extends Common
{  
    public function SetProperties($params)
    {
        parent::Set($params);

        $this->allowCreate = array_values(array_diff($this->properties, array($this->columnNames[0], "create_date")));
    }

    public function handleJoinTable()
    {
        //join table 
        $joinTable = array(

            array(
                'table' => 'store', 
                'shortName' => 'S1',
                'key' => 'store_id', 
                'joinKey' => $this->tableShortName.'.store_id',
                'joinColumn' => array(
                    'code' => 'store_code',
                    'name' => 'store_name',
                    'currency' => 'store_currency',
                    'symbol' => 'store_symbol',
                    'cdn' => 'store_cdn',
                )
            ),

             array(
                'table' => 'template', 
                'shortName' => 'T1',
                'key' => 'template_id', 
                'joinKey' => $this->tableShortName.'.template_id',
                'joinColumn' => array(
                    'name' => 'template_name',
                )
            ),
        );

        parent::joinTable($joinTable);
    }
}
?>
