#!/bin/bash

devicePort=$1

# Disconnect
aconnect -d $devicePort:0 14:0
aconnect -d 14:0 $devicePort:0

# Connect
aconnect $devicePort:0 14:0
aconnect 14:0 $devicePort:0

aconnect -oli
