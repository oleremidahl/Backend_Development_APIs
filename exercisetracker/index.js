require('dotenv').config();
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var { v4: uuidv4 } = require('uuid');

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

let users = [];
let exercises = [];

// POST /api/users to create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = { username, _id: uuidv4() };
  users.push(newUser);
  res.json(newUser);
});

// GET /api/users to get a list of all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST /api/users/:_id/exercises to add exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  if (isNaN(exerciseDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  const newExercise = {
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
    _id: uuidv4(),
    userId: _id
  };

  exercises.push(newExercise);

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id
  });
});

// GET /api/users/:_id/logs to retrieve a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter(exercise => exercise.userId === _id);

  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate)) {
      userExercises = userExercises.filter(exercise => new Date(exercise.date) >= fromDate);
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate)) {
      userExercises = userExercises.filter(exercise => new Date(exercise.date) <= toDate);
    }
  }

  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map(({ description, duration, date }) => ({ description, duration, date }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
