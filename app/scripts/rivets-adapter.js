/* globals rivets:false */
'use strict';

rivets.adapters[':'] = {
  subscribe: function(obj, keypath, callback) {
    obj.on('change:' + keypath, callback);
  },
  unsubscribe: function(obj, keypath, callback) {
    obj.off('change:' + keypath, callback);
  },
  read: function(obj, keypath) {
    return obj.get(keypath);
  },
  publish: function(obj, keypath, value) {
    obj.set(keypath, value);
  }
};

rivets.binders.template = function (el, value) {
  var tmplDom = document.getElementById(this.keypath),
      tmplHtml = tmplDom.innerHTML;

  el.innerHTML = tmplHtml;
};

rivets.formatters.telLink = function (value) {
  return 'tel:' + value.toString();
};

rivets.formatters.isEmpty = function (value) {
  return value.length > 0 ? false : true;
};

rivets.formatters.optionChoiceType = function (isMandatory) {
  if (isMandatory) {
    return "radio";
  }

  return "checkbox";
};

rivets.formatters.length = function (value) {
  if (value) {
    return value.length
  }

  return 0;
};

rivets.formatters.currency = function (value) {
  return "$" + value.toFixed(2);
};