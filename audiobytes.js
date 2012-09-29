/**
 * Of Interest:
 *  http://airtightinteractive.com/demos/js/reactive/
 */
function AudioBytes()
{
    this.canvas = null;
    this.context = null;
    this.audioContext = null;
    this.newAudioQueued = false;
    this.audioSource = null;
    this.audioAnalyzer = null;
    this.audioScratch = null;
}

AudioBytes._Game = null;

AudioBytes.prototype.draw = function()
{
    this.context.fillRect(0,0,1024,500);

    this.drawWave();

};

AudioBytes.prototype.drawWave = function()
{
    var startY = this.canvas.height/2;
    this.context.beginPath();


    this.context.moveTo(0,startY + this.audioScratch[0] - 128);

    for (var cell  = 1; cell <  this.audioScratch.length; cell++)
    {
        this.context.lineTo(cell,startY + this.audioScratch[cell] - 128);
    }
    this.context.stroke();
};

AudioBytes.prototype.update = function()
{

   this.audioAnalyzer.getByteTimeDomainData(this.audioScratch);
};

AudioBytes.prototype.gameLoop = function()
{
    
    this.update();
    this.draw();

    setTimeout(function() {
        AudioBytes._Game.gameLoop();
    }, 16.6);
};

AudioBytes.init = function()
{
    AudioBytes._Game = new AudioBytes();
    
    try {
        AudioBytes._Game.audioContext = new window.webkitAudioContext();
        AudioBytes._Game.audioAnalyzer  = AudioBytes._Game.audioContext.createAnalyser();
        AudioBytes._Game.audioScratch = new Uint8Array(
                AudioBytes._Game.audioAnalyzer.frequencyBinCount);

    }
    catch(e) {
        alert('Web Audio API is not supported in this browser');
    }
    
    // Establishes the canvas with an id and a tabindex.
    $('<canvas id="AudioBytesCanvas" tabIndex="0">HTML5 not supported in your browser</canvas>').appendTo('body');
    
    //Removes the focus border.
    $("#AudioBytesCanvas").css("outline","0");    
    $("#AudioBytesCanvas").focus();
    
    //Uses FileReader, Audio API,Session Storage

    AudioBytes._Game.newAudioQueued = false;

    // Sets up the canvas and drawing context details for the game.
    AudioBytes._Game.canvas = document.getElementById("AudioBytesCanvas");
    AudioBytes._Game.canvas.width = 1024;
    AudioBytes._Game.canvas.height = 500;
    

    AudioBytes._Game.context = AudioBytes._Game.canvas.getContext("2d");      
    
    AudioBytes._Game.context.fillStyle="white";
    AudioBytes._Game.context.fillRect(0,0,1024,500);
        AudioBytes._Game.context.strokeStyle="black";
        

    
    $("#AudioBytesCanvas").bind("drop",AudioBytes._Game.drop);
    $("#AudioBytesCanvas").bind("dragenter",AudioBytes._Game.dragEnter);
    $("#AudioBytesCanvas").bind("dragover", AudioBytes._Game.dragOver);
    AudioBytes._Game.gameLoop();
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
};

AudioBytes.prototype.loadError = function()
{
    alert("Your song has failed to decode, I am sorry");  
};