/* ------------
   audiobytes.js
   
   Uses: sprite.js, controller.js, audio.js
   
   Author: John Dunham
   
   Description: Manages the game state for the game.
   
   Date Modified: 9/13/2014
   ------------ */

// Standard request animation frame callback definition.
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 16);
          };
})();
 
var app = app || {};

app.Audiobytes = 
{
	controller : undefined,
	ctx        : undefined,
    player     : undefined,
	audio      : undefined,
	startY 	   : 0,
	
    init : function()
    {
        console.log("hello world");
		
		this.audio = new app.Audio();
		
		// Sets up the canvas on the screen.
		// TODO allow this canvas to be existent.		
		// Establishes the canvas with an id and a tabindex.
		$('<canvas id="AudioBytesCanvas" tabIndex="0">HTML5 not supported in your' +
			'browser</canvas>').appendTo('body');
		
		//Removes the focus border and ensures the images are crisp regardless of browser.
		$("#AudioBytesCanvas").css({
			"outline":"0",
			"image-rendering": "-moz-crisp-edges",         
            "image-rendering": "-o-crisp-edges",           
            "image-rendering": "-webkit-optimize-contrast",
            "image-rendering": "crisp-edges",              
            "-ms-interpolation-mode": "nearest-neighbor"
		});    
		$("#AudioBytesCanvas").focus();
		
		// TODO nix magic numbers.
		var canvas = document.getElementById("AudioBytesCanvas");
		canvas.width  = 1024;
		canvas.height = 500;
		
		// Set the canvas related variables.
		this.startY   = canvas.height;
		this.ctx      = canvas.getContext("2d");
		
		// Clears the screen.
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
		
		// Sets up a gradient for "heat data".
		this.ctx.drawGradient = this.ctx.createLinearGradient(0,this.ctx.canvas.height,0,0);
		this.ctx.drawGradient.addColorStop(0,'black');
		this.ctx.drawGradient.addColorStop(0.5,'red');

		this.player = new app.Player();// app.Player.initFromFile("spriteSheet.json", this.ctx);
		this.player.initSpriteFromFile( "spriteSheet.json" );
		
		this.controller = new app.Controller();
		this.controller.init( this.player );
		
		//this.update( );
    }, 
    
    update : function( )
    {
		console.log(this);
        // Update stuff
        
        // Draw Stuff
		
		this.ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
		this.player.draw();
		
		window.requestAnimFrame( this.update.bind(this) );
    },
	
	dropFile : function()
	{
	
	}
}