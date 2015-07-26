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
	 *  Initialize
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
				//rect		: true,
				//circle	: true,
				draw		: true,
				text		: true,
				//filters	: true,
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
			}

		};

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
					initTool( instance, this );
				});	
			}
			
		}

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

		instance.dropzone.on( "uploadprogress", function( _file, _progress ) {
			instance.upload_progress.style.display 	= "block";
			instance.upload_progress.style.width 	= _progress + "%";
		} );

		instance.dropzone.on( "success", function( _file, _result ) {
			instance.upload_progress.style.display 	= "none";
			instance.upload_progress.style.width 	= "0%";

			addImage( instance, _result );

			instance.container.removeChild( _file.previewElement );
		} );

		instance.container.appendChild( instance.tools.container );
		instance.container.appendChild( instance.element );

		document.body.appendChild( instance.container );

		instance.dropzone_input = instance.container.previousSibling;

		instance.container.appendChild( instance.dropzone_input );

		instance.canvas  = new fabric.Canvas( _canvas );
		instance.canvas.setDimensions( instance.options.viewport );

		instance.artboard = new fabric.Rect( { 
			top			: 0, 
			left		: 0, 
			width		: instance.options.viewport.width, 
			height		: instance.options.viewport.height, 
			fill		: "#FFFFFF", 
			stroke		: "#333333",
			selectable	: false,
			evented		: false
		} );

		instance.canvas.add( instance.artboard );

		instance.canvas.renderAll();

		instance.canvas.setZoom(1);

		instance.canvas.selection = false;
		instance.canvas.defaultCursor = "url( assets/img/cursor-default.png ), url( assets/img/cursor-default.cur ), default";
		instance.canvas.freeDrawingCursor = "url( assets/img/cursor-pencil.png ), url( assets/img/cursor-pencil.cur ), crosshair";
		instance.canvas.hoverCursor = "url( assets/img/cursor-selectable.png ), url( assets/img/cursor-selectable.cur ), move";
		instance.canvas.moveCursor = "url( assets/img/cursor-move.png ), url( assets/img/cursor-move.cur ), move";
		instance.canvas.rotationCursor = "url( assets/img/cursor-rotate.png ) 13 16, url( assets/img/cursor-rotate.cur ) 13 16, crosshair";

		window.addEventListener( "resize", function() { updateCanvas( instance ); } );

		updateCanvas();

		return {

			isActive	: function()
			{
				return instance.active;
			},

			disable : function()
			{
				console.log( "disable" );
				instance.active = false;
			},

			enable : function()
			{
				console.log( "disable" );
				instance.active = true;
			},

			destroy : function()
			{
				console.log( "hideControls" );
			}

		};
	}

	function updateCanvas( _target )
	{
		console.log( _target );
	}

	function resetTools( _target )
	{
		for ( tool in _target.options.tools )
		{
			_target.tools[tool].setAttribute("class", "photo-canvas-tools photo-canvas-tools-" + tool );
		}

		_target.canvas.deactivateAllWithDispatch();
		_target.canvas.selection		= false;
		_target.canvas.defaultCursor	= "url( assets/img/cursor-default.png ), url( assets/img/cursor-default.cur ), default";
		_target.canvas.off("mouse:move");
		_target.canvas.off("mouse:up");
		_target.canvas.off("mouse:down");
		_target.canvas.renderAll();
	}

	function initTool( _target, _tool )
	{
		console.log( _target );
		console.log( _tool );
		resetTools( _target );
		_tool.setAttribute("class", _tool.getAttribute("class") + " active" );
		
		switch( _tool.getAttribute("data-canvas-tool") )
		{
			case "image":
				console.log( "case image" );
				initImage( _target );
				break;

			case "zoom":
				initZoom( _target );
				break;

			case "pan":
				initPan( _target );
				break;

			case "transform":
				_target.canvas.selection = true;
				break;

			case "save":
				_target.canvas.setZoom(1);
				_target.canvas.absolutePan( new fabric.Point( 0, 0 ) );
				resetTools( _target );
				break;

			default:
				console.log( _tool );
		}
	}

	function initPan( _target )
	{
		_target.canvas.defaultCursor = "url(assets/img/cursor-grab.png), url(assets/img/cursor-grab.cur), move";

		_target.canvas.on("mouse:down", function( evt )
		{
			_target.canvas.defaultCursor = "url(assets/img/cursor-grabbing.png), url(assets/img/cursor-grabbing.cur), move";
			_target.canvas.on("mouse:move", function( evt )
			{ 
				_target.canvas.relativePan( new fabric.Point( evt.e.movementX, evt.e.movementY ) );
			});
		 });

		_target.canvas.on("mouse:up", function( evt )
		{
			_target.canvas.defaultCursor = "url(assets/img/cursor-grab.png), url(assets/img/cursor-grab.cur), move";
			_target.canvas.off("mouse:move");
		});
	}

	function initZoom( _target )
	{
		_target.canvas.defaultCursor = "url(assets/img/cursor-zoom.png), url(assets/img/cursor-zoom.cur), zoom-in";

		_target.canvas.on("mouse:down", function( evt )
		{
			var center_point = new fabric.Point( ( _target.canvas.width / 2 ), ( _target.canvas.height / 2 ) );

			_target.canvas.on("mouse:move", function( evt )
			{
				var zoom_delta = evt.e.movementX / 100;

				if ( _target.canvas.getZoom() <= _target.options.zoom.max && _target.canvas.getZoom() >= _target.options.zoom.min )
				{
					_target.canvas.zoomToPoint( center_point, _target.canvas.getZoom() + zoom_delta );
				}
				
				if ( _target.canvas.getZoom() >= _target.options.zoom.max )
				{
					_target.canvas.zoomToPoint( center_point, _target.options.zoom.max );
				}
				else if ( _target.canvas.getZoom() <= _target.options.zoom.min )
				{
					_target.canvas.zoomToPoint( center_point, _target.options.zoom.min );
				}
			});
		 });

		_target.canvas.on("mouse:up", function( evt )
		{ 
			_target.canvas.off("mouse:move");
		});
	}

	function initImage( _target )
	{
		console.log( _target.dropzone_input );

		if (event.initMouseEvent)
		{     // all browsers except IE before version 9
			var clickEvent = document.createEvent ("MouseEvent");
			clickEvent.initMouseEvent ("click", true, true, window, 0, 
										event.screenX, event.screenY, event.clientX, event.clientY, 
										event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, 
										0, null);
			_target.dropzone_input.dispatchEvent (clickEvent);
		} 
		else 
		{
			if (document.createEventObject) 
			{   // IE before version 9
				var clickEvent = document.createEventObject (window.event);
				clickEvent.button = 1;  // left button is down
				_target.dropzone_input.fireEvent ("onclick", clickEvent);
			}
		}
	}

	function addImage( _target, _image )
	{
		console.log("addImage");
		fabric.Image.fromURL( _image, function( _img_obj )
		{
			_target.canvas.add( _img_obj );
		});

		_target.dropzone_input

		resetTools( _target );
	}

	return {
		
		create : function( _canvas, _options )
		{
			instances.push( initialize( _canvas, _options ) );

			return  instances[ ( instances.length - 1 ) ];
		},

		getInstance : function( _index )
		{
			return instances[ _index ];
		},

		getAllInstances : function()
		{
			return instances;
		},

		destroyInstance : function( _index )
		{
			instances[ _index ].destroy();
		},

		destroyAllInstances : function()
		{
			for ( index in instances )
			{
				instances[ index ].destroy();
			}
		}
	};

})();