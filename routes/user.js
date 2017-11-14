/**
 * Created by hama on 2017/9/18.
 */
//引入动态的CSS设置
const mapping = require('../static');
const formidable = require('formidable');
const moment = require('moment');
const fs = require('fs');
const gm = require('gm');
//引入User
const User = require('../model/User');
//引入Question
const Question = require('../model/Question');
//引入Reply
const Reply = require('../model/Reply');
const validator = require('validator');
//个人设置的处理函数
exports.setting = (req,res,next)=>{
    res.render('setting',{
        title:'用户设置页面',
        layout:'indexTemplate',
        resource:mapping.userSetting
    })
}
//更新头像的处理函数
exports.updateImage = (req,res,next)=>{
    //初始化
    let form = new formidable.IncomingForm();
    form.uploadDir = 'public/upload/images/';
    let updatePath = 'public/upload/images/';
    let smallImgPath = "public/upload/smallimgs/";
    let files = [];
    let fields = [];
    form.on('field',function(field,value){
        fields.push([field,value]);
    }).on('file',function(field,file){
        //文件的name值
        //console.log(field);
        //文件的具体信息
        //console.log(file);
        files.push([field,file]);
        let type = file.name.split('.')[1];
        let date = new Date();
        let ms = moment(date).format('YYYYMMDDHHmmss').toString();
        let newFileName = 'img' + ms + '.' + type;
        fs.rename(file.path,updatePath + newFileName,function(err){
            var input = updatePath + newFileName;
            var out = smallImgPath + newFileName;
            gm(input).resize(100,100,'!').autoOrient().write(out, function (err) {
                if(err){
                    console.log(err);
                }else{
                    console.log('done');
                    //压缩后再返回，否则的话，压缩会放在后边，导致链接失效
                    return res.json({
                        error:'',
                        initialPreview:['<img src="' + '/upload/smallimgs/' + newFileName + '">'],
                        url:out
                    })
                }
            });
        })
    })
    form.parse(req);
}
//更新个人资料的处理函数
exports.updateUser = (req,res,next)=>{
    let id = req.params.id;
    let motto = req.body.motto;
    let avatar = req.body.avatar;
    let error;
    if(!validator.isLength('motto',0)){
        error = '个性签名不能为空';
    }
    if(!validator.isLength('avatar',0)){
        error = '头像的地址不能为空';
    }
    if(error){
        res.end(error);
    }else{
        //查询数据库对应用户信息
        User.getUserById(id,(err,user)=>{
            if(err){
                return res.end(err);
            }
            if(!user){
                return res.end('用户不存在');
            }
            user.update_time = new Date();
            user.motto = motto;
            user.avatar = avatar;
            user.save().then((user)=>{
                req.session.user = user;
                return res.end('success');
            }).catch((err)=>{
                return res.end(err);
            })
        })
    }
}
//用户排名
exports.all = (req,res,next)=>{
    res.render('users',{
        title: '用户界面',
        layout: 'indexTemplate',
    })
}
//个人信息
exports.index = (req,res,next)=>{
    //得到用户的姓名
    let name = req.params.name;
    //根据用户的姓名，查到用户的所对应的信息
    User.getUserByName(name,(err,user)=>{
        if(!user){
            return res.render('error',{
                error:'',
                message:'该用户不存在的'
            })
        }else {
            let query = {author:user._id};
            let opt = {limit:5,sort:'-create_time'};
            //1.这个用户发布的文章 Question 表
            Question.getQuestionByQuery(query,opt,(err,questions)=>{
                if(err){
                    return res.render('error',{error:err,message:''});
                }
                //2.这个用户回复过的问题的Reply表
                Reply.getRepliesByAuthorId(user._id,{limit:5,sort:'-create_time'},(err,replies)=>{
                  return  res.render('user-center',{
                        title: '个人中心界面',
                        layout: 'indexTemplate',
                        resource:mapping.userCenter,
                        user:user,
                       questions2:questions,
                       replies:replies
                    })
                })
            })
        }
    })


}
//发布问题列表
exports.questions = (req,res,next)=>{
    //用户发布所有的问题列表
    let name = req.params.name;
    User.getUserByName(name,(err,user)=>{
        if(!user){
            return res.res.render('error',{
                error:'',
                message:'该用户不存在啊'
            })
        }else {
            let query = {author:user._id};
            let opt = {sort:'-create_time'};
            Question.getQuestionByQuery(query,opt,(err,questions)=>{
                if(err){
                    return res.render('error',{error:err,message:''});
                }
                res.render('userCenter-questions',{
                    title:'个人中心页面',
                    layout:'indexTemplate',
                    resource:mapping.userCenter,
                    user:user,
                   questions2:questions,
                })
            })
        }
    })
}
//回复问题列表
exports.replys = (req,res,next)=>{
    //得到用户的姓名
    let name = req.params.name;
    //根据用户的姓名 查到用户所对应的信息
    User.getUserByName(name,(err,user)=>{
        if(!user){
            return res.render('error',{
                error:'',
                message:'该用户不存在的'
            })
        }else {
            //2.这个用户回复过的问题
            Reply.getRepliesByAuthorId(user._id,{sort:'-create_time'},(err,replies)=>{
                return res.render('userCenter-replys',{
                    title:'个人中心页面',
                    layout:'indexTemplate',
                    resource:mapping.userCenter,
                    replies:replies,
                    user:user
                })
            })
        }
    })

}


