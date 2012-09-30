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
            window.setTimeout(callback, 20);
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
}

AudioBytes._Game = null;
AudioBytes.startY = 0;

AudioBytes.prototype.draw = function()
{
    this.context.fillRect(0,0,this.canvas.width,this.canvas.height);

    this.drawWave();

};

AudioBytes.prototype.drawWave = function()
{
    this.context.beginPath();

    this.context.moveTo(0,AudioBytes.startY + this.audioDeque[0] - 128);

    for (var cell  = 1, renderPos = 2; cell <  this.audioDeque.length; cell++, renderPos +=4)
    {
        this.context.lineTo(renderPos,AudioBytes.startY + this.audioDeque[cell] - 128);
    }
    this.context.lineTo(renderPos,AudioBytes.startY);
    this.context.stroke();
};

AudioBytes.prototype.update = function()
{
    /*
    if(this.audioScratchIndex >= this.audioScratch.length || isNaN(this.audioScratch[0]))
    {
        this.audioAnalyzer.getByteTimeDomainData(this.audioScratch);
        this.audioScratchIndex = 0;
    }*/
            this.audioAnalyzer.getByteTimeDomainData(this.audioScratch);

    this.audioDeque.shift();
    this.audioDeque.push(this.audioScratch[this.audioScratchIndex]);
};

//Philosophically only one gameloop.
AudioBytes.gameLoop = function()
{
    
    AudioBytes._Game.update();

    AudioBytes._Game.draw();
    
    window.requestAnimFrame(AudioBytes.gameLoop);

};

AudioBytes.init = function()
{
    AudioBytes._Game = new AudioBytes();
    
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
            1);
                
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
    $("#AudioBytesCanvas").css("outline","0");    
    $("#AudioBytesCanvas").focus();
    
    //Uses FileReader, Audio API,Session Storage

    AudioBytes._Game.newAudioQueued = false;

    // Sets up the canvas and drawing context details for the game.
    AudioBytes._Game.canvas = document.getElementById("AudioBytesCanvas");
    AudioBytes._Game.canvas.width = 1024;
    AudioBytes._Game.canvas.height = 500;
    AudioBytes.startY = AudioBytes._Game.canvas.height/2;

    AudioBytes._Game.context = AudioBytes._Game.canvas.getContext("2d");      
    
    AudioBytes._Game.context.fillStyle="white";
    AudioBytes._Game.context.fillRect(0,0,AudioBytes._Game.canvas.width,AudioBytes._Game.canvas.height);
    
    AudioBytes._Game.context.strokeStyle="blue";
    AudioBytes._Game.context.lineWidth = 2.0;
        

    
    $("#AudioBytesCanvas").bind("drop",AudioBytes._Game.drop);
    $("#AudioBytesCanvas").bind("dragenter",AudioBytes._Game.dragEnter);
    $("#AudioBytesCanvas").bind("dragover", AudioBytes._Game.dragOver);
    
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

    if(e.originalEvent.dataTransfer.files[0].type != "audio/mp3")
    {
        alert("Invalid file type, only mp3 files are currently supported!");   
        return false;
    }
    var reader = new FileReader();

    reader.onload = function(event)
    {      
//            self.songBuffer = self.audioContext.createBuffer(event.target.result, false );

    AudioBytes._Game.audioContext.decodeAudioData(event.target.result, function(buffer) {
            AudioBytes._Game.startSong(buffer);
        }, AudioBytes._Game.loadError);

        //Add an animation drawer here in the end game, to give the user feedback.
    };
    reader.readAsArrayBuffer(e.originalEvent.dataTransfer.files[0]);
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

};

AudioBytes.prototype.loadError = function()
{
    alert("Your song has failed to decode, I am sorry");  
};