"use strict";

var user = "https://www.oschina.net/action/apiv2/user_info";
var friend = "https://www.oschina.net/action/apiv2/user_follows";
var send_messages = "https://www.oschina.net/action/apiv2/messages_pub";
var get_messages = "https://www.oschina.net/action/apiv2/messages";

var __api = {
    getUser: function getUser(callback) {
        this.request({ url: user }, callback);
    },
    getFriend: function getFriend(data, callback) {
        this.request({ url: friend, data: data }, callback);
    },
    getMessage: function getMessage(data, callback) {
        this.request({ url: get_messages, data: data }, callback);
    },
    sendMessage: function sendMessage(data, callback) {
        this.request({ url: send_messages, data: data }, callback);
    },
    request: function request(options, callback) {
        $.ajax({
            url: options.url,
            data: options.data,
            dataType: 'json',
            async: options.async || false,
            success: function success(res) {
                if (res.code > 0) {
                    callback && callback(res.result);
                } else {
                    layer.msg(res.message);
                }
            },
            error: function error() {
                layer.msg("接口错误...");
            }
        });
    }
};
"use strict";

$(document).ready(function () {
    var store = new Storage();

    loadExtension();
    function loadExtension() {
        var $html = $('html');
        var $document = $(document);
        var _data = {};
        _data.mine = {};
        _data.mine.id = $("#tweet").find("input[type='hidden']:eq(1)").val();
        if (!_data.mine.id) {
            //未登录，不显示
            return;
        }
        //获取当前登录者信息
        __api.getUser(function (result) {
            _data.mine.username = result.name;
            _data.mine.avatar = result.portrait;
            _data.mine.sign = result.desc;
            _data.mine.status = "online";
        });
        //获取好友列表
        _data.friend = [{ "groupname": "我的好友", "id": 1, "online": 0, list: [] }];
        __api.getFriend({ id: _data.mine.id }, function (result) {
            _data.friend[0].online = result.items.length;
            layui.each(result.items, function (index, item) {
                _data.friend[0].list.push({
                    username: item.name,
                    id: item.id,
                    avatar: item.portrait,
                    sign: item.desc
                });
            });
        });

        //群组
        _data.group = [];
        layui.layim.config({
            title: _data.mine.username,
            init: {
                data: function data(options, callback, tips) {
                    callback && callback(_data || {});
                }
            }
        });
        //监听发送消息
        layui.layim.on('sendMessage', function (record) {
            var To = record.to;
            __api.sendMessage({ authorId: To.id, content: record.mine.content }, function () {
                //发送成功
            });
        });

        //监听聊天窗口的切换
        layui.layim.on('chatChange', function (record) {
            //第一次打开 获取历史数据gulp chrome
            var local = layui.layim.cache();
            if (!local.chatlog || !local.chatlog.hasOwnProperty("friend" + record.data.id) || local.chatlog["friend" + record.data.id].length == 0) {
                __api.getMessage({ authorId: record.data.id }, function (result) {
                    layui.each(result.items, function (index, item) {
                        layui.layim.pushChatlog({
                            username: item.sender.name,
                            avatar: item.sender.portrait,
                            id: record.data.id,
                            type: "friend",
                            content: item.content,
                            mine: _data.mine.id == item.sender.id,
                            fromid: item.sender.id,
                            timestamp: new Date(item.pubDate).getTime()
                        });
                    });
                    //layui.layim.viewChatlog()
                });
            }
        });
        //监听消息
        layui.layim.on('ready', function (res) {});
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