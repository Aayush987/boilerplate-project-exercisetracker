const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config()
const User = require('./models/User.js');
const bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error',(error) => console.error(error));
db.once('open',() => console.log('Connected to Database'));

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
  if(!date) {
    date = new Date().toDateString();
  }
  var Date1 = new Date(date).toDateString();

  const user = await User.findById(_id);
  console.log(user);
  // update the user
  user.log.push({description: description, duration: duration, date: date});
  await user.save();
  res.json({username: user.username,description, duration, date: Date1, _id: user._id});
})

app.get('/api/users', async (req,res) => {
  //get all users
  const users = await User.find().select('_id username');
  res.json(users);
})

app.get('/api/users/:_id/logs', async (req,res) => {
  const {_id} = req.params;
  const {from, to, limit} = req.query;
  const user = await User.findById(_id);
  console.log(user);
  count = user.log.length;
  // get the logs
  res.json(user);
})






const listener = app.listen(3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
