<?php 

if ( isset( $_POST ) && isset( $_POST['image_data'] ) )
{
	$data = explode(";", $_POST['image_data']);
	$type = explode(":", $data[0]);
	$type = $type[1];
	$data = explode(",", $data[1]);

	//header('Content-Type: application/force-download');
	header("Content-type: ".$type);
	header('Content-Disposition: attachment;filename="save.png"');

	echo base64_decode($data[1]);
}

?>