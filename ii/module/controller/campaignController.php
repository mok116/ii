<?php
class campaignController
{
	protected $obj;
	
	public function __construct($params)
	{	
		$this->obj = new campaign();
		$this->obj->SetProperties($params);
	}
	
	public function selectAction()
	{	
		$result = $this->obj->View();
		return $result;
	}

	public function updateAction()
	{
		$result = $this->obj->Edit();
		return $result;
	}
	
	public function createAction()
	{
		//create
		foreach ($this->obj->allowCreate as $field) {

			if (!isset($this->obj->params[$field])) {
                
                $this->obj->params[$field] = "";
            } 
		}
			
		$result = $this->obj->Compose();
		return $result;
	}

	public function searchAction()
	{
		$result = $this->obj->Find();
		return $result;
	}
}
?>