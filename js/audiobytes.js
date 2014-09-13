/* ------------
   audiobytes.js
   
   Assumes:
   
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

app.audiobytes = 
{
    
    init : function()
    {
        console.log("hello world");
    },
    
    update : function()
    {
        // Update stuff
        
        // Draw Stuff
    }
}