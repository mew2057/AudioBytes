var app = app || {};

// ***************************************************************************************
// For the sprite sheet packing I'll be using the bin packing algorithm.
// This is where I learned about the algorithm http://codeincomplete.com/posts/2011/5/7/bin_packing/
app.SpritePacker = function() 
{
	function SpritePacker()
	{
		this.root={x:0,y:0,w:0,h:0};
	}

	SpritePacker.prototype = {
		
		insert:function(w,h) {	
			if(!this.root.used)
			{
				this.root.w = w;
				this.root.h = h;
			}
			
			var node = this.findSpace(this.root, w, h);
			
			if(node)
				return this.prepNode(node, w, h);
			else
				return this.growSheet(w, h);
		},
		
		findSpace:function(node, w, h) {
			if(node.used)
					return this.findSpace(node.down, w, h) || this.findSpace(node.right, w, h);
			else if(node.w >= w && node.h >= h)
				return node;
			else
				return null;
		},
		
		prepNode:function(node, w, h) {
			node.right = { x:node.x + w, y:node.y,     w: node.w - w, h: node.h     };
			node.down  = { x:node.x,     y:node.y + h, w: node.w,     h: node.h - h };
			node.used  = true; 
			return node;
		},

		growSheet:function(w,h) {
			// > 0 down
			// < 0 right
			// == 0 down
			var growthPreference = this.root.w - this.root.h;
			
			// This moves the root up!
			// It's so stupidly elegant >.<
			//   r   ->  r'   Down transform
			//  / \     / \
			// d  ri   d'  r
			//            / \
			//           d  ri
			
			//   r   ->  r'   Right transform
			//  / \     / \
			// d  ri   r   ri'
			//        / \
			//       d  ri
			
			if( growthPreference >= 0)  // Down
				this.root = {
					used  : true,
					x     : 0,
					y     : 0,
					w     : this.root.w,
					h     : this.root.h + h,
					down  : { x:0, y: this.root.h, w: this.root.w, h: h},
					right : this.root
				}			
			else						// Right
				this.root = {
					used  : true,
					x     : 0,
					y     : 0,
					w     : this.root.w + w,
					h     : this.root.h,
					down  : this.root,
					right : { x: this.root.w, y: 0, w: w, h: this.root.h}
				}			
				
			return this.insert(w, h);
		}
	}

	// *****************************************
	// SpriteHeap 
	// XXX There's a -1 showing up somewhere(please look into this stupid).
	// *****************************************

	function SpriteHeap()
	{
		this.heap=[]; // elements are assumed as {key:x, sheets:[]}
		this.size=0;
		
	}

	SpriteHeap.prototype={
		getKey:function(h,w) {
			return Math.max(h,w);
		},
		
		// This implementation is O(log(n))
		insert:function(spriteSheet) {
			var node, key = this.getKey(spriteSheet.img.height, spriteSheet.img.width);
			
			if(node = this.findNode(key))
			{
				node.sheets.push(spriteSheet);
			}
			else
			{
				this.heap.push({key:key, sheets:[spriteSheet]});
				this.trickleUp(this.size);
				this.size++;
			}
			
		},
		
		trickleUp:function(index){
			if(index!==0 && this.heap[index].key > this.heap[~~((index-1)/2)].key)
			{
				var tempNode = this.heap[index];
				this.heap[index] = this.heap[~~((index-1)/2)];
				this.heap[~~((index-1)/2)] = tempNode;
				
				this.trickleUp(~~((index-1)/2));
			}
		},
		
		trickleDown:function(index)	{
			if(this.size > 2 * index + 1)
			{
				var largestChild = 2 * index + 1;
				
				if(this.heap[largestChild].key < this.heap[largestChild+1].key)
					largestChild++;
					
				if(this.heap[index].key < this.heap[largestChild].key)
				{
					var tempNode = this.heap[index];
					
					this.heap[index] = this.heap[largestChild];
					this.heap[largestChild] = tempNode;
					
					this.trickleDown(largestChild);			
				}
			}
		},
		
		remove:function() {
			var head = this.heap[0].sheets;
			this.heap[0] = this.heap[--this.size];
			this.heap[this.size]={};
			
			this.trickleDown(0);
			
			return head;
		},
		
		findNode:function(key){
			var node = null;
			for (var i in this.heap)
			{
				if(this.heap[i].key === key)
				{
					node = this.heap[i];
					break;
				}
			}
			return node;
		}
	}
	
	return SpritePacker;
}();


app.SpriteCollection = 
{
	spriteSheets : [],
	spriteLookup : {},
	spritePacker : new app.SpritePacker(),
	
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
		
		var sheetID = this.spriteSheets.length - 1;
		
		this.spriteLookup[ spritesheet ] = sheetID

		return sheetID;
	},
	
	extractData : function( spriteData )
	{
		var sheet   = { "animations":{}, "frames":[] };
		var numItems = spriteData.animations.length;
		var temp = {};
		
		for ( var i = 0; i < numItems; ++ i )
		{
			temp = spriteData.animations[i];
			sheet.animations[ temp.name ] = temp.frames;
		}
		
		numItems = spriteData.frames.length;
		for ( var i = 0; i < numItems; ++ i )
		{
			temp = spriteData.frames[i];
			sheet.frames.push( temp.spriteSourceSize );
		}
		
		// Packs the sheet for use later.
		this.packSheet( spriteData.meta, sheet );
		
		this.spriteSheets.push( sheet );		
	},
	
	packSheet : function ( meta, sheet )
	{
		console.log(meta, sheet);
		this.spritePacker.insert( meta.size.w, meta.size.h );
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
		
		draw : function( ctx )
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




