var settings = require('./settings.js');
var helpers = require('./helpers.js');

// we can use either HTTP or HTTPS
var https = require('https');
var http = require('http');

// load the slambda modules
var requireDir = require('require-dir');
var commands = requireDir('./commands');


exports.handler = function(event, context) {
  /** ensure that we have received a known command, the correct
	  token was supplied, and that at least the hostname and path are set
  **/
  var commandName = event.command.replace("/", ""); // e.g. 'weather'
  var command = commands[commandName];
  if (!helpers.isDefined(command)) context.fail("Unknown command.");
  if (!helpers.isDefined(global.settings)) global.settings = {};
  if (!helpers.isDefined(global.settings[commandName])) global.settings[commandName] = {};
  if (!helpers.isDefined(global.settings[commandName].token)) {
	context.fail('No token set. Set the token in settings.js');
  }
  if (settings[commandName].token !== event.token) {
    context.fail('Invalid token.');
  }
  if (!helpers.isDefined(command.hostname)) {
    context.fail("Hostname not set.");
  };
  if (!helpers.isDefined(command.path)) {
    context.fail("Path not set.");
  };

  // at this point everything should be go good to go

  // parse the command text
  var commandOptions;
  if (helpers.isDefined(command.parseText)) {
    if (helpers.isFunction(command.parseText)) {
	  commandOptions = command.parseText(event.text);
    }
  }
  else {
    commandOptions = helpers.parseText(event.text);
  }

  // set the request options
  var requestOptions = {
    method: 'GET',
	port: 443,
	auth: '',
	body: '',
  };
  for (var key in command) {
	if (['protocol', 'return'].indexOf(key) !== -1) {
	  continue;
	}
	requestOptions[key] = helpers.getRequestOption(key, command, commandOptions, event, context);
  }
  var requestProtocolOption = helpers.isDefined(command.protocol) ? command.protocol : 'https';
  requestProtocol = requestProtocolOption == 'https' ? https : http;

  // send the request
  var request = requestProtocol.request(requestOptions, function(response) {
	var responseBody = '';
	console.log('Status:', response.statusCode);
	console.log('Headers:', JSON.stringify(response.headers));
	response.setEncoding('utf8');

	// grab the response body
	response.on('data', function(chunk) {
	  responseBody += chunk;
	});

	// do something with the response
	response.on('end', function() {
      console.log('Successfully processed HTTP(S) response');
	  if (helpers.isDefined(command.return)) {
		if (!helpers.isDefined(command.return)) command.return = {};
        if (!helpers.isDefined(command.return.path)) {
		  context.fail("Path for the return request not set.");
		}

		var returnOptions = {
	      hostname: 'hooks.slack.com',
		  port: 443,
		  method: 'POST',
		  auth: '',
		  body: ''
		};
		for (var key in command.return) {
		  if (['protocol'].indexOf(key) !== -1) {
			continue;
		  }
		  returnOptions[key] = helpers.getRequestOption(key, command, commandOptions, event, context, responseBody);
		};

		var returnRequestProtocolOption = helpers.isDefined(command.return.protocol) ? command.return.protocol : 'https';
        returnRequestProtocol = returnRequestProtocolOption == 'https' ? https : http;

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
