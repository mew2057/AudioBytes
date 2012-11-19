function Sprite()
{
    this.frame = null;
    this.h = 0;
    this.w = 0;
}

Actor.DEFAULT_ANIMATE_TIME = 10;
Actor.DEFAULT_GRAVITY = 0.5;
Actor.GAME_WORLD_COLLIDE_CALLBACK = null;


function Actor()
{
    this.x = 0;
    this.y = 0;
    this.velocity = [0,0];
    this.acceleration = [0,0];
    
    this.spriteSheet = null;
    this.sprites = [];
    this.animations = [];
    this.currentSprite = 0;
    this.currentFrame = 0;
    this.currentAnimation = 0;
    this.context = null;
    this.gameContext = null;
    this.animationCounter = 0;
    this.animationTime = Actor.DEFAULT_ANIMATE_TIME;
}

Actor.prototype.draw = function()
{
    if(this.sprites[this.currentSprite])
        this.gameContext.drawImage(this.spriteSheet,
            this.sprites[this.currentSprite].frame.x, 
            this.sprites[this.currentSprite].frame.y,  
            this.sprites[this.currentSprite].frame.w, 
            this.sprites[this.currentSprite].frame.h, 
            this.x, this.y - this.sprites[this.currentSprite].frame.h,
            this.sprites[this.currentSprite].frame.w, 
            this.sprites[this.currentSprite].frame.h);
};

Actor.prototype.update = function()
{
    // TODO implement a timer for this to be consistent
    if(++this.animationCounter === this.animationTime)
        this.animate();
        
    this.doPhysics();
};

Actor.prototype.doPhysics = function()
{
    if(this.acceleration[1] < 0)
    {
        this.velocity[1] += this.acceleration[1];
        this.acceleration[1] = 0;
    }
    else
    {        
        if(Actor.checkCollide(this))
        {
            this.acceleration[1] = 0;   
            this.velocity[1] = 0;       
        }
        else
        {
           this.acceleration[1] = Actor.DEFAULT_GRAVITY;
        }
    }
    
    
    this.x += this.velocity[0];
    this.y += this.velocity[1];
    
    this.velocity[0] += this.acceleration[0];
    this.velocity[1] += this.acceleration[1];
    
};

Actor.checkCollide = function(actor1, actor2)
{
    if(!actor2)
    {
        return Actor.GAME_WORLD_COLLIDE_CALLBACK(actor1);
    }
    else
    {
        return actor2.x > actor1.x && actor2.y < actor1.y && 
                actor2.x < (actor1.x + actor1.sprites[actor1.currentSprite].w) &&
                actor2.y > (actor1.y - actor1.sprites[actor1.currentSprite].h);
    }
};

Actor.prototype.animate = function()
{
    this.currentFrame = (this.currentFrame + 1) % this.animations[this.currentAnimation].frames.length;
    this.currentSprite = this.animations[this.currentAnimation].frames[this.currentFrame];
    this.animationCounter = 0;

};

Actor.initFromFile = function(fileName,screen,object)
{
    var scratchActor = object ? object : new Actor();
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
    
    scratchActor.animate();
        
    return scratchActor;
};

Actor.prototype.render = function(image,data)
{
  var tempSprite = null;
   
  
  for(var index in data.frames)
  {
    tempSprite = new Sprite();
    
    tempSprite.frame = data.frames[index].frame;
    
    tempSprite.h = data.frames[index].sourceSize.h;
    tempSprite.w = data.frames[index].sourceSize.w;

    this.sprites.push(tempSprite);
  }
  
  console.log(this);
};

Actor.prototype.setAnimation = function(animationName)
{
    for(var index in this.animations)
    {
        if(this.animations[index].name === animationName)
            break;
    }
    
    if(this.currentAnimation !== index)
    {
        this.currentAnimation = index;    
        this.animate();
    }
};

Player.prototype = new Actor();
function Player()
{
    this.queuedInput = [];
    
    // Allows me to reuse the actor update code.
    this.super_update = Actor.prototype.update;
}

Player.prototype.update =  function()
{
    if(this.queuedInput.length > 0)
        this.handleInput();
        
    this.super_update();
    
    if(this.velocity[1] === 0 && this.acceleration[1] === 0)
    {
        this.setAnimation("run");
    }
    else
    {
        this.setAnimation("jump");
    }
    
};

Player.initFromFile = function (fileName,screen)
{
    var scratchPlayer = new Player();
    
    scratchPlayer = Actor.initFromFile(fileName, screen, scratchPlayer);
    
    return scratchPlayer;
};

Player.prototype.handleInput = function()
{
    switch(this.queuedInput.pop())
    {
        case "jump":
            if(this.velocity[1] === 0)
            {
                this.acceleration[1] = -12;
            }
            break;
        default:
            break;
    }
};