/* ------------
   audio.js
   
   Assumes:
   
   Author: John Dunham
   
   Description: Audio Module for AudioBytes.
   
   Date Modified: 9/13/2014
   ------------ */
   
var app = app || {};

// TODO find better solution!
var FFT_SIZE = 1024;

app.Audio = function()
{
	// CrossBrowser
	this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
	
	// Creates the gain node.
	this.gainNode = this.audioContext.createGain();
	this.gainNode.gain.value = .1;
	
	// Create an analyzer and set the FFTs.
	this.analyzer = this.audioContext.createAnalyser();
	this.analyzer.fftSize = FFT_SIZE;
	
	// Creates a convolver node, this will be used to filter the audio.
	this.convolver = this.audioContext.createConvolver();

	
	// A buffer for holding audio data.
	this.audioScratch = new Uint8Array(this.analyzer.frequencyBinCount);
	this.domainScratch = new Uint8Array(this.analyzer.fftSize);

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
		// TODO  make playback
		this.audioContext.decodeAudioData( result, this.startSong.bind(this), this.loadError );
	},
	
	startSong : function (buffer)
	{
		window.dispatchEvent(app.FileManager.loadCompleteEvent);
		
		// Stops any audio that is currently playing.
		if(this.audioSource)
		{
			this.audioSource.noteOff(0);
		}

		// create a new audio buffer for the song.
		this.audioSource = this.audioContext.createBufferSource();
		this.audioSource.buffer = buffer;
		
		// MAGIC!
		this.audioSource.connect(this.analyzer);    
		
		// Connect the "stereo" to the volume dial.
		this.analyzer.connect(this.gainNode);
		
		// Connect the "speakers" to the volume control.
		this.gainNode.connect(this.audioContext.destination);

		// TODO make this user specified.
		// Start the song and change the drawing function.
		this.audioSource.start();
		
		// TODO find a better solution for this.
		width = 0;
	},
	
	processAudio : function()
	{
		this.analyzer.getByteFrequencyData(this.audioScratch);		
		this.analyzer.getByteTimeDomainData(this.domainScratch)
	},
	
	draw : function( ctx, gradient )
	{		
		ctx.save();
		ctx.fillStyle = gradient;
		

		for (var bin = 0,renderPos = 2; bin < this.audioScratch.length; ++bin, renderPos += 2)
		{
			ctx.fillRect(renderPos, ctx.canvas.height, 1, -this.audioScratch[bin]);
		}
		
		var origin = ctx.canvas.height / 2;
		ctx.fillStyle = "blue";
		ctx.beginPath();

		ctx.moveTo(0,origin);
		for (var bin = 0; bin < this.domainScratch.length; ++bin)
		{
			ctx.lineTo(bin, (origin - 127) +this.domainScratch[bin] );
		}
		ctx.stroke();

		ctx.restore();
	}
	
	

}
