var fs = require('fs');
//读取配置文件，变量config的类型是Object类型
var config = require('./config.json');
var globals = require('./globals.json');
//获取变量publickey的值
for (var i=0;i<globals["values"].length;i++){
//    判断获取的数组里面是否有publickey，如果有就获取值，并将文件写进public.pem，结束循环
    if (globals["values"][i]["key"]=="publickey"){
        fs.writeFile("./public.pem",globals["values"][i]["value"],err => {
            if(err==null)
                console.log("输出文件成功")
            }
        )
    }
};

