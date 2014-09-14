var app = app || {};


app.SpriteCollection = 
{
	spriteSheets : [],
	spriteLookup : {},
	
	loadSheet : function( spritesheet )
	{
		if( spritesheet in this.spriteLookup )
		{
			return this.spriteLookup[ spritesheet ];
		}
		
		var spriteData = JSON.parse($.ajax({
			type    : "GET",
			url     : spritesheet,
			async: false
			
		}).responseText);
		
		this.extractData(spriteData);
		
		this.spriteLookup[ spritesheet ] = this.spriteSheets.length - 1;
		
		console.log(this.spriteLookup);
		console.log(this.spriteSheets);
		return this.spriteSheets.length - 1;
	},
	
	extractData : function( spriteData )
	{
		var sprite   = { "animations":{}, "frames":[] };
		var numItems = spriteData.animations.length;
		var temp = {};
		
		for ( var i = 0; i < numItems; ++ i )
		{
			temp = spriteData.animations[i];
			sprite.animations[ temp.name ] = temp.frames;
		}
		
		numItems = spriteData.frames.length;
		for ( var i = 0; i < numItems; ++ i )
		{
			temp = spriteData.frames[i];
			sprite.frames.push( temp.spriteSourceSize );
		}	
		
		this.spriteSheets.push( sprite );		
	}
}

app.Sprite = function() 
{
	function Sprite()
	{
		this.frame = 0;
		this.sheet = {}; 
	}
	
	Sprite.prototype = 
	{
		setSpriteSheet: function( sheetName ) 
		{
			app.SpriteCollection.loadSheet( sheetName );
		},
		
		draw : function( this.ctx )
		{
			this.ctx.drawImage(this.spriteSheet,
					this.sprites[this.currentSprite].frame.x, 
					this.sprites[this.currentSprite].frame.y,  
					this.sprites[this.currentSprite].frame.w, 
					this.sprites[this.currentSprite].frame.h, 
					this.x, this.y - this.sprites[this.currentSprite].frame.h,
					this.sprites[this.currentSprite].frame.w, 
					this.sprites[this.currentSprite].frame.h);
		}
		
		
	}
	
	return Sprite;
}();


