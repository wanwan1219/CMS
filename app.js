/**
 * Created by 000 on 2017/11/22.
 */
//作为启动文件 express里面的路由
//加载express模块
var express=require("express");
//加载path模块 处理路径
var path=require("path");
//中间件 处理post的中间件
var bodyparser=require("body-parser");
//处理cookie
/*特点：1.cookie不加密，用户可以随时访问
2.可以被用户删除
3.可以被篡改
4.cookie可以用于攻击
5.cookie的存储量比较小未来即将被local storage替代（local storage仅支持ie9以上）*/
var cookieparser=require("cookie-parser");
//处理日志
var logger=require("morgan");
//session
var session=require('express-session');
//connect-flash 用于req或res请求回来的信息并存储在session中
var flash=require("connect-flash");
//加载接口文件index
var index=require("./routes/index");/*index.js 后缀可以省略*/
//加载初始数据文件
var db=require('./routes/db');
//入口函数
var app=express();
//解决跨域问题 防止中文乱码
app.use(function(req,res,next){
    //允许地址跨域访问 访问控制允许来源 *表示所有
   res.header("Access-Control-Allow-Origin","*");
    //允许接口的请求跨域
    res.header("Access-Control-Allow-Credentials",true);
    //允许的发送方式
   res.header("Access-Control-Allow-Method",'PUT,GET,POST,DELETE,OPTIONS');
    //设置内容类型
   res.header("Access-Control-Allow-Headers","Content-type");
    //设置允许的请求
   res.header("Access-Control-Allow-Headers","X-Requested-with");
    //请求头编码
    res.header("Content-type","text/plain;charset=utf-8");
    //next() 能让错误显示出来
    next()
});
//使用之前定义的中间件
app.use(logger('dev'));
//处理json
app.use(bodyparser.json());
//解决form表单发送的请求
app.use(bodyparser.urlencoded({extended:false}));
//处理cookie
app.use(cookieparser());
//设置session
app.use(session({
    name:'FCHT',//设置cookie读取的名称 默认name是connect.id
    secret:'FCHT',//设置加密字符串 后面字段必须有 必须有这个属性
    cookie:{maxAge:300000000},//设置cookies的时长 毫秒为单位
    resave:false,//每次请求时都重置session
    saveUninitialized:false //每次执行时都要初始化
}));
app.use(flash());
/*app.use(function(req,res,next){
    res.locals.errors=req.flash("error");
    res.locals.infos=req.flash("info");
    next()
});*/
//静态资源加载
app.use(express.static(path.join(__dirname,'public')));
//设置路由
app.use('/Handler',index);
//暴露app
module.exports=app;
