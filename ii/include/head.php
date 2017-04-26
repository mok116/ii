<?php

/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/

// set header
header('Content-Type: text/html; charset=utf-8');

// overrides the default PHP memory limit.
ini_set('memory_limit', '-1');

// set time limit for prevent time out
set_time_limit(0);

// Define path
define('CONTROLLER_PATH', realpath(dirname(__FILE__).'/../module/controller'));
define('MODEL_PATH', realpath(dirname(__FILE__).'/../module/models'));
define('LIB_PATH', realpath(dirname(__FILE__).'/../module/lib'));
define('FUNCTION_PATH', realpath(dirname(__FILE__).'/../function'));
define('CONFIG_PATH', realpath(dirname(__FILE__).'/../config'));

// include function class
require_once(LIB_PATH."/init.php");

// include function class
date_default_timezone_set('Asia/Hong_Kong'); // GMT + 8

?>