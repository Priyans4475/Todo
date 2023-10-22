const express=require('express');
const router=express.Router();
const User = require('../models/user');
const bcryptjs=require('bcryptjs');
const user_jwt=require('../middleware/user_jwt');
const jwt =require('jsonwebtoken');
const { token } = require('morgan');
const user = require('../models/user');

const nodemailer=require("nodemailer");
const randomstring=require("randomstring");
const config = require('../config/config');

const sendresetPasswordMail=async(username,email,token,res)=>{
    try {
       const transporter= nodemailer.createTransport({
        host:'smtp.ethereal.email',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user: 'kavon.jacobi79@ethereal.email',
            pass: 'rXsNWFjE6AHjxyeFtj'
        }

        }); 

        const mailoptions={
            from:'"Priyanshu"<Priyanshu@gmail.com>',
            to:email,
            subject:'For reset Password',
            html:'<p>Hii '+username+',Please copy the link <a href="http://localhost:3000/api/todo/auth/resetPassword?token='+ token +'">and reset your password </a>'
              
        }
        transporter.sendMail(mailoptions,function(error,info){
            if(error)
            {
              console.log(error);
            }
            else
            {
                console.log("mail has been sent",info.response);
            }

        });
    } catch(error) {
        res.status(400).send({success:false,msg:error.message});
    }
}

const securePassword=async(password)=>{
    try {
        const passHash=await bcryptjs.hash(password,10);
        return passHash;
    } catch (error) {
        res.status(400).send(error.message);
    }
}


router.get('/',user_jwt,async(req,res,next)=>
{
    try{
        const user= await User.findById(req.user.id).select('-password');
        res.status(200).json({
            success:true,
            user:user
        });


    }
    catch(error)
    {
        console.log(error.message);
        res.status(500).json({
            success:false,
            msg:'server error'
        })
        next();
    }
})


router.post('/register',async(req,res,next)=>
{
    // res.json({
    //     msg:'working'
    // });
    // console.log(req.body);
    const {username,email,password}=req.body;
    try{
        let user_exit=await User.findOne({email:email});
        if(user_exit){
           return res.status(400).json({
                success:false,
                msg:'user already exit'
            });
        }
        let user=new User();
        user.username =username;
        user.email =email;

        const salt= await bcryptjs.genSalt(10);
        user.password =await bcryptjs.hash(password,salt);
        
        let size=200;
        user.avatar="https://gravatar.com/avatar/?s="+size+'&d=retro';

        await user.save();

        const payload={
            user :{
                id:user.id
            }
        }

         jwt.sign(payload,process.env.jwtUserSecret,{
            expiresIn:360000
        },(err,token)=>{
            if(err) throw err;
            return res.status(200).json({
                success: true,
                token: token
            })
        })

        // res.json({
        //     success:true,
        //     msg:'user registered',
        //     user:user
        // })
    }
    catch(err){
        console.log(err);
    }
    
});

router.post('/login',async(req,res,next)=>{
    const email=req.body.email;
    const password=req.body.password;

    try{
        let user= await User.findOne({
            email:email
        });

        if(!user)
        {
            res.status(400).json({
                success:false,
                msg:'user not exit , please your ID'
            });
        }

        const isMatch=await bcryptjs.compare(password,user.password);

        if(!isMatch)
        {
            return res.status(400).json({
                success:false,
                msg:'Invalid Password'
            });
        }

        const payload={
            user:{
                id:user.id
            }
        }

        jwt.sign(payload,process.env.jwtUserSecret,{
            expiresIn:360000
        },(err,token)=>{
            if(err) throw err;
            res.status(200).json({
                success:true,
                msg:'user logged in',
                token:token,
                user:user
            });
        })

    }
    catch(error){
        console.log(error.message);
        res.status(500).json({
            success:false,
            msg:'server error'
        })
    }
});

router.post('/forgotPassword',async(req,res)=>{
    try {
        const email=req.body.email;
        const userData=await User.findOne({email:email});

        if(userData)
        {
           const randomString = randomstring.generate();
          const data=await User.updateOne({email:email},{$set:{token:randomString}});
           sendresetPasswordMail(userData.username,userData.email,randomString,res);
           res.status(200).send({success:true,msg:"Please check your mail"})
        }
        else{
            res.status(200).send({success:true,msg:"this email doesnt exist"})
        }
    } catch (error) {
        res.status(400).send({success:false,msg:error.message});
        
    }});

    router.get('/resetPassword',async(req,res)=>{
        try {
            const token =req.query.token;
            const tokenData=await user.findOne({token:token});
            if(tokenData){
                const password=req.body.password;
                const newPassword=await securePassword(password);
                const userData=await user.findByIdAndUpdate({_id:tokenData._id},{$set:{password:newPassword,token:""}},{new:true});
                res.status(200).send({success:true,msg:"User Password has been reset",data:userData});
                
            }
            else
             res.status(200).send({success:true,msg:"this link has been expired"});


        } catch (error) {
            res.status(400).send({success:false,msg:error.msg});
        }
    });


module.exports= router;

