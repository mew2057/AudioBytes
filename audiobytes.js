function AudioBytes()
{
    this.canvas = null;
    this.context = null;
}

AudioBytes.init = function()
{
    var audioBytesGame = new AudioBytes();
    
    // Establishes the canvas with an id and a tabindex.
    $('<canvas id="AudioBytesCanvas" tabIndex="0">HTML5 not supported in your browser</canvas>').appendTo('body');
    
    //Removes the focus border.
    $("#AudioBytesCanvas").css("outline","0");    
    $("#AudioBytesCanvas").focus();
    
    //Uses FileReader, Audio API,Session Storage
    
    // Sets up the canvas and drawing context details for the game.
    audioBytesGame.canvas = document.getElementById("AudioBytesCanvas");
    audioBytesGame.canvas.width = 500;
    audioBytesGame.canvas.height = 500;
    

    audioBytesGame.context = audioBytesGame.canvas.getContext("2d");      
    
    audioBytesGame.context.fillStyle="white";
    audioBytesGame.context.fillRect(0,0,500,500);
    $("#AudioBytesCanvas").bind("drop",audioBytesGame.drop);
    $("#AudioBytesCanvas").bind("dragenter",audioBytesGame.dragEnter);
    $("#AudioBytesCanvas").bind("dragover", audioBytesGame.dragOver);
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
        //This will be harder then I thought....
        /*localStorage.setItem("song",event.target.result);
        
        $('<audio id="audiocanvas" tabIndex="0" src=blah>HTML5 not supported in your browser</audio>').appendTo("body");
    alert(localStorage.getItem('song'));
        $('#audiocanvas').play();*/
    };
    reader.readAsDataURL(e.originalEvent.dataTransfer.files[0]);
};