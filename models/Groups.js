const mongoose = require("mongoose");

const CreateGroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      unique: true,
      required: true,
    },
    groupPass: {
      type: String,
    },
    groupCreator: {
      type: String,
    },
  },
  { minimize: false }
);

const CreateGroup = mongoose.model("Group", CreateGroupSchema);

module.exports = CreateGroup;
