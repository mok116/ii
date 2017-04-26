<?php

class store extends Common
{  
    public function SetProperties($params)
    {
        parent::Set($params);
    }
    
    /*public function handleJoinTable()
    {
        //join table 
        $joinTable = array(

            array(
                'table' => 'language', 
                'shortName' => 'L1',
                'key' => 'language_id', 
                'joinKey' => $this->tableShortName.'.language_id',
                'joinColumn' => array(
                    'code' => 'language_code',
                )
            ), 
        );

        parent::joinTable($joinTable);
    }*/
}
?>
