#!/bin/bash

echo "Installing build-essential"
apt-get update
apt-get -y install build-essential
cd $(dirname $0)

echo "Installing module \"onoff\""
npm install --save onoff@^6.0.3

echo "Installing module \"socket.io-client\""
npm install --save socket.io-client@^1.7.4

#requred to end the plugin install
echo "plugininstallend"
