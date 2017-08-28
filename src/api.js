const user = "https://www.oschina.net/action/apiv2/user_info"
const friend = "https://www.oschina.net/action/apiv2/user_follows"
const fans = "https://www.oschina.net/action/apiv2/user_fans"
const send_messages = "https://www.oschina.net/action/apiv2/messages_pub"
const get_messages = "https://www.oschina.net/action/apiv2/messages"

const __api = {
    getUser : function (callback) {
        this.request({url:user}, callback)
    },
    getFriend : function (data,callback) {
        this.request({url:friend,data:data}, callback)
    },
    getFans : function (data,callback) {
        this.request({url:fans,data:data}, callback)
    },
    getMessage : function (data,callback) {
        this.request({url:get_messages,data:data},callback)
    },
    sendMessage : function (data,callback) {
        this.request({url:send_messages,data:data},callback)
    },
    request : function (options, callback) {
        $.ajax({
            url:options.url,
            data:options.data,
            dataType: 'json',
            async: options.async || false,
            success:function (res) {
                if(res.code > 0){
                    if(res.code == 404){
                        return;
                    }
                    callback && callback(res.result)
                }else {
                    res.message != 'fail' ? layer.msg(res.message) : false
                }
            },
            error:function () {
                layer.msg("接口错误...")
            }
        });
    }
}