/**
 * Of Interest:
 *  http://airtightinteractive.com/demos/js/reactive/
 */
 
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 100);
          };
})();
 
function AudioBytes()
{
    this.canvas = null;
    this.context = null;
    this.audioContext = null;
    this.newAudioQueued = false;
    this.audioSource = null;
    this.audioAnalyzer = null;
    this.audioScratch = null;
    this.audioScratchIndex = 0;
    this.audioDeque = null;
    this.isLoading = false;
    this.drawFunct = this.drawWave;
    this.actor = null;
    this.controller = null;
}

AudioBytes._Game = null;
AudioBytes.startY = 0;

AudioBytes.prototype.draw = function()
{
    this.context.fillRect(0,0,this.canvas.width,this.canvas.height);

    this.context.save();

    this.context.globalCompositeOperation = 'darker';

    this.context.fillStyle = '#09f000';
    this.context.fillRect(this.canvas.width - 50,0,50, this.canvas.height);
    
    this.drawFunct();
    if(this.actor)
        this.actor.draw();
    this.context.restore();
};

AudioBytes.prototype.drawWave = function()
{
    
    this.context.beginPath();

    this.context.moveTo(0,AudioBytes.startY + this.audioDeque[0] - 128);
    
    for (var cell  = 1, renderPos = 2; cell <  this.audioDeque.length; cell++, renderPos += 4)
    {
        this.context.moveTo(renderPos, AudioBytes.startY + this.audioDeque[cell] - 128);
        this.context.lineTo(renderPos +4,AudioBytes.startY + this.audioDeque[cell] - 128);
    }
    this.context.lineTo(renderPos,AudioBytes.startY);
    this.context.stroke();
};

AudioBytes.prototype.update = function()
{
    /*if(this.audioScratchIndex >= this.audioScratch.length || isNaN(this.audioScratch[0]))
    {
        this.audioAnalyzer.getByteTimeDomainData(this.audioScratch);
        this.audioScratchIndex = 0;
    }*/
    
    this.audioAnalyzer.getByteTimeDomainData(this.audioScratch);

    // Make this dynamic based on the current frequency?
    this.audioDeque.shift();
    this.audioDeque.push(this.audioScratch[0]);
//    this.audioAnalyzer.getByteFrequencyData(this.audioScratch);
    if(this.actor)
        this.actor.update();
};

//Philosophically only one gameloop.
AudioBytes.gameLoop = function()
{    
    AudioBytes._Game.update();

    AudioBytes._Game.draw();
    
    window.requestAnimFrame(AudioBytes.gameLoop);

};

// does a super basic check (This is wicked inaccurate!).
AudioBytes.collides = function(actor)
{
    if(actor.sprites.length > 0)
        for(var index = actor.x; index < actor.x + actor.sprites[actor.currentSprite].w ; index++)
        {
            if(AudioBytes._Game.audioDeque[index] <= actor.y - AudioBytes.startY + 128 && 
                AudioBytes._Game.audioDeque[index] >= actor.y - AudioBytes.startY + 128  - actor.velocity[1])
            {
                actor.y = AudioBytes._Game.audioDeque[index] + AudioBytes.startY - 128;
                return true;
            }
        }
            
    return false;
};

