module.exports = {
  isDefined: function(data) {
    return !(typeof data == 'undefined');
  },
  isFunction: function(data) {
    return typeof data == 'function';
  },
  getRequestOption: function(name, command, options, event, context) {
  	var isDefined = function(data) { return !(typeof data == 'undefined'); }
  	var isFunction = function(data) { return typeof data == 'function'; }

  	if (isDefined(command[name])) {
      if (isFunction(command[name])) {
      	return command[name](options, event, context);
      }
      else {
      	return command[name];
      }
  	}
  	else {
  	  switch (name) {
  	  	case 'port':
  	  	  return 443;
  	  	  break;
  	  	case 'method':
  	  	  return 'GET';
  	  	  break;
  	  	case 'auth':
  	  	  return '';
  	  	  break;
  	  	case 'body':
  	  	  return '';
  	  	  break;
        case 'protocol':
          return 'https';
          break;
  	  	default:
  	  	  return '';
  	  	  break;
  	  }
  	}
  },
  getReturnRequestOption: function(name, command, response, options, event, context) {
  	var isDefined = function(data) { return !(typeof data == 'undefined'); }
  	var isFunction = function(data) { return typeof data == 'function'; }

  	if (isDefined(command.return[name])) {
      if (isFunction(command.return[name])) {
      	return command.return[name](options, response, event, context);
      }
      else {
      	return command.return[name];
      }
  	}
  	else {
  	  switch (name) {
  	  	case 'port':
  	  	  return 443;
  	  	  break;
  	  	case 'method':
  	  	  return 'GET';
  	  	  break;
  	  	case 'auth':
  	  	  return '';
  	  	  break;
  	  	case 'body':
  	  	  return '';
  	  	  break;
        case 'protocol':
          return 'https';
          break;
  	  	default:
  	  	  return '';
  	  	  break;
  	  }
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
  	for (var i = 0; i < options.length; i += jump) {
  	  jump = 1;
  	  dashCount = 0;
  	  option = options[i];
  	  while (option.substr(0, 1) == '-') {
        option = option.substr(1);
        dashCount++;
  	  }
  	  if (dashCount == 1) {
        returnOptions[option] = options[i+1];
        jump = 1;
  	  }
  	  else if (dashCount == 2) {
  	  	returnOptions[option] = true;
  	  	jump = 2;
  	  }
  	}

  	return returnOptions;
  }
}