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
	context    : undefined,
    player     : undefined,
	audio      : undefined,
	
    init : function()
    {
        console.log("hello world");
		
		this.audio = new app.Audio();
		
		//this.context;

		this.player = app.Player.initFromFile("../sprites/spriteSheet.json", this.context);
		
		
		this.controller = new app.Controller();
		this.controller.init(this.player);
    },
    
    update : function()
    {
        // Update stuff
        
        // Draw Stuff
    }
}