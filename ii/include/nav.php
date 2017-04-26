<?php

$generate = "";
$translation = "";
$history = "";
$header = "";
$footer = "";

switch ($pageName) {

	case 'Create Campaign':
		$generate = 'active';
		break;
	
	case 'Translation':
		$translation = 'active';
		break;

	case 'Campaign History':
	case 'Campaign Detail':
		$history = 'active';
		break;

	case 'Header':
		$header = 'active';
		break;

	case 'Footer':
		$footer = 'active';
		break;
}

$allStoreParams = array(

	'sort_by' => 'ASC',
	'limit' => 9999,
);

$allStoreReuslt = connectModule($allStoreParams, 'store', 'select');
$allStoreData = $allStoreReuslt['data']['data'];

?>
<div class="top-bar">

	<div class="company">

		<select id="change-company">

			<option value="">View All</option>

			<?php
			for ($i=0; $i < count($allStoreData); $i++):
			?>
			<option value="<?php echo $allStoreData[$i]->code ?>" <?php if($allStoreData[$i]->code == $storeCode) echo 'selected'; ?>><?php echo $allStoreData[$i]->code ?> | <?php echo $allStoreData[$i]->name ?></option>
			<?php
			endfor;
			?>

		</select>

	</div>

	<ul class="side-bar-menu nav nav-pills nav-stacked">

		<li class="side-bar-menu-item <?php echo $generate ?>" role="presentation">
			<a href="generate.php?company=<?php echo strtoupper($storeCode) ?>"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Create Campaign</a>
		</li>

		<li class="side-bar-menu-item <?php echo $history ?>" role="presentation">
			<a href="history.php?company=<?php echo strtoupper($storeCode) ?>"><span class="glyphicon glyphicon-th-list" aria-hidden="true"></span> Campaign History</a>
		</li>

		<li class="side-bar-menu-item <?php echo $translation ?>" role="presentation">
			<a href="translation.php?company=<?php echo strtoupper($storeCode) ?>"><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span> Words Translation</a>
		</li>

		<li class="side-bar-menu-item <?php echo $header ?>" role="presentation">
			<a href="createHeader.php?company=<?php echo strtoupper($storeCode) ?>"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Header Code</a>
		</li>

		<li class="side-bar-menu-item <?php echo $footer ?>" role="presentation">
			<a href="createFooter.php?company=<?php echo strtoupper($storeCode) ?>"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Footer Code</a>
		</li>

	</ul>

</div>

