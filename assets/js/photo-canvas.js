/**
 * Photo Canvas
 *
 * Canvas library for image manipulation.
 *
 * @require 	fabric.js			<https://github.com/kangax/fabric.js>
 * @author  	Thiago Amerssonis	<thiago.amerssonis@gmail.com>
 * @version  	0.0.1
 */

var PhotoCanvas = (function ()
{
	// Store instances

	var instances = [];

	/**
	 *  PhotoCanvas.initialize()
	 *
	 * 	Inits Photo Canvas object using suplied arguments for 
	 * 	custom options e target canvas element, setup all private implementation
	 *
	 * 	@author Thiago Amerssonis 		<thiago.amerssonis@gmail.com>
	 * 	@param 	{String}	_canvas		Canvas element id, if popup is enabled canvas can be any type of element
	 * 	@param 	{Object}	_options	Suply custom options for initializing canvas object
	 */

	function initialize( _canvas, _options )
	{
		var instance = {};

		/**
		 *  PhotoCanvas.instance.options
		 *
		 * 	Default photocanvas definitions.
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 */
		instance.options	=
		{
			popup		: false,
			url			: "assets/php/upload.php",
			theme		: "default",
			viewport	: 
			{
				width		: null,
				height		: null
			},
			tools		:
			{
				transform	: true,
				image		: true,
				//rect		: true, //TODO : review rect tool usage, implement as a single shape tool
				//circle	: true, //TODO : review circle tool usage, implement as a single shape tool
				draw		: true,
				text		: true,
				//filters	: true, //TODO : implement image filters
				zoom		: true,
				pan			: true,
				crop		: true,
				undo		: true,
				save		: true
			},
			zoom	:
			{
				max	: 100,
				min	: 0.1
			},
			controls :
			{
				borderColor				: '#3B8EFF',
				borderOpacityWhenMoving	: 0.75,
				borderScaleFactor		: 1,
				cornerColor				: '#3B8EFF',
				cornerSize				: 8,
				transparentCorners		: false
			}
		};

		/**
		 *  PhotoCanvas.instance.updateCanvas()
		 *
		 * 	Updates canvas size according to screensize and viewport definitions
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 */
		instance.updateCanvas = function()
		{
			//TODO: dinamic canvas logic
		}

		/**
		 *  PhotoCanvas.instance.resetTools()
		 *
		 * 	Deactivates any tool and resets any configurations altered by the active tool
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 */
		instance.resetTools = function()
		{
			for ( tool in instance.options.tools )
			{
				instance.tools[tool].setAttribute("class", "photo-canvas-tools photo-canvas-tools-" + tool );
			}

			var objects = instance.canvas.getObjects();

			for ( index in objects )
			{
				objects[ index ].selectable = false;
			}

			instance.canvas.deactivateAllWithDispatch();
			instance.canvas.selection		= false;
			instance.canvas.isDrawingMode	= false;
			instance.canvas.defaultCursor	= "url( assets/img/cursor-default.png ), url( assets/img/cursor-default.cur ), default";
			instance.canvas.off("mouse:move");
			instance.canvas.off("mouse:up");
			instance.canvas.off("mouse:down");
			instance.canvas.renderAll();
		};

		/**
		 *  PhotoCanvas.instance.initTool()
		 *
		 *  Initializes de requested tool in the first parameter, 
		 *  handles tool reset and specific tool logic
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 * 	@param {String} 	_tool 	Name of the tool to initialize
		 */
		instance.initTool = function( _tool )
		{
			instance.resetTools( instance );
			_tool.setAttribute("class", _tool.getAttribute("class") + " active" );
			
			switch( _tool.getAttribute("data-canvas-tool") )
			{
				case "image":
					instance.initImage();
					break;

				case "zoom":
					instance.initZoom();
					break;

				case "pan":
					instance.initPan();
					break;

				case "transform":
					var objects = instance.canvas.getObjects();

					for ( index = 1; index < objects.length; index ++ )
					{
						objects[ index ].selectable = true;
					}

					instance.canvas.selection = true;
					break;

				case "crop":
					break;

				case "draw":
					instance.initDraw();
					break;

				case "text":
					instance.initText();
					break;

				case "undo":
					instance.undoStep();
					break;

				case "save":
					var old_zoom		= instance.canvas.getZoom();
					var canvas_viewport	= instance.canvas.viewportTransform;
					var old_point		= new fabric.Point( -canvas_viewport[4], -canvas_viewport[5] )

					instance.canvas.setZoom(1);
					instance.canvas.absolutePan( new fabric.Point( 0, 0 ) );

					instance.resetTools();

					var dataURL = instance.canvas.toDataURL({ 
						format	: 'png'
					});

					instance.canvas.setZoom( old_zoom );
					instance.canvas.absolutePan( old_point );

					console.log( dataURL );

					var xmlhttp = new XMLHttpRequest();

					xmlhttp.open("POST","assets/php/save.php",true);
					xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
					xmlhttp.send("image_data="+dataURL);

					break;

				default:
					console.log( _tool );
			}
		};

		/**
		 *  PhotoCanvas.instance.initPan()
		 *
		 * 	Initializes pan tool binding mouse events changing cursor,
		 * 	enables draging entire viewport at once
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 */
		instance.initPan = function()
		{
			instance.canvas.defaultCursor = "url(assets/img/cursor-grab.png), url(assets/img/cursor-grab.cur), move";

			instance.canvas.on("mouse:down", function( evt )
			{
				instance.canvas.defaultCursor = "url(assets/img/cursor-grabbing.png), url(assets/img/cursor-grabbing.cur), move";
				instance.canvas.on("mouse:move", function( evt )
				{ 
					instance.canvas.relativePan( new fabric.Point( evt.e.movementX, evt.e.movementY ) );
				});
			 });

			instance.canvas.on("mouse:up", function( evt )
			{
				instance.canvas.defaultCursor = "url(assets/img/cursor-grab.png), url(assets/img/cursor-grab.cur), move";
				instance.canvas.off("mouse:move");
			});
		};

		/**
		 *  PhotoCanvas.instance.initZoom()
		 *
		 * 	Initializes pan tool binding mouse events changing cursor,
		 * 	enables zooming in and out of viewport with mouse movement
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 */
		instance.initZoom = function()
		{
			instance.canvas.defaultCursor = "url(assets/img/cursor-zoom.png), url(assets/img/cursor-zoom.cur), zoom-in";

			instance.canvas.on("mouse:down", function( evt )
			{
				var center_point = new fabric.Point( ( instance.canvas.width / 2 ), ( instance.canvas.height / 2 ) );
				var absolute_center_point = new fabric.Point( - ( instance.canvas.width * ( 1 - instance.options.zoom.min ) / 2 ), - ( instance.canvas.height * ( 1 - instance.options.zoom.min ) / 2 ) );

				console.log( absolute_center_point );

				instance.canvas.on("mouse:move", function( evt )
				{
					var zoom_delta = evt.e.movementX / 100;

					if ( instance.canvas.getZoom() <= instance.options.zoom.max && instance.canvas.getZoom() >= instance.options.zoom.min )
					{
						instance.canvas.zoomToPoint( center_point, instance.canvas.getZoom() + zoom_delta );
					}
					
					if ( instance.canvas.getZoom() >= instance.options.zoom.max )
					{
						instance.canvas.zoomToPoint( center_point, instance.options.zoom.max );
					}
					else if ( instance.canvas.getZoom() <= instance.options.zoom.min )
					{
						instance.canvas.zoomToPoint( center_point, instance.options.zoom.min );
						instance.canvas.absolutePan( absolute_center_point );
					}
				});
			 });

			instance.canvas.on("mouse:up", function( evt )
			{ 
				instance.canvas.off("mouse:move");
			});
		};

		/**
		 *  PhotoCanvas.initImage()
		 *
		 * 	Initializes open image dialog and alows user to chose one or more files to upload.
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 */
		instance.initImage = function()
		{
			if (event.initMouseEvent)
			{     // all browsers except IE before version 9
				var clickEvent = document.createEvent ("MouseEvent");
				clickEvent.initMouseEvent ("click", true, true, window, 0, 
											event.screenX, event.screenY, event.clientX, event.clientY, 
											event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, 
											0, null);
				instance.dropzone_input.dispatchEvent (clickEvent);
			} 
			else 
			{
				if (document.createEventObject) 
				{   // IE before version 9
					var clickEvent = document.createEventObject (window.event);
					clickEvent.button = 1;  // left button is down
					instance.dropzone_input.fireEvent ("onclick", clickEvent);
				}
			}
		};

		/**
		 *  PhotoCanvas.instance.initDraw()
		 *
		 * 	Initializes pan tool binding mouse events changing cursor,
		 * 	enables drawing path elements on the screen, see path:created
		 * 	canvas event for que rest of the logic
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 */
		instance.initDraw = function()
		{			
			instance.canvas.isDrawingMode = true;
		};

		/**
		 *  PhotoCanvas.instance.initText()
		 *
		 * 	Initializes pan tool binding mouse events changing cursor,
		 * 	creates a new editable text field wherever the user clicks
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 */
		instance.initText = function()
		{
			instance.canvas.defaultCursor = "url(assets/img/cursor-text.png), url(assets/img/cursor-text.cur), text";

			instance.canvas.on("mouse:up", function( evt )
			{
				var text_obj = new fabric.IText( 'Lorem ipsum dolor sit posuere.', {
					top : evt.e.layerY,
					left : evt.e.layerX,
					fontSize : 14
				});

				instance.canvas.add( text_obj );

				text_obj.set( instance.options.controls );
				text_obj.selectable = false;
				text_obj.active = true;
			});
		};

		/**
		 *  PhotoCanvas.instance.undoStep()
		 *
		 * 	Undo last user action
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 */
		instance.undoStep = function()
		{
			instance.resetTools();

			var objects = instance.canvas.getObjects();

			for ( index in objects )
			{
				//TODO : undo logic per object
			}
		}

		instance.addImage = function( _image )
		{
			instance.adding_image ++;

			fabric.Image.fromURL( _image, function( _img_obj )
			{
				_img_obj.set( instance.options.controls );
				_img_obj.selectable = false;

				instance.canvas.add( _img_obj );

				instance.adding_image --;

				if ( instance.adding_image == 0 )
				{
					instance.resetTools();
				}
			});
		};

		instance.adding_image = 0;

		instance.active = true;

		// Cofigure options if exists
		if ( typeof _options === "object" )
		{
			for ( option in _options )
			{
				if ( option == "tools" )
				{
					for ( tool in _options.tools )
					{
						instance.options.tools[ tool ] = _options.tools[ tool ];
					}
				}
				else
				{
					instance.options[ option ] = _options[ option ];
				}
			}
		}

		instance.element = document.getElementById( _canvas );
		instance.options.viewport = { width : instance.element.offsetWidth,height : instance.element.offsetHeight };

		/**
		 *  Tools Initialization
		 */
		
		instance.tools = {};
		
		instance.container	= document.createElement("div");
		instance.container.setAttribute("class", "photo-canvas-container");
		instance.container.setAttribute("style", "width : " + instance.options.viewport.width + "px; height : " + instance.options.viewport.height + "px;");
		
		instance.upload_progress	= document.createElement("div");
		instance.upload_progress.setAttribute("class", "photo-canvas-upload-progress");
		instance.container.appendChild( instance.upload_progress );

		instance.tools.container = document.createElement("div");
		instance.tools.container.setAttribute("class", "photo-canvas-tools-container");

		for( tool in instance.options.tools )
		{
			if ( instance.options.tools[ tool ] )
			{
				instance.tools[ tool ] = document.createElement("div");
				instance.tools[ tool ].setAttribute("class", "photo-canvas-tools photo-canvas-tools-" + tool );
				instance.tools[ tool ].setAttribute("data-canvas-tool", tool );

				instance.tools.container.appendChild( instance.tools[ tool ] );

				instance.tools[ tool ].addEventListener("click", function () { 
					instance.initTool( this );
				});	
			}
		}

		/**
		 * 	Dropzone Initialization
		 */

		instance.dropzone_ovelay	= document.createElement("div");
		instance.dropzone_ovelay.setAttribute("class", "photo-canvas-dropzone disabled");
		instance.container.appendChild( instance.dropzone_ovelay );

		instance.dropzone = new Dropzone( instance.container, { 
			url			: instance.options.url,
			paramName	: _canvas,
			clickable	: true
		} );

		instance.dropzone.on( "dragover", function( _evt ) {
			instance.dropzone_ovelay.setAttribute("class", "photo-canvas-dropzone");
		} );

		instance.dropzone.on( "dragleave", function( _evt ) {
			instance.dropzone_ovelay.setAttribute("class", "photo-canvas-dropzone disabled");
		} );

		instance.dropzone.on( "drop", function( _evt ) {
			instance.dropzone_ovelay.setAttribute("class", "photo-canvas-dropzone disabled");
		} );

		instance.dropzone.on( "totaluploadprogress", function( _progress ) {
			instance.upload_progress.style.display 	= "block";
			instance.upload_progress.style.width 	= _progress + "%";
		} );

		instance.dropzone.on( "success", function( _file, _result ) {
			instance.upload_progress.style.display 	= "none";
			instance.upload_progress.style.width 	= "0%";

			instance.addImage( _result );

			instance.container.removeChild( _file.previewElement );
		} );

		/**
		 *  Fabric Initialization
		 */

		instance.container.appendChild( instance.tools.container );
		instance.container.appendChild( instance.element );

		document.body.appendChild( instance.container );

		instance.dropzone_input = instance.container.previousSibling;

		instance.container.appendChild( instance.dropzone_input );

		instance.canvas  = new fabric.Canvas( _canvas );
		instance.canvas.setDimensions( instance.options.viewport );

		instance.canvas.on( "selection:created", function( _group )
		{
			_group.target.set( instance.options.controls );
		});

		instance.canvas.on( "path:created", function( _path )
		{
			_path.path.set( instance.options.controls );
			_path.path.selectable = false;
		});

		instance.artboard = new fabric.Rect( { 
			top			: -1, 
			left		: -1, 
			width		: instance.options.viewport.width + 1, 
			height		: instance.options.viewport.height + 1, 
			fill		: "#FFFFFF", 
			stroke		: "#333333",
			selectable	: false,
			evented		: false
		} );

		instance.artboard.set( instance.options.controls );

		instance.canvas.add( instance.artboard );

		instance.canvas.renderAll();

		instance.canvas.setZoom(1);

		instance.canvas.selection = false;
		instance.canvas.defaultCursor = "url( assets/img/cursor-default.png ), url( assets/img/cursor-default.cur ), default";
		instance.canvas.freeDrawingCursor = "url( assets/img/cursor-pencil.png ) 0 30, url( assets/img/cursor-pencil.cur ) 0 30, crosshair";
		instance.canvas.hoverCursor = "url( assets/img/cursor-selectable.png ), url( assets/img/cursor-selectable.cur ), move";
		instance.canvas.moveCursor = "url( assets/img/cursor-move.png ), url( assets/img/cursor-move.cur ), move";
		instance.canvas.rotationCursor = "url( assets/img/cursor-rotate.png ) 13 16, url( assets/img/cursor-rotate.cur ) 13 16, crosshair";

		window.addEventListener( "resize", instance.updateCanvas );

		instance.updateCanvas();

		return {

			isActive	: function()
			{
				return instance.active;
			},

			// TODO : review function objectives
			disable : function()
			{
				instance.active = false;
			},

			// TODO : review function objectives
			enable : function()
			{
				instance.active = true;
			},

			destroy : function()
			{
				//TODO : destroy logic
			}

		};
	}

	return {
		
		/**
		 *  PhotoCanvas.create()
		 *
		 * 	Create a PhotoCanvas instance
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 * 	@param 	{String}	_canvas		Id of canvas element to initialize
		 * 	@param 	{Object} 	_options 	Set of options to initialize with the PhotoCanvas
		 * 	@returns {PhtoCanvas.instance}	Returns newly created photocanvas instance
		 * 	@see 	PhotoCanvas.instance.options
		 */
		create : function( _canvas, _options )
		{
			instances.push( initialize( _canvas, _options ) );

			return  instances[ ( instances.length - 1 ) ];
		},

		/**
		 *  PhotoCanvas.getInstance()
		 *
		 * 	Retrieve a PhotoCanvas instance
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 * 	@param 	{Interger}	_index		Id of instance to retrieve
		 * 	@returns {PhtoCanvas.instance}	Returns selected photocanvas instance
		 */
		getInstance : function( _index )
		{
			return instances[ _index ];
		},

		/**
		 *  PhotoCanvas.getAllInstances()
		 *
		 * 	Retrieve all created PhotoCanvas instances
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 * 	@returns 	{Array}		Returns an array with all photocanvas instances that have been initialized
		 */
		getAllInstances : function()
		{
			return instances;
		},

		/**
		 *  PhotoCanvas.destroyInstance()
		 *
		 * 	Destroy a photocanvas instance, returning the canvas to its original state
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 * 	@param 	{Interger}	_index		Id of instance to destroy
		 */
		destroyInstance : function( _index )
		{
			instances[ _index ].destroy();
		},

		/**
		 *  PhotoCanvas.destroyAllInstances()
		 *
		 * 	Destroy all photocanvas instance, returning the respective canvases to its original state
		 *
		 * 	@author Thiago Amerssonis 	<thiago.amerssonis@gmail.com>
		 */
		destroyAllInstances : function()
		{
			for ( index in instances )
			{
				instances[ index ].destroy();
			}
		}
	};

})();