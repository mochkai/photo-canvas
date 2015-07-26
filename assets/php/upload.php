<?php 

$allowed_types = array(
		"jpg",
		"jpeg",
		"png",
		"gif"
	);

if ( isset( $_FILES ) )
{
	foreach ( $_FILES as $file ) 
	{
		$target_dir		= "tmp/";
		$upload_ok		= true;
		$file_type		= strtolower( pathinfo( basename( $file["name"] ), PATHINFO_EXTENSION ) );
		$target_file	= $target_dir . md5( date("YmdHis") . rand() ) . "." . $file_type;

		if ( ! in_array( $file_type, $allowed_types ) )
		{
			$upload_ok		= false;
		}

		if ( $upload_ok )
		{
			if ( move_uploaded_file( $file["tmp_name"], "../../" . $target_file ) ) 
			{
				echo $target_file;
			}
		}
	}
}

?>