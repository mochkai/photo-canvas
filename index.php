<html>
	<head>
		<style type="text/css">
		
		canvas#photo-canvas
		{
			width	: 100%;
			height	: 90%;
		}

		</style>

		<link rel="stylesheet" href="assets/css/photo-canvas-default.css">
	</head>
	<body>

		<canvas id="photo-canvas"></canvas>		

		<script src="assets/js/fabric.min.js" ></script>
		<script src="assets/js/dropzone.min.js" ></script>
		<script src="assets/js/photo-canvas.js" ></script>
		<script type="text/javascript" >
			var canvas1 = PhotoCanvas.create("photo-canvas");
		</script>
	</body>
</html> 