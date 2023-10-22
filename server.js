const express = require('express');
const colors= require('colors');
const morgan= require('morgan');
const dotenv=require('dotenv');
const connectDB =require('./config/db');

const app=express();
app.use(express.json());

dotenv.config({
   path:'./config/config.env'
});

connectDB();

app.use('/api/todo/auth',require('./routes/user'));

// app.use((req,res,next)=>{
//    console.log("Middleware run");
//    req.title ='parashar';
//    next();
// });
app.use(morgan('dev'));


// app.use(express.json({
//    extended: true
// }));

app.get('/todo',(req,res)=>{
   res.status(200).json({
      "name":"priyanshu",
      "last name":req.title
   });
});
const PORT= process.env.PORT || 3000

app.listen(3000,console.log(`server running on port ${PORT}`.red.underline.bold));
