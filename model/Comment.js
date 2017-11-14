/**
 * Created by hama on 2017/9/18.
 */
//二级回复表
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
//将基础的方法引入进来
const BaseModel = require('./base_model');
const CommentSchema = new Schema({
    _id:{
        type:String,
        default:shortid.generate,
        unique:true
    },
    //上级 对应的上级一级回复ID
    reply_id:{
        type:String,
        ref:'Reply'
    },
    //二级回复的作者
    author:{
        type:String,
        ref:'User',
    },
    //回复对应的人
    comment_target_id:{
        type:String,
        ref:'User',
    },
    //问题的id
    question_id:{
        type:String,
        ref:"Question"
    },
    //内容
    content:{
        type:String,
    },
    //发布时间
    create_time:{
        type:Date,
        default:Date.now
    },
    //点赞的人
    likes:{
        type:[String],
        ref:'User'
    }
})
//当前的模型就会有BaseModel里面的方法了.
CommentSchema.plugin(BaseModel);
CommentSchema.statics = {
    getTotalsByReplyId:function (reply_id,callback) {
        Comment.find({'reply_id':reply_id},'',{sort:'create_time'}).populate('author')
            .populate('comment_target_id').populate('question_id').exec(callback)
    },
    getCommentsByReplyId:function (reply_id,callback) {
        Comment.find({'reply_id':reply_id},'',{sort:'create_time'}).populate('author')
            .populate('comment_target_id').populate('question_id').limit(5).exec(callback)
    },
    //显示分页后的 二级回复列表
    showCommentsPage:(reply_id,startNum,limit,callback)=>{
        Comment.find({'reply_id':reply_id},'',{sort:'create_time'}).populate('author')
            .populate('comment_target_id').populate('question_id').skip(startNum).limit(limit).exec(callback)
    }
};
const Comment = mongoose.model('Comment',CommentSchema);
module.exports = Comment
