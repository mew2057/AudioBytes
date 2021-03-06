/* ------------
   sprite.js
   
   Defines how sprites are to be processed for the audiobytes game. Sprites are
   are generated by initializing a sprite object with the file name pointing to
   a json definition of a sprite sheet. I use a modification of the texture packer
   sprite sheet.
   
   Additionally this defines Actors (animatable characters) and Players (player controlled characters).
  
   ------------ */


/**
 * The sprite class definition, effectively a struct.
 */
function Sprite()
{
    this.frame = null;
    this.h = 0;
    this.w = 0;
}

// Animation and physics constants.
Actor.DEFAULT_ANIMATE_TIME = 10;
Actor.DEFAULT_GRAVITY = 0.5;

// The function pointer for world collision detection.
Actor.GAME_WORLD_COLLIDE_CALLBACK = null;


/**
 * The Actor class definition.
 */
function Actor()
{
    // The position of the actor, 
    this.x = 0;
    this.y = 0;
    
    // The actor's motion attributes
    this.velocity = [0,0];
    this.acceleration = [0,0];
    
    // Visual details
    this.spriteSheet = null;
    this.sprites = [];
    this.currentSprite = 0;
    
    // HTML5 details
    this.gameContext = null;
    
    // Animation details
    this.animations = [];
    this.currentFrame = 0;
    this.currentAnimation = 0;
    this.animationCounter = 0;
    this.animationTime = Actor.DEFAULT_ANIMATE_TIME;
}

/**
 * The drawing function that draws the actor's associated sprite.
 */
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

/**
 * The update function that invokes animation and physics routines for the actor's sprite as needed.
 */
Actor.prototype.update = function()
{
    if(++this.animationCounter === this.animationTime)
        this.animate();
        
    this.doPhysics();
};

/**
 * Does basic physics, not much else to say.
 */
Actor.prototype.doPhysics = function()
{
    // If the actor is acclerating on the y axis in the positive direction
    // Increment the velocitcy accordingly and remove the acceleration as it can't accelerate anymore.
    if(this.acceleration[1] < 0)
    {
        this.velocity[1] += this.acceleration[1];
        this.acceleration[1] = 0;
    }    
    // Else check for a collision and modify the velocity accordingly.
    else
    {        
        // Collisions are hard stops.
        if(Actor.checkCollide(this))
        {
            this.acceleration[1] = 0;   
            this.velocity[1] = 0;       
        }
        else
        {
            // Sets the acceleration to the default gravity to emulate acceleration due to gravity.
            this.acceleration[1] = Actor.DEFAULT_GRAVITY;
        }
    }
    
    // Update the x and y based on the velocities.
    this.x += this.velocity[0];
    this.y += this.velocity[1];
    
    // Update the velocity components based on the acceleration components.
    this.velocity[0] += this.acceleration[0];
    this.velocity[1] += this.acceleration[1];
    
};

/**
 * Checks collisions with other actors or the world.
 * If only the first actor is defined a world check is made. If both are defined
 * perform a check between the two.
 * 
 * @param actor1 The first actor to check for collision (the only for world detection)
 * 
 * @param actor2 {Optional} The secondary actor to test for collsion.
 * 
 * @return True if a collision was detected based on the inputs.
 */
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

/**
 * Performs an animation update based on the currently selected animation.
 * 
 */
Actor.prototype.animate = function()
{
    this.currentFrame = (this.currentFrame + 1) % this.animations[this.currentAnimation].frames.length;
    this.currentSprite = this.animations[this.currentAnimation].frames[this.currentFrame];
    this.animationCounter = 0;

};

/**
 * The initializer for the Actor class.
 * 
 * @param fileName The name of the sprite sheet json file for the actor.
 * @param screen The HTML5 canvas context.
 * @param object {Optional} A pre allocated actor.
 * 
 * @return A fully initialized actor.
 */
Actor.initFromFile = function(fileName,screen,object)
{
    // Get the base actor data from the json with an ajax request.
    var scratchActor = object ? object : new Actor();
    var spriteData = JSON.parse($.ajax({
        type    : "GET",
        url     : fileName,
        async: false
        
    }).responseText);
    
    // Set animations
    scratchActor.animations = spriteData.animations;
    
    // Set up the image data
    scratchActor.spriteSheet = new Image();
    scratchActor.spriteSheet.onload = function(imageData)
    {
        scratchActor.render(this,spriteData);
    };
    scratchActor.spriteSheet.src = spriteData.meta.image;
    
    // Link the screen to the actor.
    scratchActor.gameContext = screen;
    
    // Begin animating the actor.
    scratchActor.animate();
        
    return scratchActor;
};

/**
 * Primes the actor for animations.
 * 
 * @param image The Image object that has the sprite sheet.
 * @param data The sprite data that defines frame locations on the sheet.
 */
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
};

/**
 * Sets the current animation for the actor if the supplied animationName is found.
 * 
 * @param animationName The name of the new animation.
 */ 
Actor.prototype.setAnimation = function(animationName)
{
    for(var index in this.animations)
    {
        //If the index is a match leave the loop with the index of the animation.
        if(this.animations[index].name === animationName)
            break;
    }
    
    // Swap the animation if the animation index doesn't match
    if(this.currentAnimation !== index)
    {
        this.currentAnimation = index;    
        this.animate();
    }
};

// Define the player as a sub class of Actor.
Player.prototype = new Actor();

/**
 * The Player class definition.
 */
function Player()
{
    // The input queue.
    this.queuedInput = [];
    
    // Allows me to reuse the actor update code.
    this.super_update = Actor.prototype.update;
}

/**
 * The overriden update function for the player. Handles player input, invokes 
 * the actor update and performs animation changes as needed.
 */
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

/**
 * Overrides the initFromFile function to allow it to produce an object of the player class.
 * 
 * @param fileName The name of the sprite sheet json file for the actor.
 * @param screen The HTML5 canvas context.
 * 
 * @return A new Player.
 */
Player.initFromFile = function (fileName,screen)
{
    var scratchPlayer = new Player();
    
    scratchPlayer = Actor.initFromFile(fileName, screen, scratchPlayer);
    
    return scratchPlayer;
};

/**
 * Handles any queued inputs that the player may have logged.
 */
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
