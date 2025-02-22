const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config()
const User = require('./models/User.js');
const bodyParser = require('body-parser');
const e = require('express');
var cron = require('node-cron');
var axios = require('axios');

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error',(error) => console.error(error));
db.once('open',() => console.log('Connected to Database'));

cron.schedule('*/10 * * * *', () => {
  axios.get('https://exercise-tracker-qmh1.onrender.com/')
     .then(resonse => {
       console.log('Server Pinged successfully');
     })
     .catch(error => {
       console.log(error);
     });
})

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users',async (req,res) => {
  const {username} = req.body;
  const user = new User({username});
  await user.save();
  res.json({username: user.username, _id: user._id});
})

app.post('/api/users/:_id/exercises',async (req,res) => {
  const {_id} = req.params;
  const {description, duration} = req.body;
  var {date} = req.body;
  
  const user = await User.findById(_id);
  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? (new Date(date)).toDateString() : (new Date()).toDateString(),
  }

  console.log(user);
  // update the user
  user.log.push(exercise);
  await user.save();
  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    _id: _id,
    date: new Date(exercise.date).toDateString(),
  });
})






app.get('/api/users', async (req,res) => {
  //get all users
  const users = await User.find().select('_id username');
  res.json(users);
})

// app.get('/api/users/:_id/logs', async (req,res) => {
//   const {_id} = req.params;
//   const from = req.query.from;
//   const to = req.query.to;
//   const limit = +req.query.limit;
//   const user = await User.findById(_id);
//   var log = user.log;
//   if (from){
//     const fromDate = new Date(from)
//     log = log.filter(exe => new Date(exe.date)>= fromDate)
//   }
//   if (to){
//     const toDate = new Date(to)
//     log = log.filter(exe => new Date(exe.date)<= toDate)
//   }
//   if(limit){
//     log = log.slice(0,limit)
//   }
//   console.log(user);
//   count = user.log.length;
//   // get the logs
//   res.send({      
//     "username":user.username,
//     "count":count,
//     "_id":_id,
//     "log":log
//   })
// })

app.get('/api/users/:_id/logs', async (req, res) => {
  const {_id} = req.params;
  const {from, to, limit} = req.query;

  let user = await User.findById(_id);

  let log = user.log;

  let count = log.length;


  if (from) {
    log = log.filter((exercise) => new Date(exercise.date) > new Date(from));
  }

  if (to) {
    log = log.filter((exercise) => new Date(exercise.date) < new Date(to));
  }

  if (limit) {
    log = log.slice(0, limit);
  }


  res.json({
    _id: user._id,
    username: user.username,
    count: count,
    log: log.map((exercise) => {
      return {
        description: exercise.description,
        duration: exercise.duration,
        date: (new Date(exercise.date)).toDateString()
      }
    }),
  });
});




app.listen(3000, () => {  
  console.log('Your app is listening on port ' + 3000)
})