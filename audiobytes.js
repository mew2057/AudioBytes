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
    
    // Sets up the canvas and drawing context details for the game.
    audioBytesGame.canvas = document.getElementById("AudioBytesCanvas");
    audioBytesGame.canvas.width = 500;
    audioBytesGame.canvas.height = 500;

    audioBytesGame.context = audioBytesGame.canvas.getContext("2d");      
};