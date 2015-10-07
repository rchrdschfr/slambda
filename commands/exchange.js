module.exports = {
  hostname: 'api.fixer.io',
  port: 80,
  method: 'GET',
  protocol: 'http',
  path: function(options, event, context) {
        var path = "/latest?base=USD&symbols=" + options.directive.toUpperCase();
        return path;
      },
      return: {
          hostname: 'hooks.slack.com',
          port: 443,
          path: '/services/T024Z4ACR/B0BFTLKCJ/XZRz7IgUU8LANn5BHmd0vIKf',
          method: 'POST',
          body: function (options, response, event, context) {
            var rates = JSON.parse(response).rates;
                var text = "1 USD = " + rates[options.directive.toUpperCase()] + " " + options.directive.toUpperCase();
              var channel = "@" + event.user_name;
              var postData = JSON.stringify({
                text: text,
                  channel: channel
                });

                return postData;
          }
         },
      
  
};