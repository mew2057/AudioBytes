var app = app || {};

app.Player = function()
{
	
	function Player()
	{
		this.sprite  = new app.Sprite();
		//this.physics = new app.PhysicsBody();
		
		this.draw = this.sprite.draw;
	}
	
	
	Player.prototype = 
	{
	
		initSpriteFromFile : function( uri )
		{
			this.sprite.setSpriteSheet( uri );
		},
		
		draw : function( ctx )
		{			
			
		}
	}
	
	return Player;
	
}();