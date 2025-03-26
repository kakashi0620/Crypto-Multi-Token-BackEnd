const bodyParser = require("body-parser");
const express = require("express");
const dotenv = require("dotenv").config();

const dbConnect = require("./config/dbConnect");
const app = express();
dbConnect();
const User = require("./models/userModel");

async function populateAdmin()
{
  let findUser = await User.findOne({ user_id: "admin1" });

  if (!findUser) {
    await User.create({
      "user_id": "admin",
      "name": "ChoeHakSong",
      "role": "admin",
      "password": "admin124",
      "birthday": "1987-03-14T00:00:00.000Z",
      "unit": "RNU1",
      "team": "RSE",
      "netkey_user": "chs0314",
      "netkey_machine": "43-chs0314",
      "group": 1
    });
    console.log("Admin user registered (user_id=admin, password=admin124)");
    console.log("You can update user information in profile page");
  } else {
    console.log("Admin user already registered!");
  }
}

async function initdb()
{
  await populateAdmin();
  console.log("Finished");
  process.exit(0);
}

initdb();
