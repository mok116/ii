<?php

class item extends Common
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
                'table' => 'campaign', 
                'shortName' => 'C1',
                'key' => 'campaign_id', 
                'joinKey' => $this->tableShortName.'.campaign_id',
                'joinColumn' => array(
                    'name' => 'campaign_name',
                )
            ), 

        );

        parent::joinTable($joinTable);
    }
}
?>
