<?php

/* Page Init Config */
function pageInitConfig($pageName) {

	foreach ($pageConfig as $key => $config) {

		if($key == $pageName) {

			return $config;
		}

		return $pageConfig['index.php'];
	}
}

?>