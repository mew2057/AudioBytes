/* ------------
   audiobytes.js
   
   Requires controller.js, sprite.js
   
   Contains the main gameplay code for audiobytes: loading the audio with the 
   webkit audio context, drawing the waveform data and hosting the game loop.   
   
   Of Interest:
     http://airtightinteractive.com/demos/js/reactive/
   This example is what made me realize at least the audio processing in browser 
     was possible and resulted in me pursuing this project.
   ------------ */
 
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

/**
 * The class definition of the Audio Bytes Game state.
 */
function AudioBytes()
{
    this.canvas = null;                 // The HTML5 canvas.
    this.context = null;                // The drawing context for the game.
    this.audioContext = null;           // The audio context for the game.
    this.audioSource = null;            // The source variable that is associated with the context (actaully plays the music).
    this.audioAnalyzer = null;          // Performs the FFT on the audio data (a webkit audio api variable).
    this.audioScratch = null;           // A scratch buffer for audio analyzer data.
    this.domainScratch = null;          // A scratch buffer for domain data that is used in drawing the bars.
    this.drawFunct = this.drawWave;     // A pointer to the currently active drawing function.
    this.actor = null;                  // The playable character in the game.
    this.controller = null;             // The player controller.
    
    this.audioDeque = null;             // A deque for audio data (currently unused)
    this.audioDeque2 = null;            // A deque for audio data (used for frequency data)

}

// The psuedo singleton game object.
AudioBytes._Game = null;

// The horizon of the game.
AudioBytes.startY = 0;

/**
 * The draw function for the game loop.
 */
AudioBytes.prototype.draw = function()
{
    // Clears out the canvas.
    this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
    
    // Invoke the variable draw.
    this.drawFunct();
    
    // Only draw if the actor is present
    if(this.actor)
        this.actor.draw();
};

/**
 * Draws the output of the FFT. Eventually this will be replaced by a procedural generation function.
 */
AudioBytes.prototype.drawWave = function()
{
    this.context.save();
    
    // Draw the horizon.
    
    this.context.beginPath();
    this.context.strokeStyle = "black";

    this.context.moveTo(0,AudioBytes.startY);
    this.context.lineTo(1024, AudioBytes.startY);
    
    this.context.stroke();
    
    // Draw the time domain.

    this.context.fillStyle = "black";
    
    this.context.moveTo(0,this.canvas.height - this.domainScratch[0]);

    for (var cell  = 1, renderPos = 2; cell <  this.domainScratch.length; cell++, renderPos += 4)
    {
        this.context.fillRect(renderPos,this.canvas.height,2 ,-(this.domainScratch[cell]));
    }
    
    // Draw the frequency data
    
    this.context.beginPath();
    
    this.context.strokeStyle = "blue";
    this.context.moveTo(0,AudioBytes.startY - this.audioDeque2[0]);

    for (var cell  = 1, renderPos = 2; cell <  this.audioDeque.length; cell++, renderPos += 4)
    {
        this.context.lineTo(renderPos + 4,AudioBytes.startY - this.audioDeque2[cell]);
    }
    
    this.context.lineTo(renderPos,AudioBytes.startY);
    this.context.stroke();
    
    this.context.restore();
};

/**
 * A convenience function for a hypothetical procedural generation technique. 
 */
AudioBytes.sumArray = function(toSum)
{
    var ret = 0;
    
    for(var index = 0; index < toSum.length; index++)
        ret +=toSum[index];
        
    return ret;
};

/**
 * The update function to be called in the game loop.
 */
AudioBytes.prototype.update = function()
{
    this.audioAnalyzer.getByteTimeDomainData(this.domainScratch);
 
    this.audioAnalyzer.getByteFrequencyData(this.audioScratch);
    this.audioDeque2.shift();
    this.audioDeque2.push(256-this.audioScratch[0]);
    
    if(this.actor)
        this.actor.update();
};

/**
 * The audio bytes game loop.
 */
AudioBytes.gameLoop = function()
{    
    AudioBytes._Game.update();
    AudioBytes._Game.draw();
    
    window.requestAnimFrame(AudioBytes.gameLoop);

};

/**
 * Performs a global collide check for an actor. Right now it only performs a 
 * horizon check and clipping has NOT been fully tested.
 * 
 * @param actor The gameplay element that is being checked for a collision.
 * 
 * @return true if a world collision was found, false if none.
 */
AudioBytes.collides = function(actor)
{
    if(actor.sprites.length > 0)
    {
        if(actor.y <= AudioBytes.startY && actor.y >=  AudioBytes.startY - actor.velocity[1])
        {
            actor.y = AudioBytes.startY;
            return true;
        }
    }
            
    return false;
};

/**
 * Initializes the game.
 */
