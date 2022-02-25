'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
const io = require('socket.io-client');
var Gpio = require('onoff').Gpio;

module.exports = arduinoController;
function arduinoController(context) {
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;

}



arduinoController.prototype.onVolumioStart = function()
{
	var self = this;
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

    return libQ.resolve();
}

arduinoController.prototype.onStart = function() {
    var self = this;
	var defer=libQ.defer();


	// Once the Plugin has successfull started resolve the promise
	self.detectCommands()
	defer.resolve();

    return defer.promise;
};

arduinoController.prototype.onStop = function() {
    var self = this;
    var defer=libQ.defer();

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

arduinoController.prototype.onRestart = function() {
    var self = this;
    // Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

arduinoController.prototype.getUIConfig = function() {
    var defer = libQ.defer();
    var self = this;

    var lang_code = this.commandRouter.sharedVars.get('language_code');

    self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json')
        .then(function(uiconf)
        {


            defer.resolve(uiconf);
        })
        .fail(function()
        {
            defer.reject(new Error());
        });

    return defer.promise;
};

arduinoController.prototype.getConfigurationFiles = function() {
	return ['config.json'];
}

arduinoController.prototype.setUIConfig = function(data) {
	var self = this;
	//Perform your installation tasks here
};

arduinoController.prototype.getConf = function(varName) {
	var self = this;
	//Perform your installation tasks here
};

arduinoController.prototype.setConf = function(varName, varValue) {
	var self = this;
	//Perform your installation tasks here
};


arduinoController.prototype.detectCommands = function(){
const socket = io('ws://volumio.local:3000',{timeout:500,transports:['websocket'],upgrade:'websocket'});
const arduinoPin = new Gpio(26,'in','both');

console.log("Starting controller...");

socket.on('connect',()=>{console.log("Connected with volumio!")})
socket.on('connect_error',(err)=>{console.log("Connect ERROR with volumio: "+err)})
socket.on('connect_timeout',()=>{console.log("Connect TIMEOUT with volumio")})

if(Gpio.accessible){
console.log("GPIO is accesible!")
	let counter = 0;

	const  runCommand = () => {
//		console.log("running command...");
		switch(counter) {
			case 1:
				console.log("Powering Down");
				exec('sudo /sbin/halt', function(error,stdout,stderr){});
				break;
			case 2:
				console.log("Play");
				socket.emit('getState','');
				socket.once('pushState', function(state){
					state.status==='play' ? socket.emit('pause') : socket.emit('play');
				})
				break;
			case 3:
				console.log("Volume Up");
				socket.emit('volume','+');
				break;
			case 4:
				console.log("Volume Down");
				socket.emit('volume','-');
				break;
			case 5:
				console.log("Next Track");
				socket.emit('next');
				break;
			case 6:
				console.log("Previous Track");
				socket.emit('prev');
				break;

			default:
				break;

		}
		counter=0;
	}


	arduinoPin.watch((err, value) =>{
		if(err){
			throw err;
		}
		value === 1 && counter++
//		console.log("GPIO 26 from arduino value:  "+value);
//		console.log("Counter: "+counter);
		setTimeout(()=>{runCommand()},300);
	});
} else {
console.log("GPIO not accessible")
}


};
