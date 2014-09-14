/* ------------
   controller.js
   
   Defines the controller functionality for audiobytes.
   ------------ */
var app = app || {};

app.Controller = function()
{
	/**
	 * The class definition for the audiobytes controller.
	 */
	function Controller()
	{
		// The player the controller is linked to.
		this.player = null;
	}


	Controller.prototype = 
	{
	
		/**
		 * Initializes the controller with the player and begins listing to button inputs.
		 * @param player The linked player.
		 */
		init : function(player)
		{		
			// TODO there must be a better way.
			var self = this;			
			document.addEventListener("click", function(){self.mouseClick()}, false);
			
			this.player = player;
			
			if( navigator.getGamepads() )
			{
				this.connectActiveGamepads();
			}
			
			window.addEventListener("gamepadconnected", this.connectGamepad);
			window.addEventListener("gamepaddisconnected", this.disconnectGamepad);
		},
		
	
		/**
		 * The mouse click event which send a jump signal to the player.
		 */
		mouseClick : function()
		{
			this.player.queuedInput.push("jump");
		},
		
		
		// Module for controller support
		// -----------------------------
		
		connectActiveGamepads : function ( )
		{
			var gamepads = navigator.getGamepads();
			var gamepad  = {};
			
			for( var gid = 0; gid < gamepads.length; ++ gid )
			{
				gamepad = gamepads[ gid ];
				if( gamepad )
				{
					this.connectGamepad( { "gamepad": gamepad } );
				}
			}			
		},
		
		connectGamepad : function( e )
		{
			var gamepad = e.gamepad;
			console.log(gamepad);
		},
		
		disconnectGamepad : function()
		{
			var gamepad = e.gamepad;
			console.log(gamepad.index);
		},
		
		scangamepads : function()
		{
			
		}
		
		// Xbox 360 controller bindings:
		// Buttons:
		// 0  - A
		// 1  - B
		// 2  - X
		// 3  - Y
		// 4  - LB
		// 5  - RB
		// 6  - LT
		// 7  - RT
		// 8  - Select
		// 9  - Start
		// 10 - L Thumb
		// 11 - R Thumb
		// 12 - D-PAD Up
		// 13 - D-PAD Down
		// 14 - D-PAD Left
		// 15 - D-PAD Right
		// 
		
		// ----------------------------------------
	}
	
	return Controller;
}();