AudioBytes.init = function()
{
    // Set the psuedo singleton game state
    AudioBytes._Game = new AudioBytes();
    
    // Establish the world collide callback.
    Actor.GAME_WORLD_COLLIDE_CALLBACK = AudioBytes.collides;
    
    // Try to load the audio context, if a failure occurs the game is unplayable.
    try {
        // Set up all the audio data structures.
        AudioBytes._Game.audioContext = new window.webkitAudioContext();
        AudioBytes._Game.audioAnalyzer  = AudioBytes._Game.audioContext.createAnalyser();
        AudioBytes._Game.audioDeque = [];
        AudioBytes._Game.audioDeque2 = [];
        AudioBytes._Game.audioAnalyzer.frequencyBinCount = 256;
        
        // Initialize the deques
        for (var cell = 0; cell < 256; cell ++ )
        {
            AudioBytes._Game.audioDeque.push(128);
            AudioBytes._Game.audioDeque2.push(0);
        }
        
        // Set up the scratch  space for using the audio context analyzer.
        AudioBytes._Game.audioScratch = new Uint8Array(
            AudioBytes._Game.audioAnalyzer.frequencyBinCount);
        
        AudioBytes._Game.domainScratch = new Uint8Array(
            AudioBytes._Game.audioAnalyzer.frequencyBinCount);
        
        // Initialize the scratch.
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

    // Sets up the canvas and drawing context details for the game.
    AudioBytes._Game.canvas = document.getElementById("AudioBytesCanvas");
    AudioBytes._Game.canvas.width = 1020;
    AudioBytes._Game.canvas.height = 500;
    AudioBytes.startY = AudioBytes._Game.canvas.height/2 + AudioBytes._Game.canvas.height/8;

    AudioBytes._Game.context = AudioBytes._Game.canvas.getContext("2d");      
    
    AudioBytes._Game.context.fillStyle="white";
    AudioBytes._Game.context.fillRect(0,0,AudioBytes._Game.canvas.width,AudioBytes._Game.canvas.height);
    
    AudioBytes._Game.context.strokeStyle="blue";
    AudioBytes._Game.context.lineWidth = 2.0;
        

    // Initialize the actor that the user will control.
    AudioBytes._Game.actor = Player.initFromFile("spriteSheet.json",AudioBytes._Game.context);
    AudioBytes._Game.actor.x = 25;
    AudioBytes._Game.actor.y = 200;
    
    // Set up the controller (mouse clicks)
    AudioBytes._Game.controller = new Controller();
    AudioBytes._Game.controller.init(AudioBytes._Game.actor);
    
    // Set up the dragging functionality.
    window.addEventListener("drop",AudioBytes._Game.drop);
    window.addEventListener("dragenter",AudioBytes._Game.dragEnter);
    window.addEventListener("dragover", AudioBytes._Game.dragOver);
    
    // Tell the user what to do.
    alert("Drag an mp3 onto the page.");
    AudioBytes.gameLoop();
};

/**
 * Drag Enter event, at present just stops propagation.
 */
AudioBytes.prototype.dragEnter = function(e)
{
    e.stopPropagation();
    e.preventDefault();
};

/**
 * Drag Over event, at present just stops propagation.
 */
AudioBytes.prototype.dragOver = function(e)
{   
    e.stopPropagation();
    e.preventDefault();
};

/**
 * Drop event, this is where the magic happens.
 * Loads the audio file.
 */
AudioBytes.prototype.drop = function(e)
{
    e.stopPropagation();
    e.preventDefault();

    // Verify the file is valid for the audio context.
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
    };
    
    // Set the animation for the load to the loading bar
    AudioBytes._Game.drawFunct = AudioBytes._Game.drawLoad;
    reader.readAsArrayBuffer(e.dataTransfer.files[0]);
};

/**
 * Kicks off the song after it has been loaded.
 */
AudioBytes.prototype.startSong = function(buffer)
{
    // Stops any audio that is currently playing.
    if(this.audioSource)
    {
        this.audioSource.noteOff(0);
    }
    
    // create a new audio buffer for the song.
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = buffer;
    
    // Connects the analyzer and the context destination to the audio context.
    this.audioSource.connect(this.audioContext.destination);
    this.audioSource.connect(this.audioAnalyzer);    
    
    // Start the song and change the drawing function.
    this.audioSource.noteOn(0);
    AudioBytes._Game.drawFunct = AudioBytes._Game.drawWave;
    
    
    // TODO find a better solution for this.
    width = 0;
};

/**
 * An error callback for load errors.
 */
AudioBytes.prototype.loadError = function()
{
    alert("Your song has failed to decode, I am sorry");  
    
    // reset the draw function.
    AudioBytes._Game.drawFunct = AudioBytes._Game.drawWave;
};

// Width of the loading bar.
var width = 0;

// Draws the loading bar.
AudioBytes.prototype.drawLoad = function()
{
    this.context.save();
    this.context.beginPath();

    this.context.fillStyle = "blue";
    this.context.fillRect(this.canvas.width/2 - width, this.canvas.height/2, width *2,50); 
    this.context.fill();
    width++;
    
    this.context.restore();
};
