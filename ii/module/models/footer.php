<?php

class footer extends Common
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
        );

        parent::joinTable($joinTable);
    }
}
?>
