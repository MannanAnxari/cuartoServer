const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const app = express();


// mongodb+srv://Mnan:Mannan.1@cluster0.wgz54f5.mongodb.net/?retryWrites=true&w=majority/oscuro

// mongoose.connect(`mongodb://127.0.0.1:27017/oscuro`, ()=> {
//   console.log('connected to mongodb')
// })

mongoose
  .connect(
    "mongodb://127.0.0.1:27017/oscuro",
    // 'mongodb+srv://Mnan:Mannan.1@cluster0.wgz54f5.mongodb.net/oscura?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("DB Was Connected");
  })
  .catch((err) => {
    console.log(err);
  });

