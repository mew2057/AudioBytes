function Sprite()
{
    this.image = null;
    this.frame = null;
    this.height = 0;
    this.width = 0;
}

function Actor()
{
    this.x = 0;
    this.y = 0;
    
    this.sprites = [];
    this.animations = [];
    this.context =null;
}

Actor.initFromFile = function(fileName)
{
    var scratchActor = new Actor();
    var spriteData = JSON.parse($.ajax({
        type    : "GET",
        url     : "spriteSheet.json",
        async: false
        
    }).responseText);
    
    scratchActor.animations = spriteData.animations;
    
    var SpriteSheet = new Image();
    SpriteSheet.onload = function(imageData)
    {
        scratchActor.render(this,spriteData);
    };
    SpriteSheet.src = spriteData.meta.image;
    
    
    //scratchActor.context.drawImage(spriteData.meta.image, 0,0);
    console.log(scratchActor);
        
};

Actor.prototype.render = function(image,data)
{
  console.log(image, data);
  
  var canvas =  document.createElement('canvas');
  var tempSprite = null;

  canvas.width = data.meta.size.w;
  canvas.height = data.meta.size.h;
  this.context = canvas.getContext('2d');    
  this.context.drawImage(image,0,0);
  
  
  for(var index in data.frames)
  {
    tempSprite = new Sprite();
    
    tempSprite.frame = data.frames[index].frame;
    
    tempSprite.height = data.frames[index].sourceSize.h;
    tempSprite.width = data.frames[index].sourceSize.w;
    
    /*this.context.getImageData(tempSprite.frame.x, 
        tempSprite.frame.y, 
        tempSprite.frame.width, 
        tempSprite.frame.height);*/
    
    this.sprites.push(tempSprite);
  }
  
  console.log(this);
};
