# NERD DISCO - Studio

useful links:

* http://rasp.io/wp-content/uploads/2014/08/RasPiO-portsplus2-on-pi_1500.jpg
* https://learn.adafruit.com/neopixels-on-raspberry-pi/wiring
* https://github.com/beyondscreen/node-rpi-ws281x-native
* https://photos.google.com/share/AF1QipOrcOfBYa43UniY2txWdH3qL_IlG-BzBofsYh3DK7nAScXOh4mfoPZgG63tMb2foA?key=Y3cyUWhpZEx5c1R3c2dlOFZDUXRkNUdrcUNJWHRB
* http://giphy.com/posts/windows-95-is-20-years-old-today

## Local



### Fadecandy Server

#### Install

Follow the instructions on the article "[Fadecandy Server Setup](https://learn.adafruit.com/1500-neopixel-led-curtain-with-raspberry-pi-fadecandy/fadecandy-server-setup)" to install the [Fadecandy](https://github.com/scanlime/fadecandy) server.

#### Configuration

Edit `usr/local/bin/fcserver.json` to change the current devices (add your Fadecandy by using it's unique serial), port, whitepoint, gamma and other stuff ([explained in the docs](https://github.com/scanlime/fadecandy/blob/master/doc/fc_server_config.md)). 

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











## Raspberry Pi WIFI


Configure the network adapter
sudo nano /etc/network/interfaces 


allow-hotplug wlan0
iface wlan0 inet dhcp
wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
iface default inet dhcp


Create the file /etc/wpa_supplicant/wpa_supplicant.conf

Add this to the file

ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1


Start the wpa_supplicant using the config
sudo wpa_supplicant -Dwext -iwlan0 -c/etc/wpa_supplicant/wpa_supplicant.conf


-------------------------

## Experimental

http://localhost:8000/?tumblrs=mironart&mode=playback&soundcloud=https://soundcloud.com/express-4/spektral-dnbe-promo-mix-vol-2-15&lul=wut/
http://localhost:8000/?tumblrs=kyttenjanae,ohbaekhyuns,money-in-veins&mode=playback&soundcloud=https://soundcloud.com/drumandbass/erb-n-dub-insomnia-2015-re&lul=wut/
