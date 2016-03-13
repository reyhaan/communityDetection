<?php
	$data = $_POST['data'];
	$myfile = fopen("communities.txt", "w") or die("Unable to open file!");
	fwrite($myfile, $data);
	fclose($myfile);
?>