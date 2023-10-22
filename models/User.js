const  mongoose =require('mongoose');
const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    avatar:{
        type:String
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
        default:'abcde'
    },
});

module.exports = mongoose.model('User',userSchema);