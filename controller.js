/* ------------
   controller.js
   
   Defines the controller functionality for audiobytes.
   ------------ */
   
/**
 * The class definition for the audiobytes controller.
 */
function Controller()
{
    // The player the controller is linked to.
    this.player = null;
}

/**
 * The mouse click event which send a jump signal to the player.
 */
Controller.prototype.mouseClick = function()
{
    this.player.queuedInput.push("jump");
};

/**
 * Initializes the controller with the player and begins listing to button inputs.
 * @param player The linkedplayer.
 */
Controller.prototype.init = function(player)
{
    var self = this;
    
    document.addEventListener("click", function(){self.mouseClick()}, false);
    this.player = player;

};