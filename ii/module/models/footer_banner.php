<?php

class footer_banner extends Common
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
                'table' => 'footer', 
                'shortName' => 'F2',
                'key' => 'footer_id', 
                'joinKey' => $this->tableShortName.'.footer_id',
                'joinColumn' => array(
                    'code' => 'footer_code',
                )
            ),
        );

        parent::joinTable($joinTable);
    }
}
?>
