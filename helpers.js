module.exports = {
  isDefined: function(data) {
    return !(typeof data == 'undefined');
  },
  isFunction: function(data) {
    return typeof data == 'function';
  },
  getRequestOption: function(name, command, options, event, context, response) {
  	var isDefined = function(data) { return !(typeof data == 'undefined'); }
  	var isFunction = function(data) { return typeof data == 'function'; }
    
    var object = isDefined(response) ? command.return : command;
    
  	if (isDefined(object[name])) {
      if (isFunction(object[name])) {
        if (isDefined(response)) {
          return object[name](response, options, event, context);
        }
        else {
          return object[name](options, event, context);
        }
      }
      else {
      	return object[name];
      }
  	}
  	else {
  	  return '';
  	}
  },
  parseText: function(text) {
  	var options = text.split(" ");
  	var directive = options.shift();
    
    var returnOptions = {
      directive: directive
    };
  	var jump = 1;
  	var dashCount;
  	var option;
    var firstChar = "";
    var lastChar = "";
    var j = 0;
    var selection;
  	for (var i = 0; i < options.length; i += jump) {
  	  jump = 1;
  	  dashCount = 0;
  	  option = options[i];
  	  while (option.substr(0, 1) == '-') {
        option = option.substr(1);
        dashCount++;
  	  }
  	  if (dashCount == 1) {
        firstChar = options[i+1].substr(0, 1);
        lastChar = options[i+1].substr(-1)
        if (firstChar == "'" || firstChar == '"') {
          for (j = i; j < options.length; j++) {
            if (options[j].substr(-1) == firstChar) {
              break;
            }
          }
          selection = options.slice(i+1, j+1);
          returnOptions[option] = selection.join(' ').replace(RegExp(firstChar, 'g'), '');
          jump = j - i;
        }
        else {
          returnOptions[option] = options[i+1];
          jump = 1;
        }
  	  }
  	}

  	return returnOptions;
  }
}