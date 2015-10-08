module.exports = {
  hostname: 'betastream.atlassian.net',
  auth: function(options, event, context) {
	if (helpers.isDefined(options.requestAuthString)) {
	  return options.requestAuthString;
	}
	else {
	  return global.settings.jira.auth; // make sure to put your auth stuff in the settings file!
	}
  },
  method: function(options, event, context) {
	//return 'GET';
	switch(options.directive) {
	  case 'open':
	    return 'GET';
	    break;
	  case 'create':
		return 'POST';
	    break;
	}
  },
  path: function(options, event, context) {
    switch (options.directive) {
      case 'open':
        return '/rest/api/2/search?jql=resolution=null';
	  	break;
	  case 'create':
		return '/rest/api/2/issue';
	    break;
	}
	  
  },
  headers: function(options, event, context) {
	switch (options.directive) {
	  case 'create':
		return {'Content-Type': 'application/json'};
	    break;
	}
  },
  body: function(options, event, context) {
	switch(options.directive) {
	  case 'create':
		if (!helpers.isDefined(options.key) || !helpers.isDefined(options.issuetype)) {
		  context.fail('project key and issuetype must be set.');
		}

		var requestBody = {
		  fields: {
			project: {
			  key: options.key
			},
			issuetype: {
			  name: options.issuetype
			}
		  }
		};
		for (var key in options) {
		  if (['directive', 'key', 'issuetype'].indexOf(key) !== -1) {
			requestBody.fields[key] = options[key];
		  }
		}

		return JSON.stringify(requestBody);
		break;
	  default:
		return '';
	}
  },
  return: {
    path: '/services/T024Z4ACR/B0BFTLKCJ/XZRz7IgUU8LANn5BHmd0vIKf',
	body: function (response, options, event, context) {
	  switch (options.directive) {
	    case 'open':
		  var issuesList = [];
          var issues = JSON.parse(response).issues;
          for (var i = 0; i < issues.length; i++) {
            issuesList.push({
              summary: issues[i].fields.summary,
              link: "https://betastream.atlassian.net/browse/" + issues[i].key
            });
          };
          var payloadText = "";
	      for (var j = 0; j < issuesList.length; j++) {
    	    payloadText += "<" + issuesList[j].link + "|" + issuesList[j].summary + ">";
            if (j !== issuesList.length - 1) {
              payloadText += "\n";
	        }
    	  };
	      var channel = "@" + event.user_name;
    	  var postData = JSON.stringify({
        	text: payloadText,
            channel: channel
          });

          return postData;
          break;
		case 'create':
		  var channel = "@" + event.user_name;
    	  var postData = JSON.stringify({
        	text: response,
            channel: channel
          });

          return postData;
		  break;
	  }
                
	}
  },
};