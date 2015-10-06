#slambda

Use Slack's slash commands to talk to an Amazon Lambda function.

### Requirements
1. Set your AWS credentials

   In the project folder, create a file `.aws/credentials`. Set your AWS access key
   and secret access key, like so:
   
   ```
   [default]
   aws_access_key_id = <YOUR_ACCESS_KEY_ID>
   aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>
   ```
   
   See [this document](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html) for more information.
   
1. Create a Lambda function

   Sign-in to your AWS console and create a Lambda function.
   On the top right corner of the screen is your Lambda function's ARN. Make note of that.
   
2. Create a Gateway API endpoint

   

3. Create a slash command

##Useage

For each slash command you have set up, create a file in the `commands` folder with the same
name as the slash command. For example, if you have a `/weather` slash command, create a file
called `weather.js`. Your file should export an object describing the command, like so:

weather.js
```
module.exports = function() {
  // command configuration goes here
}
```

Command configuration

Package your lambda function:

`$ grunt lambda_package`

It will then be stored as a ZIP file in the `dist` folder.

From here you can upload it manually or use

`$grunt lambda_deploy`

to let Grunt take care of it.