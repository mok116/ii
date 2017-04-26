<?php

class header_feature extends Common
{  
    public function SetProperties($params)
    {
        parent::Set($params);
    }

    public function handleJoinTable()
    {
        //join table 
        $joinTable = array(

            array(
                'table' => 'header', 
                'shortName' => 'H2',
                'key' => 'header_id', 
                'joinKey' => $this->tableShortName.'.header_id',
                'joinColumn' => array(
                    'code' => 'header_code',
                )
            ),
        );

        parent::joinTable($joinTable);
    }
}
?>
