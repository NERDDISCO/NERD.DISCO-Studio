# NERD.DISCO - Studio





## Local



### Fadecandy Server

#### Install

Follow the instructions on the article "[Fadecandy Server Setup](https://learn.adafruit.com/1500-neopixel-led-curtain-with-raspberry-pi-fadecandy/fadecandy-server-setup)" to install the [Fadecandy](https://github.com/scanlime/fadecandy) server.

#### Configuration

Edit `usr/local/bin/fcserver.json` to change the current devices (add your Fadecandy by using it's unique serial), port, whitepoint, gamma and other stuff. 

##### Example

```json
{
        "listen": [null, 7890],
        "verbose": true,

        "color": {
                "gamma": 2.5,
                "whitepoint": [0.98, 1.0, 1.0]
        },

        "devices": [
                {
                        "type": "fadecandy",
                        "serial": "VVZTRRQARJSBSRKD",
                        "map": [
                                [ 0, 0, 0, 64 ]
                        ]
                }
        ]
}
```

#### Whitepoints

Max. for NERDDISCO: "whitepoint": [0.81, 0.83, 0.83]
Min. for NERDDISCO: "whitepoint": [0.28, 0.3, 0.3]


#### Start

Start the server on your local computer:

```
sudo /usr/local/bin/fcserver /usr/local/bin/fcserver.json
```

You will see a message like the following:

```
[1426346026:9175] NOTICE: Server listening on *:7890
USB device Fadecandy (Serial# VVZTRRQARJSBSRKD, Version 1.07) attached.
```

And if your Fadecandy is connected to your computer you also see the serial.

You can see the servers UI at http://localhost:7890/.



### Express / Socket.io server

Start the server on your local computer:

```
nodemon index.js
```





------------------------------------

## Raspberry PI



### Fadecandy Server

[Install](#install) and [configure](#configuration) the server on the Raspberry PI. 

#### Start

Start the server on the Raspberry PI:

```
ssh user@ip
sudo /usr/local/bin/fcserver /usr/local/bin/fcserver.json
```



### Express / Socket.io server

Start the server on your local computer:

```
nodemon index.js
```



## fcserver-j