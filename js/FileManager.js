/* ------------
   FileManager.js
   
   Assumes:
   
   Author: John Dunham
   
   Description: File Management Module for Audiobytes.
   
   Date Modified: 11/19/2014
   ------------ */
   
var app = app || {};

app.FileManager = function()
{

	function FileManager()
	{
		if (!(window.File && window.FileReader && window.FileList && window.Blob)) 
		{
			alert("File API is not supported by your browser!");
		}
		
		this.loadStarted = 'loading';
		this.loadCompleted = 'loadCompleted';
		
		this.loadStartEvent = new Event(this.loadStarted);
		this.loadCompleteEvent = new Event(this.loadCompleted);
				
		// The fileReader.
		this.fileReader = new FileReader();		
		this.fileReader.onloadend = this.loadComplete.bind(this);
		
		$(document).ready(this.init.bind(this));		
	}
	
	FileManager.prototype =
	{	
		init : function()
		{
			this.disableFileInput();
		},
		
		enableFileInput : function ( callback )
		{
			if( callback )
			{
				this.onLoadCB = callback;
			}
			
			$("#fileBtn").show();
			$("#fileBtn").change(this.fileSelect.bind(this));
		},
		
		disableFileInput : function()
		{
			$("#fileBtn").hide();
			$("#fileBtn").unbind("change");		
		},
		
		// Actually starts the file load operation.
		fileSelect : function(e)
		{
			this.disableFileInput();	
			
			window.dispatchEvent(this.loadStartEvent);
			
			// TODO make this more generic, but for now this will do.
			// E.G. > 1 file.
			this.fileReader.readAsArrayBuffer(e.target.files[0]);
		},
		
		loadComplete : function(e)
		{
			if(e.target.readyState === 2)
			{	
				if(this.onLoadCB)
				{
					this.onLoadCB(e.target.result);
				}
				
				this.onLoadCB = null;
			}
			else
			{
				this.enableFileInput();
				alert("There seems to be a problem: File could not be loaded");
			}
		}
	}
	
	return new FileManager();
}();