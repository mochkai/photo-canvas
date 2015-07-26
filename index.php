<html>
	<head>
		<style type="text/css">
		
		canvas#photo-canvas
		{
			width	: 800px;
			height	: 600px;
		}
		
		canvas#photo-canvas-2
		{
			width	: 100%;
			height	: 100%;
		}

		</style>

		<link rel="stylesheet" href="assets/css/photo-canvas-default.css">
	</head>
	<body>

		<canvas id="photo-canvas"></canvas>
		<canvas id="photo-canvas-2"></canvas>
		

		<script src="assets/js/fabric.min.js" ></script>
		<script src="assets/js/dropzone.min.js" ></script>
		<script src="assets/js/photo-canvas.js" ></script>
		<script type="text/javascript" >
			var canvas1 = PhotoCanvas.create("photo-canvas");
			var canvas2 = PhotoCanvas.create("photo-canvas-2");
		</script>
	</body>
</html> 