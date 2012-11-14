function Sprite()
{
    this.frame = null;
    this.h = 0;
    this.w = 0;
}

Actor.DEFAULT_ANIMATE_TIME = 150;

function Actor()
{
    this.x = 0;
    this.y = 0;
    
    this.spriteSheet = null;
    this.sprites = [];
    this.animations = [];
    this.currentSprite = 0;
    this.currentFrame = 0;
    this.currentAnimation = 0;
    this.context = null;
    this.gameContext = null;
}

Actor.prototype.draw = function()
{
    if(this.sprites[this.currentSprite])
        this.gameContext.drawImage(this.spriteSheet,
            this.sprites[this.currentSprite].frame.x, 
            this.sprites[this.currentSprite].frame.y,  
            this.sprites[this.currentSprite].frame.w, 
            this.sprites[this.currentSprite].frame.h, 
            this.x, this.y,
            this.sprites[this.currentSprite].frame.w, 
            this.sprites[this.currentSprite].frame.h);
};

Actor.prototype.update = function()
{
    this.currentSprite = this.animations[this.currentAnimation].frames[this.currentFrame];
};

Actor.animate = function(self)
{
    self.currentFrame = (self.currentFrame + 1) % self.animations[self.currentAnimation].frames.length;
    
    
    window.setTimeout(Actor.animate, Actor.DEFAULT_ANIMATE_TIME, self);
};

Actor.initFromFile = function(fileName,screen)
{
    var scratchActor = new Actor();
    var spriteData = JSON.parse($.ajax({
        type    : "GET",
        url     : "spriteSheet.json",
        async: false
        
    }).responseText);
    
    scratchActor.animations = spriteData.animations;
    
    scratchActor.spriteSheet = new Image();
    scratchActor.spriteSheet.onload = function(imageData)
    {
        scratchActor.render(this,spriteData);
    };
    scratchActor.spriteSheet.src = spriteData.meta.image;
    
    scratchActor.gameContext = screen;
    
    //scratchActor.context.drawImage(spriteData.meta.image, 0,0);
    console.log(scratchActor);
        
    return scratchActor;
};

Actor.prototype.render = function(image,data)
{
  console.log(image, data);
  var tempSprite = null;
   
  
  for(var index in data.frames)
  {
    tempSprite = new Sprite();
    
    tempSprite.frame = data.frames[index].frame;
    
    tempSprite.h = data.frames[index].sourceSize.h;
    tempSprite.w = data.frames[index].sourceSize.w;

    this.sprites.push(tempSprite);
  }
  
  window.setTimeout(Actor.animate, Actor.DEFAULT_ANIMATE_TIME, this);
  console.log(this);
};
