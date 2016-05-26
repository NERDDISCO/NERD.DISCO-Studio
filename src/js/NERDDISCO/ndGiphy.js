'use strict';

class ndGiphy {
     
  constructor(args) {
    
    // Key to access the API
    this.apiKey = args.apiKey || null;

    // URL to all the API
    this.apiURL = args.apiURL || null;

    // Reference to XMLHttpRequest
    this.ajax = new XMLHttpRequest;

    // All loaded gifs
    this.gifs = args.gifs || [];

    // ID of the currently active giphy
    this.currentId = null;

    // ID of the last active giphy
    this.lastId = null;

    this.opacity = args.opacity || 1;

    // List of Giphy IDs
    this.playlist = args.playlist || [];

  } // / constructor




  /*
   * Change the currently active ID
   */
  setCurrentId(id) {

  	// Save the current ID as the last one
  	this.lastId = this.currentId;

  	// Overwrite the current ID with the new ID
  	this.currentId = id;

  } // / setCurrentId



  /**
   * Create & make a request to the Giphy API. 
   */
  request() {
    var q = "landscape,cats,city"; // search query

    // Initialize an async GET request
    // this.ajax.open('GET', this.apiURL + '/search?api_key='+this.apiKey+'&limit=75&q='+q, true);

    // this.ajax.open('GET', this.apiURL + '/trending?api_key='+this.apiKey+'&limit=75', true);

    this.ajax.open('GET', this.apiURL + '?api_key='+this.apiKey+'&limit=75&ids='+this.playlist.join(','), true);


    // We got a result from Giphy
    this.ajax.onload = function() {

      // Request was successful
      if (this.ajax.status >= 200 && this.ajax.status < 400) {

        // Parse the response data and get the content of the "data" attribute
        var data = JSON.parse(this.ajax.responseText).data;

        // Iterate over all images
        for (var i = 0; i < data.length; i++) {
          var _giphy = data[i];

          // Create an object with a reduced amount of data
          _giphy = {
            id : _giphy.id,
            mp4 : _giphy.images.original.mp4,
            height : _giphy.images.original.height,
            width : _giphy.images.original.width,
            frames : _giphy.images.original.frames
          };

          // Create the video element
          _giphy.video = this.createVideo(_giphy);

          // Save important data into a new Object 
          this.gifs.push(_giphy);

        } // Iterate over all images


        // Use the first video as the default
        this.setCurrentId(0);


      // Request was not successful
      } else {
        console.log('reached giphy, but API returned an error');
      }

    }.bind(this); // / onload



    // There was an error
    this.ajax.onerror = function(e) {
      console.log('connection error', e);
    }; // / onerror



    // Start the request
    this.ajax.send();
  } // / ndGiphy._request




  createVideo(_giphy) {
    // Create video element
    var _video = document.createElement('video');
    _video.setAttribute('id', _giphy.id);
    _video.setAttribute('crossOrigin', 'anonymous');
    _video.setAttribute('src', _giphy.mp4);
    _video.setAttribute('preload', '');
    _video.setAttribute('loop', true);
    // _video.setAttribute('autoplay', true);

    document.body.appendChild(_video);

    return document.getElementById(_giphy.id);
  }





  search() {

  } // / ndGiphy.search

} // / ndGiphy