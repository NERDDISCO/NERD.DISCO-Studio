#!/bin/bash

devicePort=$1

# Disconnect
aconnect -d $devicePort:0 14:0
aconnect -d $devicePort:1 14:0
aconnect -d $devicePort:2 14:0
aconnect -d 14:0 $devicePort:0
aconnect -d 14:0 $devicePort:1

# Connect
aconnect $devicePort:0 14:0
aconnect $devicePort:1 14:0
aconnect $devicePort:2 14:0
aconnect 14:0 $devicePort:0
aconnect 14:0 $devicePort:1

aconnect -oli