/**
 * SoundCloud extension for ndAudio
 *
 * Dependency:
 * - ndAudio
 */
function ndSoundcloud(args) {
  // Name of the function
  this.functionName = 'ndSoundcloud';
  
  // Reference to ndAudio
  this.ndAudio = args.ndAudio || null;
  
  // ID of the registered SoundCloud App
  this.clientID = args.clientID || null;
  
  // URL to a track on SoundCloud
  this.trackURL = args.trackURL || null;
  
  // Reference to the SoundCloud track (loaded using the SoundCloud SDK)
  this.track = null;
  
  // URL to the SoundCloud stream for a given trackURL
  this.streamURL = null;
  
  // Reference to the mediaElement from ndAudio
  this.mediaElement = this.ndAudio.mediaElement;
  
  // Reference to the SoundCloud SDK
  // @see https://github.com/soundcloud/soundcloud-javascript
  // @see https://developers.soundcloud.com/docs/api/sdks#javascript
  this.sdk = SC;
  
  // Initialize SoundCloud SDK with the given clientID 
  // to identify this application towards the SoundCloud API
  this.sdk.initialize({
    client_id: this.clientID
  });
  
} // / ndSoundcloud



/**
 * ndSoundcloud - functions
 */
ndSoundcloud.prototype = {

  /*
   * Load the SoundCloud track data as JSON for a given trackURL.
   * 
   * # Example:
   * loadTrack({ trackURL : 'https://soundcloud.com/blaize323/spongebob-bounce-pants-blaize-remix-edit' })
   */
  loadTrack : function(args) {

    // Init args if not set
    args = args || {};

    // The URL to the track
    this.trackURL = args.trackURL || this.trackURL;

    // Ajax to get the track-JSON for the given trackURL
    this.sdk.get(
      // API endpoint to lookup / access resources for a given SoundCloud URL
      '/resolve',
      
      // URL of the track
      { url : this.trackURL },
      
      // Result from SoundCloud
      function(track) {

        // Resolving the track was successful
        if (typeof track.errors === 'undefined') {
          // Save the track data
          this.track = track;

          // The track is streamable
          if (track.streamable) {
            // Create the streamURL using the given clientID
            this.streamURL = this.track.stream_url + '?client_id=' + this.clientID;

            // Update the mediaElement
            this.ndAudio.updateMediaElement(this.streamURL);

          // The track is not streamable D:<
          } else {
            console.error('This SoundCloud URL is not allowed to be streamed.');
          }
          
        // Error while resolving the track
        } else {
          // Iterate over all errors
          for (var i = 0; i < track.errors.length; i++) {
             // Show a specific error message
             console.error(this.functionName, ':', track.errors[i].error_message);
          }
        }
      
      // Bind ndSoundcloud scope to the function
      }.bind(this) // / function(track)
      
    ); // / this.sdk.get('/resolve')
    
  } // / ndSoundcloud.loadTrack

}; // / ndSoundcloud.prototype