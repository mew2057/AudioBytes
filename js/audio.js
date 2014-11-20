/* ------------
   audio.js
   
   Assumes:
   
   Author: John Dunham
   
   Description: Audio Module for AudioBytes.
   
   Date Modified: 9/13/2014
   ------------ */
   
var app = app || {};

// TODO find better solution!
FFT_SIZE = 1024;

app.Audio = function()
{
	// CrossBrowser
	this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
	
	// Creates the gain node.
	this.gainNode = this.audioContext.createGain();
	this.gainNode.value = .5;
	
	// Create an analyzer and set the FFTs.
	this.analyzer = this.audioContext.createAnalyser();
	this.analyzer.fftSize = FFT_SIZE;
	
	/*
	// Connect the nodes in a meaningful manner.
	this.audioContext.connect(this.gainNode);
	this.audioContext.connect(this.analyzer);*/
}

app.Audio.prototype = 
{
	/**
	 * An error callback for load errors.
	 */
	loadError : function()
	{
		alert("Your song has failed to decode, I am sorry");  
	},
	/**
	 * Processes a FileReader onload event.		 
	 */
	fileLoaded : function( result )
	{
		console.log("result");
		// TODO  make playback
		this.audioContext.decodeAudioData( result, this.startSong.bind(this), this.loadError );
	},
	
	startSong : function (buffer)
	{
		// Stops any audio that is currently playing.
		if(this.audioSource)
		{
			this.audioSource.noteOff(0);
		}

		// create a new audio buffer for the song.
		this.audioSource = this.audioContext.createBufferSource();
		this.audioSource.buffer = buffer;
		
		// MAGIC!
		//this.audioSource.connect(this.audioAnalyzer);    
		//this.audioAnalyzer.connect(this.scriptProcessor);
		
		// Connect the "stereo" to the volume dial.
		this.audioSource.connect(this.gainNode);
		
		// Connect the "speakers" to the volume control.
		this.gainNode.connect(this.audioContext.destination);

		// Start the song and change the drawing function.
		this.audioSource.start();
		
		// TODO find a better solution for this.
		width = 0;
	}

}
