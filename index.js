var settings = require('./settings.js');
global.settings = settings; // make the settings available to the modules
var helpers = require('./helpers.js');
global.helpers = helpers; // make the helpers available to the modules
var https = require('https');
var http = require('http');
var requireDir = require('require-dir');
var commands = requireDir('./commands');


exports.handler = function(event, context) {
  /** ensure that we have received a known command, the correct
	  token was supplied, and that at least the hostname and path are set
  **/
  var commandName = event.command.replace("/", ""); // e.g. 'weather'
  var command = commands[commandName];
  if (!helpers.isDefined(command)) context.fail("Unknown command.");
  if (settings[commandName].token !== event.token) {
    context.fail('Invalid token');
  }
  if (!helpers.isDefined(command.hostname)) {
    context.fail("Hostname not set.");
  };
  if (!helpers.isDefined(command.path)) {
    context.fail("Path not set.");
  };

  // at this point everything should be go good to go

  // parse command options
  var commandOptions;
  if (helpers.isDefined(command.parseText)) {
    if (helpers.isFunction(command.parseText)) {
	  commandOptions = command.parseText(event.text);
    }
  }
  else {
    commandOptions = helpers.parseText(event.text);
  }


  // TODO: add all options available
  var requestOptions = {
    hostname: helpers.getRequestOption('hostname', command, commandOptions, event, context),
	path: helpers.getRequestOption('path', command, commandOptions, event, context),
	port: helpers.getRequestOption('port', command, commandOptions, event, context),
	method: helpers.getRequestOption('method', command, commandOptions, event, context),
	auth: helpers.getRequestOption('auth', command, commandOptions, event, context),
    body: helpers.getRequestOption('body', command, commandOptions, event, context)
  };

  var requestProtocol = helpers.getRequestOption('protocol', command, commandOptions, event, context) == 'https' ? https : http;
  var request = requestProtocol.request(requestOptions, function(response) {
	var responseBody = '';
	console.log('Status:', response.statusCode);
	console.log('Headers:', JSON.stringify(response.headers));
	response.setEncoding('utf8');
	response.on('data', function(chunk) {
	  responseBody += chunk;
	});
	
	response.on('end', function() {
      console.log('Successfully processed HTTPS response');
	  if (helpers.isDefined(command.return)) {
		if (!helpers.isDefined(command.return)) command.return = {};
		if (!helpers.isDefined(command.return.hostname)) {
		  context.fail("Hostname for the return request not set.");
		}
        if (!helpers.isDefined(command.return.path)) {
		  context.fail("Path for the return request not set.");
		}
			
		var returnOptions = {
		  hostname: helpers.getReturnRequestOption('hostname', command, responseBody, commandOptions, event, context),
		  path: helpers.getReturnRequestOption('path', command, responseBody, commandOptions, event, context),
		  port: helpers.getReturnRequestOption('port', command, responseBody, commandOptions, event, context),
		  method: helpers.getReturnRequestOption('method', command, responseBody, commandOptions, event, context),
		  auth: helpers.getReturnRequestOption('auth', command, responseBody, commandOptions, event, context),
		  body: helpers.getReturnRequestOption('body', command, responseBody, commandOptions, event, context)
		};
		var returnRequestProtocol = helpers.getReturnRequestOption('protocol', command, responseBody, commandOptions, event, context) == 'https' ? https : http;
	    var returnRequest = returnRequestProtocol.request(returnOptions, function(returnResponse) {
		  var returnResponseBody = "";
		  returnResponse.setEncoding('utf8');
		  returnResponse.on('data', function (chunk) {
			console.log('Response: ' + chunk);
			returnResponseBody += chunk;
		  });
		  returnResponse.on('end', function() {
		    console.log('A request was sent to an external server with the following response:');
			console.log(responseBody);
			console.log('We then made a request to another server based off that response. the' +
						'response from that server looks like this:');
			console.log(returnResponseBody);
			context.succeed(returnResponseBody);
		  });
		});

		returnRequest.on('error', context.fail);
		returnRequest.write(returnOptions.body);
		returnRequest.end();
	  }
	  else {
		console.log("A request was sent to an external server with the following response:");
		context.succeed(responseBody);
		console.log("No other requests were sent in response to this.");
	  }
	});
  });
  request.on('error', context.fail);
  request.write(requestOptions.body);
  request.end();
};