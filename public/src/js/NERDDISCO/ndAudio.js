function ndAudio(args) {
  
  // Set AudioContext
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  
  // Create new AudioContext
  this.audioContext = new AudioContext();
  
  // Create analyzer
  this.audioAnalyser = this.audioContext.createAnalyser();

  // Set FFT size 
  // @see http://en.wikipedia.org/wiki/Fast_Fourier_transform
  this.audioAnalyser.fftSize = args.fftSize || 256;
  
  // Create an Uint8Array to store the frequency data from the audioAnalyzer
  this.audioFrequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
  
  // Grouped frequency data (lows, mids, highs)
  this.audioGroupedFrequencyData = null;
  
  // The Hz of one bin (sampleRate / fftSize)
  this.audioBinHz = null;

  // Set the media element (e.g. <audio>)
  this.mediaElement = args.mediaElement || null;
  
  // Enable crossOrigin requests
  // @see https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes
  this.mediaElement.crossOrigin = 'anonymous';

  // The source for the mediaElement
  this.mediaElement_src = args.mediaElement_src || null;

  // The volume of the mediaElement
  this.mediaElement_volume = args.mediaElement_volume || 1.0;
  
  // Set the source for the audio processing to the mediaElement
  this.audioSource = this.audioContext.createMediaElementSource(this.mediaElement);
    
  // Connect the audioSource with the audioAnalyzer
  this.audioSource.connect(this.audioAnalyser);

  // Connect the audioAnalyzer with the audioContext's destination (e.g. speaker)
  this.audioAnalyser.connect(this.audioContext.destination);
  
} // / ndAudio


/**
 * ndAudio - functions
 */
ndAudio.prototype = {

  /**
   * Update the src of the mediaElement using the streamUrl
   * and prevent auto-playback. 
   */
  updateMediaElement : function(mediaElement_src) {

    // Update the mediaElement's source
    this.mediaElement_src = mediaElement_src;

    // Update the src attribute of the mediaElement
    this.mediaElement.setAttribute('src', this.mediaElement_src);

    // 
    this.mediaElement.volume = this.mediaElement_volume;


    
    // Pause playback
    this.mediaElement.pause();
    
    // Update the audioBinHz
    this.audioBinHz = this.audioContext.sampleRate / this.audioAnalyser.fftSize;
  },
  




  updateData : function() {
    // Get byte frequency data from the audioAnalyser
    this.audioAnalyser.getByteFrequencyData(this.audioFrequencyData);
    
    /*
     * Create the grouped frequency data based on these ranges:
     *
     *  1. Sub Lows 20-100
     *  2. Lows 100-250
     *  3. Low Mids 250 - 500
     *  4. Mids 500 - 1k
     *  5. High Mids 1k - 5k
     *  6. Highs 5k-10k
     *  7. Super Highs 10k-20k and above
     */
    // Initialize new array
    this.audioGroupedFrequencyData = {
      'sublow' : { value : 0, count : 0},
      'low' : { value : 0, count : 0},
      'lowmid' : { value : 0, count : 0},
      'mid' : { value : 0, count : 0},
      'highmid' : { value : 0, count : 0},
      'high' : { value : 0, count : 0},
      'superhigh' : { value : 0, count : 0}
    };
    
    // Helper to save the current bins Hz
    var currentBinHz = 0;
    
    // The audioBinHz is defined
    if (this.audioBinHz !== null) {
      
      // Iterate over every bin
      for (var i = 0; i < this.audioFrequencyData.length; i++) {
        
        // Calculate the current bins Hz
        currentBinHz = this.audioBinHz * (i + 1);

        if (currentBinHz < 100) {
          this.audioGroupedFrequencyData['sublow'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['sublow'].count++;
          }
          
        } else if (currentBinHz < 250) {
          this.audioGroupedFrequencyData['low'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['low'].count++;
          }
          
        } else if (currentBinHz < 500) {
          this.audioGroupedFrequencyData['lowmid'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['lowmid'].count++;
          }
        
        } else if (currentBinHz < 1000) {
          this.audioGroupedFrequencyData['mid'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['mid'].count++;
          }
        
        } else if (currentBinHz < 5000) {
          this.audioGroupedFrequencyData['highmid'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['highmid'].count++;
          }
        
        } else if (currentBinHz < 10000) {
          this.audioGroupedFrequencyData['high'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['high'].count++;
          }
          
        } else if (currentBinHz < 20000) {
          this.audioGroupedFrequencyData['superhigh'].value += this.audioFrequencyData[i];
          if (this.audioFrequencyData[i] > 0) {
            this.audioGroupedFrequencyData['superhigh'].count++;
          }
        }
   
      } // / for this.audioFrequencyData.length
      
      /**
       * Calculate the middle value of every frequency range
       */
      if (this.audioGroupedFrequencyData['sublow'].count > 0) {
       this.audioGroupedFrequencyData['sublow'].value = Math.round(this.audioGroupedFrequencyData['sublow'].value / this.audioGroupedFrequencyData['sublow'].count);
      }
      
      if (this.audioGroupedFrequencyData['low'].count > 0) {
       this.audioGroupedFrequencyData['low'].value = Math.round(this.audioGroupedFrequencyData['low'].value / this.audioGroupedFrequencyData['low'].count);
      }
      
      if (this.audioGroupedFrequencyData['lowmid'].count > 0) {
       this.audioGroupedFrequencyData['lowmid'].value = Math.round(this.audioGroupedFrequencyData['lowmid'].value / this.audioGroupedFrequencyData['lowmid'].count);
      }
      
      if (this.audioGroupedFrequencyData['mid'].count > 0) {
       this.audioGroupedFrequencyData['mid'].value = Math.round(this.audioGroupedFrequencyData['mid'].value / this.audioGroupedFrequencyData['mid'].count);
      }
      
      if (this.audioGroupedFrequencyData['highmid'].count > 0) {
       this.audioGroupedFrequencyData['highmid'].value = Math.round(this.audioGroupedFrequencyData['highmid'].value / this.audioGroupedFrequencyData['highmid'].count);
      }
      
      if (this.audioGroupedFrequencyData['high'].count > 0) {
       this.audioGroupedFrequencyData['high'].value = Math.round(this.audioGroupedFrequencyData['high'].value / this.audioGroupedFrequencyData['high'].count);
      }
      
      if (this.audioGroupedFrequencyData['superhigh'].count > 0) {
       this.audioGroupedFrequencyData['superhigh'].value = Math.round(this.audioGroupedFrequencyData['superhigh'].value / this.audioGroupedFrequencyData['superhigh'].count);
      }
      
    } // / audioBinHz is defined
    
  }, // / ndAudio.prototype.updateData
  
  
  /**
   * Get the frequency data from the audioAnalyzer
   */
  getFrequencyData : function() {
    // Return the raw frequency data
    return this.audioFrequencyData;
  }, // / ndAudio.prototype.getFrequencyData
  
  
  /**
   *
   */
  getGroupedFrequencyData : function() {
    return this.audioGroupedFrequencyData;
  } // / ndAudio.prototype.getGroupedFrequencyData
  
}; // / ndAudio.prototype