AudioBytes.init = function()
{
    AudioBytes._Game = new AudioBytes();
    Actor.GAME_WORLD_COLLIDE_CALLBACK = AudioBytes.collides;
    
    try {
        AudioBytes._Game.audioContext = new window.webkitAudioContext();
        AudioBytes._Game.audioAnalyzer  = AudioBytes._Game.audioContext.createAnalyser();
        AudioBytes._Game.audioDeque = [];
                
        for (var cell = 0; cell < AudioBytes._Game.audioAnalyzer.frequencyBinCount/4; 
            cell ++ )
        {
            AudioBytes._Game.audioDeque.push(128);
        }
        
        AudioBytes._Game.audioScratch = new Uint8Array(
            AudioBytes._Game.audioAnalyzer.frequencyBinCount);
                
        AudioBytes._Game.audioAnalyzer.getByteTimeDomainData(
            AudioBytes._Game.audioScratch);

    }
    catch(e) {
        alert('Web Audio API is not supported in this browser');
    }
    
    // Establishes the canvas with an id and a tabindex.
    $('<canvas id="AudioBytesCanvas" tabIndex="0">HTML5 not supported in your' +
        'browser</canvas>').appendTo('body');
    
    //Removes the focus border.
    $("#AudioBytesCanvas").css({
        "outline":"0",
        "image-rendering":"-webkit-optimize-contrast"
    });    
    $("#AudioBytesCanvas").focus();
    
    //Uses FileReader, Audio API,Session Storage

    AudioBytes._Game.newAudioQueued = false;

    // Sets up the canvas and drawing context details for the game.
    AudioBytes._Game.canvas = document.getElementById("AudioBytesCanvas");
    AudioBytes._Game.canvas.width = 1020;
    AudioBytes._Game.canvas.height = 500;
    AudioBytes.startY = AudioBytes._Game.canvas.height/2;

    AudioBytes._Game.context = AudioBytes._Game.canvas.getContext("2d");      
    
    AudioBytes._Game.context.fillStyle="white";
    AudioBytes._Game.context.fillRect(0,0,AudioBytes._Game.canvas.width,AudioBytes._Game.canvas.height);
    
    AudioBytes._Game.context.strokeStyle="blue";
    AudioBytes._Game.context.lineWidth = 2.0;
        

    AudioBytes._Game.actor = Player.initFromFile("spriteSheet.json",AudioBytes._Game.context);
    AudioBytes._Game.actor.x = 25;
    AudioBytes._Game.actor.y = 200;
    
    AudioBytes._Game.controller = new Controller();
    AudioBytes._Game.controller.init(AudioBytes._Game.actor);
    
    window.addEventListener("drop",AudioBytes._Game.drop);
    window.addEventListener("dragenter",AudioBytes._Game.dragEnter);
    window.addEventListener("dragover", AudioBytes._Game.dragOver);
    
    alert("Drag an mp3 onto the page.");
    AudioBytes.gameLoop();
};

AudioBytes.prototype.dragEnter = function(e)
{
    e.stopPropagation();
    e.preventDefault();
};

AudioBytes.prototype.dragOver = function(e)
{   
    e.stopPropagation();
    e.preventDefault();
};

AudioBytes.prototype.drop = function(e)
{
    e.stopPropagation();
    e.preventDefault();

    if(e.dataTransfer.files[0].type != "audio/mp3")
    {
        alert("Invalid file type, only mp3 files are currently supported!");   
        return false;
    }
    var reader = new FileReader();

    reader.onload = function(event)
    {     
        AudioBytes._Game.audioContext.decodeAudioData(event.target.result, function(buffer) {
            AudioBytes._Game.startSong(buffer);
        }, AudioBytes._Game.loadError);
        
        //Add an animation drawer here in the end game, to give the user feedback.
    };
    
    AudioBytes._Game.drawFunct = AudioBytes._Game.drawLoad;
    console.log(e.dataTransfer.files[0]);
    reader.readAsArrayBuffer(e.dataTransfer.files[0]);
};

AudioBytes.prototype.startSong = function(buffer)
{
    if(this.audioSource)
    {
        this.audioSource.noteOff(0);
    }
    
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = buffer;
    this.audioSource.connect(this.audioContext.destination);
    this.audioSource.connect(this.audioAnalyzer);    
    
    this.audioSource.noteOn(0);
    this.audioScratchIndex = this.audioScratch.length;
    AudioBytes._Game.drawFunct = AudioBytes._Game.drawWave;
    };

AudioBytes.prototype.loadError = function()
{
    alert("Your song has failed to decode, I am sorry");  
    this.isLoading = false;
    AudioBytes._Game.drawFunct = AudioBytes._Game.drawWave;

};

var width = 0;
AudioBytes.prototype.drawLoad = function()
{
    this.context.save();
    this.context.beginPath();

    this.context.fillStyle = "blue";
    this.context.fillRect(this.canvas.width/2 - width, this.canvas.height/2, width *2,50); 
    this.context.fill();
    width = (width+1);
    this.context.restore();
};
