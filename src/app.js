import express from 'express';
import mongoose from 'mongoose';
import querystring from 'querystring';
import { createMessage, getMessages } from './controllers/messages.controler';
const port = process.env.PORT;
mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  // we're connected!
  console.log('Mongo connected')
});
const app = express();

// List of all messages
// let messages = [];

// Track last active times for each sender
let users = {};

app.use(express.static("./public"));
app.use(express.json());

// generic comparison function for case-insensitive alphabetic sorting on the name field
function userSortFn(a, b) {
  const nameA = a.name.toUpperCase(); // ignore upper and lowercase
  const nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
}

app.get("/messages", async (request, response) => {
  // get the current time
  const now = Date.now();
  // await getMessages();

  // consider users active if they have connected (GET or POST) in last 15 seconds
  const requireActiveSince = now - 15 * 1000;
  const messages = await getMessages()
  // create a new list of users with a flag indicating whether they have been active recently
  let usersSimple = messages.map(message => ({
    name: message.sender,
    active: users[message.sender] > requireActiveSince
  }));

  // let usersSimple = Object.keys(users).map(x => ({
  //   name: x,
  //   active: users[x] > requireActiveSince
  // }));

  // sort the list of users alphabetically by name
  usersSimple.sort(userSortFn);
  usersSimple.filter(a => a.name !== request.query.for);

  // update the requesting user's last access time
  users[request.query.for] = now;

  // send the latest 40 messages and the full user list, annotated with active flags

  response.send({ messages: messages.slice(-40), users: usersSimple });
});

app.post("/messages", async (request, response) => {
  // add a timestamp to each incoming message.
  const timestamp = Date.now();
  request.body.timestamp = timestamp;

  await createMessage(request.body);

  // append the new message to the message list
  // messages.push(request.body);

  // update the posting user's last access timestamp (so we know they are active)
  users[request.body.sender] = timestamp;

  // Send back the successful response.
  response.status(201);
  response.send(request.body);
});

app.listen(port, () => {
  console.log('server is running at http://localhost:${port}')
});
