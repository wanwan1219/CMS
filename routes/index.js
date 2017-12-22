/**
 * Created by 000 on 2017/11/22.
 */
//编写接口文件
var express=require('express');
//加载express路由
var router=express.Router();
//加载数据模型
var db=require('./db');
var fs=require('fs');
//引入加密模块
var crypto=require('crypto');
//迭代处理id
var ObjectId=require('mongodb').ObjectId;
//引入时间模块
var date=require("silly-datetime");
//封装一个函数 为了后面存储登陆信息
function User(user){
    this.name=user.name;
    this.password=user.password;
    this.id=user.id;
    this.veri=user.veri;
}
/*需求：验证码；
 * 1.登录用户 user：id username password veri
 * 2.express中的路由 去实现接口的编写
 *   2.1方式：get、post
 *   2.2返回验证码的长度
 *   2.3验证码为字母和数字结合
 * */
//获取验证码
//var sessionHT;
router.get('/AdminLoginRegHandler',function(req,res){
    var actions=req.query.actions;
    switch(actions){
        case "veri":
            var randomNum=function(min,max){
                return Math.ceil(Math.random()*(max-min)+min)
            };
            var str='QWERTYUIOPASDFGHJKLZXCVBNM1234567890';
            var returnStr='';
            for(var i=0;i<4;i++){
                returnStr+=str[randomNum(0,str.length-1)]
            }
            //user是后台存储下来的字段
            var user=new User({
                name:"",
                password:"",
                id:"",
                veri:returnStr
            });
            //用flash 里面的 user存储
            req.flash.user={
                name:"",
                password:"",
                id:"",
                veri:returnStr
            };
            //console.log(req.flash.user);
            //sessionHT=req.session.user;
            res.send({'success':"OK","data":returnStr});
            break;
        case "checkveri":
            //console.log(req.flash.user);
            //判断flash里面必须存储了user内容 而且session里面user里面的验证码要和提交的验证码相等
            if(req.flash.user&&req.flash.user.veri==req.query.veri){
                res.send({"success":"验证成功"})
            }else{
                res.send({"err":"验证失败"})
            }
            break;
        case "show":
            // var searchData={};
            // var pageData={"pageNumber":0,"page":0};
            // if(req.query.searchText){
            //     searchData={"userName":req.query.searchText}
            // }
            // if(req.query.pageStart){
            //     pageData={"pageNumber":3,"page":req.query.pageStart}
            // }
            // console.log(searchData,pageData)
            // db.findObj("admin",searchData,pageData,function(err,result){
            //     if(err){
            //         res.send({"err":"查找失败"})
            //     }else{
            //         res.send(result)
            //     }
            // })
            // break;
            db.find("admin", null, function (err,arr) {
                console.log(req.query.searchText);
                var selector = !req.query.searchText ? {
                    tokenId: {
                        $gt: arr.length - (parseInt(req.query.pageStart) * 3 - 3) - 3,
                        $lte: arr.length - (parseInt(req.query.pageStart) * 3 - 3)
                    }
                } : {turename: {$regex: '.*' + req.query.searchText + '.*', $options: 'i'}};
                db.find("admin", selector, function (err,data) {
                    if (data.length == 0) {
                        res.send({"err": "抱歉，系统中查不到人员"});
                    } else {
                        var result = {
                            success: "成功",
                            data: {
                                pageSize: 3,
                                count: arr.length,
                                list: data
                            }
                        };
                        res.send(result);
                    }
                });
            });
            break;
        default :
            res.send({"err":"路径错误"});
            break;
    }
});
router.post("/AdminLoginRegHandler",function(req,res){
    if(req.url!="/favicon.ico"){
        var actions=req.query.actions;
        switch(actions){
            case "add":/*注册*/
                db.find("admin",{"userName":req.body.userName},function(err,result){
                    if(result.length!=0){
                        res.send("该用户已存在");
                    }else{
                        db.find("admin",null,function(err,result){
                            var md5=crypto.createHash("md5");
                            var userName=req.body.userName;
                            var trueName=req.body.truename;
                            var password=md5.update(req.body.password).digest("base64");
                            var phone=/^[1]\d{10}$/.test(req.body.phone)?req.body.phone:false;
                            var creatAt=date.format(new Date(),'YYYYMMDDHHmm'); //silly-datetime
                            var update=date.format(new Date(),'YYYYMMDDHHmm');
                            var tokenId=result.length+1;
                            var isDelete=/^[fc]/.test(trueName)?false:true;/*给删除的用户添加上一个fc开头的*/
                            var powerCode=req.body.powerCode=="1"?"系统管理员":"课程管理员";
                            var power=req.body.powerCode;
                            var addDate={"userName":userName,
                                "trueName":trueName,
                                "password":password,
                                "phone":phone,
                                "creatAt":creatAt,
                                "update":update,
                                "tokenId":tokenId,
                                "isDelete":isDelete,
                                "powerCode":powerCode,
                                "power":power
                            };
                            db.add("admin",addDate,function(err,result){
                                if(err){
                                    res.send("添加失败");
                                    return
                                }
                                res.send("添加成功");
                            });
                        });
                    }
                });
                break;
            case "login":/*登陆*/
                /*var loginData={
                    userName:req.body.userName,
                    password:md5.update(req.body.password).digest("base64")
                };*/

                db.find("admin",{userName:req.body.userName},function(err,result){
                    var md5=crypto.createHash("md5");
                    if(result.length!=0){
                        if(result[0].password==md5.update(req.body.password).digest("base64")){
                            req.flash.user.name=result[0].userName;
                            req.flash.user.password=result[0].password;
                            req.flash.user.id=result[0]._id;
                            res.send({"success":"登录成功"});
                        }else{
                            res.send({"default":"密码错误"});
                        }
                    }else{
                        res.send({"err":"用户不存在"})
                    }
                });
                break;
            case "returninfo":/*返回用户信息*/
                var id=req.flash.user.id;
                var newId=new ObjectId(id);
                db.find("admin",{"_id":newId},function(err,result){
                   res.send({"success":result[0]})
                });
                break;
            case "updatepass":/*修改密码*/
                var md5=crypto.createHash("md5");
                var oldpass=md5.update(req.body.oldpassword).digest("base64");
                if(oldpass==req.flash.user.password){
                    var md5=crypto.createHash("md5");
                    var newpass=req.flash.user.password=md5.update(req.body.newpassword).digest("base64");
                    var update=date.format(new Date(),'YYYYMMDDHHmm');
                    //req.flash.user.password=newpass;
                    var select=[{"userName":req.flash.user.name},{$set:{"password":newpass,"updata":update}}];
                    db.change("admin",select,function(err,result){
                        console.log(result);
                        if(result.result.n==0){
                            res.send({"err":"修改失败"})
                        }else{
                            res.send({"success":"修改成功"})
                        }
                    });
                }else{
                    res.send({"err":"原密码输入错误"})
                }
                break;
            default :
                res.send({"err":"路径错误"})
        }
    }
});
router.get("/AdminHandler",function(req,res){
    var action=req.query.actions;
    switch (action){
        case "quit":
            if(req.flash.user){
                req.flash.user={}
            }
            res.send({"success":"退出成功"});
            break;
        default :
            res.send({"err":"路径错误"})
    }
});

module.exports=router;
/*在package.json文件中script字段写入一个start 启动的时候就写成npm start;
 换成其他字段必须用npm run 字段启动;
 在相应的字段的值的位置写上 node ./bin/www;*/


