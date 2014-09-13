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
		var audioContext = window.AudioContext || window.webkitAudioContext;
		this.audioContext = new AudioContext();
		
		// Create an analyzer and set the FFTs.
		this.analyzer = this.audioContext.createAnalyser();
		this.analyzer.fftSize = Audio.FFT_SIZE;
		
	}
	
	return Audio;

}