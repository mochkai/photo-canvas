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
			url			: "upload.php",
			theme		: "default",
			artboard	: 
			{
				width	: null,
				height	: null
			},
			tools		:
			{
				artboard	: true,
				crop		: true,
				image		: true,
				filters		: true,
				transform	: true,
				text		: true,
				draw		: true
			}

		};

		instance.visible = true;

		// Cofigure options if exists

		if ( typeof _options === "object" )
		{
			for ( option in _options )
			{
				if ( option == "tools" )
				{
					for ( tool in _options.tools )
					{
						options.tools[ tool ] = _options.tools[ tool ];
					}
				}
				else
				{
					options[ option ] = _options[ option ];
				}
			}
		}

		instance.element = document.getElementById( _canvas );

		instance.destroy =  function()
		{
			console.log( "destroy logic : " + instance );
		};

		return instance;
	}

	return {
		
		newInstance : function( _canvas, _options )
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