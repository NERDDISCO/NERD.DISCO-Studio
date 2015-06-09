#!/bin/bash

# Disconnect
aconnect -d 24:0 14:0
aconnect -d 24:1 14:0
aconnect -d 24:2 14:0
aconnect -d 14:0 24:0
aconnect -d 14:0 24:1

# Connect
aconnect 24:0 14:0
aconnect 24:1 14:0
aconnect 24:2 14:0
aconnect 14:0 24:0
aconnect 14:0 24:1