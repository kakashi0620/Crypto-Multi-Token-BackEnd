require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'https://booking-football.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const port = process.env.PORT || 4000;

const dbConfig = require("./db");


const usersRoute = require("./routes/usersRoute");
const deviceRoute = require("./routes/deviceRoute");
const lectureRoute = require("./routes/lectureRoute");

app.use(express.json());

app.use("/api/users", usersRoute); //const userModel = mongoose.model("user", userSchema);
app.use("/api/device", deviceRoute); //const deviceModel = mongoose.model("device", deviceSchema);
app.use("/api/lecture", lectureRoute); //const lectureModel = mongoose.model("lecture", lectureSchema);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});