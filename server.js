const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
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

// var MongoClient = require("mongodb").MongoClient;
// var url = "mongodb://127.0.0.1:27017/";

// app.post("/update_name", async (req, res) => {
//   let { pname, userId, userNameOld } = req.body;
//   console.log(`User Name = ${pname}\nUser Id = ${userId}`);

//   MongoClient.connect(url, function (err, db) {
//     if (err) throw err;
//     var dbo = db.db("oscuro");
//     var myquery = { name: userNameOld };
//     var newvalues = {
//       $set: { name: "azz" },
//     };
//     dbo.collection("users").updateOne(myquery, newvalues, function (err, res) {
//       if (err) throw err;
//       console.log("Name Updated");
//       // db.close();
//     });
//   });
// });
// let pname, userId, userNameOld
// app.post("/update_name", async (req, res) => {
// res.send("Kya Hua");
// var { pname, userId, userNameOld } = req.body;

// var MongoClient = require("mongodb").MongoClient;
// var url = 'mongodb+srv://Mnan:Mannan.1@cluster0.wgz54f5.mongodb.net/oscura?retryWrites=true&w=majority';

// MongoClient.connect(url, function (err, db) {
//   if (err) throw err;
//   var newName = pname;
//   var oldName = userNameOld;
//   var useridm = userId;
//   var dbo = db.db("oscuro");
//   var myquery = { name: oldName };
//   var newvalues = { $set: { name: newName, id: useridm } };
//   dbo.collection("users").updateOne(myquery, newvalues, function (err) {
//     if (err) {
//       res.send("Internal Server Error!");
//     }
//     else {
//       res.send("Data Updated!");
//     }
//   });
// });
// res.body
// return "1 document updated";
// });

app.post("/update_name", async (req, res) => {
  const { userId, pname } = req.body;
  if (User) {
    var myquery = { _id: userId };
    var newvalues = { $set: { name: pname } };

    await User.updateOne(myquery, newvalues)
      .then(async () => {
        const members = await User.find();
        res.status(200).json({ msg: "Name Updated Successfully!", members });
      })
      .catch((err) => {
        res.status(400).json({ error: "Internal Server Error!" });
      });
  }
});

app.post("/update_password", async (req, res) => {
  const { userId, ppass } = req.body;

  // User.changePassword(userId, ppass, function(err, result) {
  //   if (err) throw err;
  //   console.log(result.password); 
  // });
  let hashPassword = await bcrypt.hash(ppass, 10);

  var myquery = { _id: userId };
  var newvalues = { $set: { password: await hashPassword } };
  User.updateOne(myquery, newvalues)
    .then(() => {
      res.status(200).json({ msg: "Password Updated Successfully!" });
    })
    .catch((err) => {
      res.status(400).json({ error: "Internal Server Error!" });
    });
});

app.post("/delete_user_message", async (req, res) => {
  const { id, currentRoom } = req.body;
  var myquery = { _id: id };
  var newvalues = { $set: { content: "This message was deleted", classname: "deleted" } };

  await Message.updateOne(myquery, newvalues)
    .then(async () => {
      let roomMessages = await getLastMessagesFromRoom(currentRoom);
      res.status(200).json({ msg: "Message Deleted Successfully!", classname: "deleted", msgList: roomMessages });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

app.post('/creategroup', async(req, res)=> {
  try {
    const {groupName, groupPass, groupCreator} = req.body; 
    console.log(groupCreator);
    const group = await CreateGroup.create({groupName, groupPass, groupCreator});
    const allgroup = await CreateGroup.find();
    // res.status(200).json("Group Created Successfully");
    res.status(200).json({allgroup:allgroup,msg:"Group Created Successfully"});
  } catch (e) {
    let msg;
    if(e.code == 11000){
      msg = "Group already exists"
    } else {
      msg = e.message;
    } 
    res.status(400).json(msg)
  }
})
app.post('/fetchallgroups', async(req, res)=> {
  try { 
    const allgroup = await CreateGroup.find();
    // res.status(200).json("Group Created Successfully");
    // res.status(200).json(allgroup);
    res.status(200).json({allgroup:allgroup,msg:"Fetched Successfully"});
  } catch (e) { 
    res.status(400).json("Error Occurd While Fetching Groups")
  }
})


app.post("/update_profile_picture", async (req, res) => {
  const { userId, img } = req.body;

  // User.changePassword(userId, ppass, function(err, result) {
  //   if (err) throw err;
  //   console.log(result.password); 
  // }); 

  var myquery = { _id: userId };
  var newvalues = { $set: { picture: img } };
  await User.updateOne(myquery, newvalues)
    .then(() => {
      res.status(200).json({ msg: "Image Updated Successfully!" });
    })
    .catch((err) => {
      res.status(400).json({ error: "Internal Server Error!" });
    });

  // socket connection
  // var myquery = { _id: userId };
  // var newvalues = { $set: { password: ppass } };
  // User.updateOne(myquery, newvalues)
  //   .then(() => {
  //     res.status(200).json({ msg: "Name Updated Successfully!" });
  //   })
  //   .catch((err) => {
  //     res.status(400).json({ error: "Internal Server Error!" });
  //   });

  // if (User) {
  //   var myquery = { _id: userId };
  //   var newvalues = { $set: { name: pname } };

  //   User.updateOne(myquery, newvalues)
  //     .then(() => {
  //       res.status(200).json({ msg: "Name Updated Successfully!" }); 
  //     })
  //     .catch((err) => {
  //       res.status(400).json({ error: "Internal Server Error!" }); 
  //     });
  // }
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
  // socket.on('remove-user', async () => {
  //   db.collection.remove(
  //     User
  //   )
  // })

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


  // socket.on('disconnect',async () => { 
  //   try {
      
  //     const _id = userId;
  //     const user = await User.findById(_id);
  //     user.status = "offline"; 
  //     await user.save();
  //     const members = await User.find();
  //     socket.broadcast.emit("new-user", members);
  //   } 
  //   catch (err) {
      
  //   }
  // })

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

// app.get("/rooms", (req, res) => {
//   res.json(rooms);
// });
// app.get("/allrooms", async (req, res) => {
//   const group = await CreateGroup.create({groupName, groupPass, groupCreator});
//   console.log(group);
//   res.status(200).json(allrooms); 
// });

server.listen(PORT, () => {
  console.log("listening to port", PORT);
});
