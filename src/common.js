$(document).ready(() => {
    const store = new Storage()
    
    loadExtension()
    function loadExtension() {
        const $html = $('html')
        const $document = $(document)
        const data = {}
        data.mine = {}
        data.mine.id = $("#tweet").find("input[type='hidden']:eq(1)").val()
        if(!data.mine.id){
            //未登录，不显示
            return;
        }
        //获取当前登录者信息
        __api.getUser(function (result) {
            data.mine.username = result.name
            data.mine.avatar = result.portrait
            data.mine.sign = result.desc
            data.mine.status = "online"
        })
        //获取好友列表
        data.friend = [
            {"groupname": "我的好友","id": 1,"online": 0, list:[]}
        ]
        __api.getFriend({id:data.mine.id}, function (result) {
            data.friend[0].online = result.items.length
            layui.each(result.items,function (index, item) {
                data.friend[0].list.push({
                    username: item.name,
                    id: item.id,
                    avatar: item.portrait,
                    sign: item.desc,
                })
            })
        })
        
        //群组
        data.group = []
        layui.layim.config({
            title: data.mine.username,
            init: {
                data : function (options, callback, tips) {
                    callback && callback(data||{})
                },
            }
        })
        //监听发送消息
        layui.layim.on('sendMessage', function(record) {
            var To = record.to;
            __api.sendMessage({authorId:To.id,content:record.mine.content},function () {
                //发送成功
            })
        })
        
        //监听聊天窗口的切换
        layui.layim.on('chatChange', function(record){
            //第一次打开 获取历史数据gulp chrome
            var local = layui.layim.cache()
            if(!local.chatlog || !local.chatlog.hasOwnProperty("friend" + record.data.id) || local.chatlog["friend" + record.data.id].length == 0){
                __api.getMessage({authorId:record.data.id},function (result) {
                    layui.each(result.items,function (index, item) {
                        layui.layim.pushChatlog({
                            username: item.sender.name,
                            avatar: item.sender.portrait,
                            id: record.data.id,
                            type: "friend",
                            content: item.content,
                            mine: data.mine.id == item.sender.id,
                            fromid: item.sender.id,
                            timestamp: new Date(item.pubDate).getTime()
                        });
                    })
                    //layui.layim.viewChatlog()
                })
            }
        });
        //监听消息
        layui.layim.on('ready', function(res){
        
        })
    }
})