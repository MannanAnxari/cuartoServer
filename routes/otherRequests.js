const router = require('express').Router();
const User = require('../models/User');
const Message = require('../models/Message');
const bcrypt = require('bcrypt');
const CreateGroup = require('../models/Groups');


// delete user message 
router.post('/delete_user_message', async (req, res) => {
  try {
    const { id, currentRoom } = req.body;
    const msg = await Message.findByIdAndUpdate(id, { msg: "Message Deleted Successfully!", classname: "deleted" });
    await msg.save();
    let roomMessages = await Message.aggregate([
      { $match: { to: currentRoom } },
      { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
    ]);
    res.status(200).json({ msg: "Message Deleted Successfully!", classname: "deleted", msgList: roomMessages });
  } catch (err) {
    res.status(400).json({ error: err });
  }
});



// update username 
router.post('/update_name', async (req, res) => {
  try {
    const { userId, pname } = req.body;
    const user = await User.findByIdAndUpdate(userId, { name: pname });
    await user.save();
    res.status(200).json({ msg: "Name Updated Successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Internal Server Error!" });
  }
});



// update password 
router.post('/update_password', async (req, res) => {
  try {
    const { userId, ppass } = req.body;
    let hashPassword = await bcrypt.hash(ppass, 10);
    const user = await User.findByIdAndUpdate(userId, { password: hashPassword });
    await user.save();
    res.status(200).json({ msg: "Password Updated Successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Internal Server Error!" });
  }
});



// update profile picture 
router.post('/update_profile_picture', async (req, res) => {
  try {
    const { userId, img } = req.body;
    const user = await User.findByIdAndUpdate(userId, { picture: img });
    await user.save();
    res.status(200).json({ msg: "Image Updated Successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Internal Server Error!" });
  }
});


// fetch all groups 
router.post('/fetchallgroups', async (req, res) => {
  try {
    const allgroup = await CreateGroup.find();
    res.status(200).json({ allgroup: allgroup, msg: "Fetched Successfully" });
  } catch (e) {
    res.status(400).json({ error: "Error Occurd While Fetching Groups" })
  }
})


// create a new group 
router.post('/creategroup', async (req, res) => {
  try {
    const { groupName, groupPass, groupCreator } = req.body;
    await CreateGroup.create({ groupName, groupPass, groupCreator });
    const allgroup = await CreateGroup.find();
    res.status(200).json({ allgroup: allgroup, msg: "Group Created Successfully" });
  } catch (e) {
    let msg;
    if (e.code == 11000) {
      msg = "Group already exists";
    } else {
      msg = e.message;
    }
    console.log(msg); 
    res.status(400).json({ error: msg });
  }
});

module.exports = router
