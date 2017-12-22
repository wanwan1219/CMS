/**
 * Created by 000 on 2017/11/21.
 */
/*1.找到数据库
2.连接数据库  封装函数 mongoClient.connect("数据库地址",callback)
*/
//引入被抛出的settings模块
var setting=require("./settings.js");
//引入mongodb
var mongoclient=require("mongodb").MongoClient;
//封装公用的数据库函数
function ConnectDb(callback){
    var url=setting.dbUrl;
    mongoclient.connect(url,function(err,db){
        if(err){
            //参数
            callback(err,null);
            return
        }
        callback(err,db)

    })
}
//增
exports.add=function(collName,json,callback){
    ConnectDb(function(err,db){
        //只要有错误都会走上面的if(err){} 不需要单独判断
        db.collection(collName).insert(json,function(err,result){
            //也不需要判断err 所有的err都会走上面的判断 只是判断的不同
            callback(err,result);
            db.close()
        })
    })
};
//删
exports.del=function(collName,json,callback){
    ConnectDb(function(err,db){
        db.collection(collName).remove(json,function(err,result){
            callback(err,result);
            db.close()
        })
    })
};
//改
exports.change=function(collName,json,callback){
    ConnectDb(function(err,db){
        db.collection(collName).update(json[0],json[1],function(err,result){
            /*fa表示是否全改 false不全改*/
            callback(err,result);
            db.close()
        })
    })
};
//查
exports.find=function(collName,json,callback){
    ConnectDb(function(err,db){
        var data=db.collection(collName).find(json).toArray(function(err,result){
            callback(err,result);
            db.close();
        });
    })
};
exports.findObj=function(collName,json,c,d){
    //判断参数的个数
    if(arguments.length==3){
        //没有参数d，代表的是callback
        var callback=c;
        //个数限制
        var limit=0;
        //跳过当前页最后一条数据的下标
        var skipnum=0;
    }else if(arguments.length==4){
        var callback=d;
    //    args是一个数组对象  可以传递多个  页数
        var args=c;
        var limit=args.pageNumber || 0;
        var skipnum=limit * args.page;
        var sort=args.sort || {};
    }else{
        throw err;
        return
    }
    ConnectDb(function(err,db){
       db.collection(collName).find(json).limit(limit).skip(skipnum).sort(sort).toArray(function(err,result){
            callback(err,result);
            db.close();
       });
    })
};


