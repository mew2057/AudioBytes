/* ------------
   audio.js
   
   Assumes:
   
   Author: John Dunham
   
   Description: Audio Module for AudioBytes.
   
   Date Modified: 9/13/2014
   ------------ */
   
var app = app || {};

app.Audio = function()
{
	Audio.FFT_SIZE = 1024;
	
	function Audio()
	{
		// CrossBrowser
		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		
		// Creates the gain node.
		this.gainNode = this.audioContext.createGain();
		this.gainNode.value = .5;
		
		// Create an analyzer and set the FFTs.
		this.analyzer = this.audioContext.createAnalyser();
		this.analyzer.fftSize = Audio.FFT_SIZE;
		
		// Connect the nodes in a meaningful manner.
		this.audioContext.connect(this.gainNode);
		this.audioContext.connect(this.analyzer);
	}
	
	/**
	 * An error callback for load errors.
	 */
	Audio.loadError = function()
	{
		alert("Your song has failed to decode, I am sorry");  
	}
	
	Audio.prototype = 
	{
		/**
		 * Processes a FileReader onload event.		 
		 */
		onload : function( event )
		{
			this.audioContext.decodeAudioData( event.target.result, function(buffer) {
				this.startSong(buffer);
			}, Audio.loadError );
		}
	
	}
	
	return Audio;

}