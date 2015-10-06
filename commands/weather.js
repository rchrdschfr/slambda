module.exports = {
	hostname: 'api.openweathermap.org',
	port: 80,
	method: 'GET',
	protocol: 'http',
			path: function(options, event, context) {
			  var path = "/data/2.5/weather?zip=" + options.directive;
			  if (helpers.isDefined(options.country)) {
			  	path += "," + options.country;
			  }
			  return path;
			},
			return: {
		      hostname: 'hooks.slack.com',
		      port: 443,
		      path: '/services/T024Z4ACR/B0BFTLKCJ/XZRz7IgUU8LANn5BHmd0vIKf',
		      method: 'POST',
		      body: function (options, response, event, context) {
		      	var weather = JSON.parse(response).weather;
                var weatherText = "[" + weather[0].main + "] " + weather[0].description;
	            var channel = "@" + event.user_name;
    	        var postData = JSON.stringify({
        	      text: weatherText,
                  channel: channel
                });

                return postData;
		      }
	       },

};