//connect to mongodb
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config()
// const User = require('./models/User.js');
const bodyParser = require('body-parser');
mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error',(error) => console.error(error));
db.once('open',() => console.log('Connected to Database'));

//basic config
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({extended: false}))

// create the schema and the model
const userSchema = new mongoose.Schema({
  username:{ type: String, required: true },
  log:[{
    description:{ type: String, required: true },
    duration:{ type: Number, required: true },
    date: { type: Date, required: true }
  }]
})

const User = mongoose.model("user",userSchema)

//create new user
app.post('/api/users',(req,res)=>{
  
  let username = req.body.username

  var user  = new User({
    username: `${username}`,  
  })
  user.save(function(err,data){
    if (err) return console.error(err);
    //console.log(data)
    res.send({
    "username":username,
    "_id":data._id
  }) 
  })
  
})

//show new user
app.get('/api/users',(req,res)=>{
  User.find({},function(err,users){
    var userMap = [];

    users.forEach(function(user) {    
      userMap.push({
        "_id":user.id,
        "username": user.username
      })     
    });
    res.send(userMap);  
  })
})

/// create an excercise
app.post("/api/users/:_id/exercises",(req,res,next)=>{
  let userId = req.params._id
  let description = req.body.description
  let duration = req.body.duration
  let date = req.body.date
  
  if (date === "" || "undefined"){
    date = new Date().toDateString()
  } else {
    date = new Date(date).toDateString()
  } 

  const expObj = {
    description,
    duration,
    date
  }

  User.findByIdAndUpdate(
    userId,
    {$push:{log:expObj}},
    {new:true},
    (err,updatedUser)=>{
      if(err) {
        return console.log('update error:',err);
      }
      
      let returnObj ={
        "_id":userId,
        "username":updatedUser.username,
        "date":expObj.date,
        "duration":parseInt(expObj.duration),"description":expObj.description
      }
      res.json(returnObj)
    }
  )  
})


//retrieve info of exercises
app.get('/api/users/:_id/logs',(req,res)=>{
  const userId = req.params._id
  const from = req.query.from;
  const to = req.query.to;
  const limit = +req.query.limit;

  User.findById({_id:userId},(err,user)=>{
    if(err) return console.log(err)     

    let log = user.log.map((item)=>{
      return {
        description:item.description,
        duration:item.duration,
        date: new Date(item.date).toDateString()
      }     
    })
    if (from){
      const fromDate = new Date(from)
      log = log.filter(exe => new Date(exe.date)>= fromDate)
    }
    if (to){
      const toDate = new Date(to)
      log = log.filter(exe => new Date(exe.date)<= toDate)
    }
    if(limit){
      log = log.slice(0,limit)
    }

    let count = log.length  
 
    res.send({      
      "username":user.username,
      "count":count,
      "_id":userId,
      "log":log
    })
  })  
})