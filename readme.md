#slambda

Use Slack's Slash Commands to talk to an Amazon Lambda function. Do cool things like deploy
your apps or retrieve open issues without ever leaving your Slack room! One
Lambda Function/API Gateway pair handles all your channel's Slash Commands.

### Requirements
**Create a Lambda function**

Sign-in to your AWS console and create a Lambda function.
On the top right corner of the screen is your Lambda function's ARN. Make note of that.
   
**Create an API Gateway endpoint**

In the [API Gateway](https://aws.amazon.com/api-gateway/) console create an API with a GET method. Then,
   
* **Set your Lambda function**. Go to *Integration Request*. For Integration Type,
  choose "Lambda Function" and set Lambda Region and Lambda Function to whatever is
  appropriate for your Lambda function.
     
* **Set the Mapping Template**. While still under *Integration Request*, expand
  Mapping Templates. Click the application/json Content Type. Set the template
  to "Mapping template" by clicking the pencil icon and set it to the folllowing JSON:
     
```
     {
       "token" : "$input.params('token')",
       "team_id" : "$input.params('team_id')",
       "team_domain" : "$input.params('team_domain')",
       "channel_id" : "$input.params('channel_id')",
       "channel_name" : "$input.params('channel_name')",
       "user_id" : "$input.params('user_id')",
       "user_name" : "$input.params('user_name')",
       "command" : "$input.params('command')",
       "text" : "$input.params('text')"
    }
```
   
* **Set the CORS configuration**. Click *Method Response*, expanding 200 HTTP Status,
  and adding the following three headers under "Response Headers for 200": `Access-Control-Allow-Headers`,
  `Access-Control-Allow-Methods`, and `Access-Control-Allow-Origin`. Then, go back to
  *Integration Response* and expand the 200 Method Response. Expand "Header Mappings"
  and set the following Mapping Values for the Response Headers that we just added.
     
     * `Access-Control-Allow-Headers: 'Content-Type,X-Amz-Date,Authorization'`
     * `Access-Control-Allow-Methods: 'GET'`
     * `Access-Control-Allow-Origin: '*'`
     
     Be sure to add the single quotes around the mapping values!
     
* **Deploy the API**. Click *Deploy API*. Set the appropriate stage (e.g. 'dev' or 'prod').
Make note of the Invoke URL.

**Create a Slash Command**

You can create a new Slash Command on the integrations page in your
team's Slack. On the configuration page, set your command's URL to whatever you the Invoke
URL is from your API Gateway. Set the method to `GET`.


##Useage

For each Slash Command you have set up, create a file in the `commands` folder with the same
name as the Slash Command. For example, if you have a `/weather` Slash Command, create a file
called `weather.js`. Your file should export an object describing the command, like so:

###### weather.js
```
module.exports = function() {
  // command configuration goes here
}
```

####Command configuration
When your Slash Command is invokved, Lambda will send an HTTP(S) request which is determined by this
configuration.
  
Each option can either be value, or a function that returns a value. If a function, you have access
to the `options` parameter, which represents the text of the Slash Command parsed according to
`parseText` option described below.

* **hostname** (required): the hostname to send the request to. e.g. 'api.google.com'
* **path** (required): the path to send the request to. When combined with the hostname option,
                       creates a full URL to send the request.
* **method**: The HTTP method to use. Defaults to `GET`.
* **port**: The port number to use. Defaults to 443.
* **protocol**: The request protocol. Defaults to 'https'
* **auth**: The auth string to use if the API requires it. Default is an empty string.
* **body**: The body of the request. Default is an empty string.
* **return**: An object representing the request to be sent once the response to the initial request
              is received. All the above options apply, except the `hostname` default is `hooks.slack.com`
              and the default method is `POST`.
* **parseText**: a function which accepts the text of the slash command as a parameter, and returns
                 an object representing the parsed value of that string to be made available to the
                 configuration options described above.
                 
* In addition to the `options` parameter, the `event` and `context` parameters are also provided to each option.

**Example slambda module configuration**
###### weather.js
```
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
    path: '/services/T024Z4ACR/B0BFTLKCJ/XZRz7IgUU8LANn5BHmd0vIKf',
	body: function (response, options, event, context) {
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
```

#### Default parseText option
By default, Slash Command text is parsed with the following rules:

* All text before the first space represents a `directive`.
* After the `directive`, you can specify options
  * Single-dash-prefix represents a variable to be assigned the value after the space immediate after it
  * Double-dash-prefexi represents a varaible to be assigned the boolean value `true`
  
e.g.
`/weather 21146 -country USA --short`

returns an `options` object which looks like this:
```
{
  directive: '21146',
  country: 'USA',
  short: true
}
```

#### Settings and Tokens

In a file `settings.js`, create a settings object for each command you create. You must provide
the Slash Command token for each command. e.g.

###### settings.js
```
module.exports = {
  'weather': {
    token: 'myCoolSlashCommandToken'
  }
}
```

Set any other sensitive information here as well, such as an auth string.

#### Test the Lambda Function

`$ grunt lambda_invoke`

#### Package the Lambda Function

`$ grunt lambda_package`

It will then be stored as a ZIP file in the `dist` folder.

#### Deploy the Lambda Function
You can use Grunt to deploy your Lambda function. In the project folder,
create a file `.aws/credentials`. Set your AWS access key
and secret access key, like so:
   
```
[default]
aws_access_key_id = <YOUR_ACCESS_KEY_ID>
aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>
```
   
See [this document](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html) for more information.

Then type

`$ grunt lambda_deploy`

You can also upload the package manually.
