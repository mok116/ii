<?php

function __autoload($class_name) {

    if(file_exists(LIB_PATH.'/'.$class_name.'.php')) {

        require_once(LIB_PATH.'/'.$class_name.'.php');   

    } 
    else if(file_exists(MODEL_PATH.'/'.$class_name.'.php')) {

        require_once(MODEL_PATH.'/'.$class_name.'.php'); 

    } 
    else {

        throw new Exception("Unable to load $class_name.");
    }
}