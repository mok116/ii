<?php
class storeController
{
	protected $obj;
	
	public function __construct($params)
	{	
		$this->obj = new store();
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
		$result = $this->obj->Compose();
		return $result;
	}
}
?>