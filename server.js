const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const otherRequests = require("./routes/otherRequests");
const User = require("./models/User");
const CreateGroup = require("./models/Groups");
const Message = require("./models/Message");
// const rooms = ["KODRZ", "General", "Tech", "Metaverse", "Finance", "Crypto"];
const bcrypt = require('bcrypt');
const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/users", userRoutes);
app.use("/data", otherRequests);
require("./connection");

const server = require("http").createServer(app);
const PORT = process.env.PORT || 8000;
const io = require("socket.io")(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: 'https://cuarto.netlify.app',
    methods: ["GET", "POST"],
  },
});

async function getLastMessagesFromRoom(room) {
  let roomMessages = await Message.aggregate([
    { $match: { to: room } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);
  return roomMessages;
}



function sortRoomMessagesByDate(messages) {
  return messages.sort(function (a, b) {
    let date1 = a._id.split("/");
    let date2 = b._id.split("/");


    date1 = date1[2] + date1[1] + date1[0];
    date2 = date2[2] + date2[1] + date2[0];
    return date1 < date2 ? -1 : 1;
  });
}
io.on("connection", (socket) => {
  socket.on("new-user", async () => {
    const members = await User.find();
    io.emit("new-user", members);
  });


  socket.on("new-group", async () => {
    const groups = await CreateGroup.find();
    socket.emit("new-group", groups);
  });


  socket.on("typing", async (myId, roomId) => {
    socket.broadcast.emit("typing", myId, roomId)
  });


  // var userId = "";
  socket.on("join-room", async (newRoom, previousRoom, id) => {
    socket.join(newRoom);
    // userId = id;
    // console.log(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    // console.log(roomMessages);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit("room-messages", roomMessages);
  });

  socket.on("message-room", async (room, content, img, classname, sender, time, date) => {
    const newMessage = await Message.create({
      content,
      img,
      classname,
      from: sender,
      time,
      date,
      to: room,
    });
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    // sending message to room
    io.to(room).emit("room-messages", roomMessages);
    socket.broadcast.emit("notifications", room);
  });



  socket.on("reload-deleted", async (room) => {
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    io.to(room).emit("room-messages", roomMessages);
    // socket.broadcast.emit("notifications", room);
  });

  app.delete("/logout", async (req, res) => {
    try {
      const { _id, newMessages } = req.body;
      const user = await User.findById(_id);
      user.status = "offline";
      user.newMessages = newMessages;
      await user.save();
      const members = await User.find();
      socket.broadcast.emit("new-user", members);
      res.status(200).send();
    } catch (e) {
      res.status(400).send();
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hell this is Working...");
});

server.listen(PORT, () => {
  console.log("listening to port", PORT);
});
