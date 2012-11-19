
function Controller()
{
    this.player = null;
}

Controller.prototype.mouseClick = function()
{
    this.player.queuedInput.push("jump");
};

Controller.prototype.init = function(player)
{
    var self = this;
    
    document.addEventListener("click", function(){self.mouseClick()}, false);
    this.player = player;

};