module.exports = {
  hostname: 'betastream.atlassian.net',
  port: 443,
  auth: global.settings.jira.auth, // make sure to put your auth stuff in the settings file!
  method: 'GET',
  path: function(options, event, context) {
    switch (options.directive) {
      case 'open':
        return '/rest/api/2/search?jql=resolution=null';
	  	break;
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
	  }
                
	}
  },
};