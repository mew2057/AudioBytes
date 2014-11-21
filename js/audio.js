/* ------------
   audio.js
   
   Assumes:
   
   Author: John Dunham
   
   Description: Audio Module for AudioBytes.
   
   Date Modified: 9/13/2014
   ------------ */
var OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;

var app = app || {};

// TODO find better solution!
var FFT_SIZE = 1024;

app.Audio = function()
{
	// CrossBrowser
	this.audioContext = new (window.AudioContext || window.webkitAudioContext)();	
	
	this.unfilteredBuffer;
	// Specifies the offline audio context which will do the lions share of the analysis work.
	// Not sure how this all works right now.
	
	
	// Creates the gain node.
	this.gainNode = this.audioContext.createGain();
	this.gainNode.gain.value = .1;
	
	// Create an analyzer and set the FFTs.
	this.analyzer = this.audioContext.createAnalyser();
	this.analyzer.fftSize = FFT_SIZE;
	
	this.offlineAnalyzer = this.audioContext.createAnalyser();
	this.offlineAnalyzer.fftSize = FFT_SIZE;
	
	// Creates a convolver node, this will be used to filter the audio.
	this.convolver = this.audioContext.createConvolver();
this.samples = 0;
	
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
		this.audioContext.decodeAudioData( result, this.processSong.bind(this), this.loadError );
	},
	
	// This looks like it processes the song pretty much wholesale.
	processSong : function( buffer )
	{	
		// Cache the unfiltered buffer for sound card rendered audio.
		this.unfilteredBuffer = buffer;
		
		// Create a fresh context and source for this song.
		this.offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
		this.offlineContext.oncomplete = this.startSong.bind(this);

		this.offlineSource  = this.offlineContext.createBufferSource();
		this.offlineSource.buffer = buffer;
		
		
		// XXX this doesn't work consistently in offline mode.
		/*
		// Performs analysis.
		this.offlineAnalyzer = this.offlineContext.createAnalyser();
		this.offlineAnalyzer.fftSize = FFT_SIZE;
		
		this.offlineSource.connect(this.offlineAnalyzer);	

		// TODO tweak sample buffer!
		// This is pretty high fidelity (highest) and it loads a 4 minute song in no time, I think this should do nicely.
		var scriptNode = this.offlineContext.createScriptProcessor(16384, buffer.numberOfChannels, buffer.numberOfChannels);
		scriptNode.onaudioprocess = this.preProcessAudio.bind(this);
		this.offlineAnalyzer.connect(scriptNode);
		*/
		
		this.offlineSource.connect(this.offlineContext.destination);
		this.offlineSource.start();	
		this.offlineContext.startRendering();
	},
	
	preProcessAudio : function (e)
	{
		// This hook in doesn't work!
		for(var channel = 0; channel < e.inputBuffer.numberOfChannels; ++channel)
		{
			var buffer = e.inputBuffer.getChannelData(channel);
			var energy = 0;
			var outputData = e.outputBuffer.getChannelData(channel);

			for (var sample = 0; sample < buffer.length; ++sample) 
			{
				// The PCM for the data.
				// TODO make meaningful for beat detection.
				energy += buffer[sample];
				outputData[sample] = buffer[sample];
			}
			avgEnergy = energy/buffer.length;
			
			if(channel ==0 )
				this.samples += buffer.length;
		}
	},
	
	startSong : function (event)
	{
		console.log(this.samples);
		window.dispatchEvent(app.FileManager.loadCompleteEvent);
		
		// Stops any audio that is currently playing.
		if(this.audioSource)
		{
			this.audioSource.noteOff(0);
		}
		
		console.log(this.unfilteredBuffer);

		// create a new audio buffer for the song.
		this.audioSource = this.audioContext.createBufferSource();
		this.audioSource.buffer = event.renderedBuffer;//this.unfilteredBuffer;//
		
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
		this.analyzer.getByteTimeDomainData(this.domainScratch);
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
