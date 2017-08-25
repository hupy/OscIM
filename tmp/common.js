'use strict';

var TEMPLATE = '<div>\n' + '\n' + '</div>\n' + '';
"use strict";

$(document).ready(function () {
    var store = new Storage();

    loadExtension();
    function loadExtension() {
        var $html = $('html');
        var $document = $(document);
        layui.layim.config({
            init: {
                data: {
                    "mine": {
                        "username": "纸飞机",
                        "id": "100000",
                        "status": "online",
                        "sign": "在深邃的编码世界，做一枚轻盈的纸飞机",
                        "avatar": "http://cdn.firstlinkapp.com/upload/2016_6/1465575923433_33812.jpg"
                    },
                    "friend": [], "group": []
                }
            }
        });
    }
});
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Storage = function () {
  function Storage() {
    _classCallCheck(this, Storage);
  }

  _createClass(Storage, [{
    key: "set",
    value: function set(key, val, cb) {
      localStorage.setItem(key, JSON.stringify(val));
      if (cb) cb();
    }
  }, {
    key: "get",
    value: function get(key, cb) {
      var val = parse(localStorage.getItem(key));
      if (cb) cb(val);else return val;

      function parse(val) {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
    }
  }]);

  return Storage;
}();
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
  var oldSet = Storage.prototype.set;
  Storage.prototype.set = function (key, val, cb) {
    this._cache = this._cache || {};
    this._cache[key] = val;

    var shared = ~key.indexOf('.shared');
    if (shared) chrome.storage.local.set(_defineProperty({}, key, val), cb || Function());else oldSet.call(this, key, val, cb);
  };

  var oldGet = Storage.prototype.get;
  Storage.prototype.get = function (key, cb) {
    this._cache = this._cache || {};
    if (!cb) return this._cache[key];

    var shared = ~key.indexOf('.shared');
    if (shared) chrome.storage.local.get(key, function (item) {
      return cb(item[key]);
    });else oldGet.call(this, key, cb);
  };
})();