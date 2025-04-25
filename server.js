require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnect = require("./config/dbConnect");
const path = require("path");

const app = express();

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const PORT = process.env.PORT || 5000;

dbConnect();

const usersRoute = require("./routes/usersRoute");
const dealsRoute = require("./routes/dealsRoute");
const investsRoute = require("./routes/investRoute");
const distributionsRoute = require("./routes/distributionRoute");

app.use(express.json());

app.use("/api/users", usersRoute); //const userModel = mongoose.model("user", userSchema);
app.use("/api/deals", dealsRoute); //const dealModel = mongoose.model("deal", dealSchema);
app.use("/api/invests", investsRoute); //const dealModel = mongoose.model("deal", dealSchema);
app.use("/api/distributions", distributionsRoute); //const dealModel = mongoose.model("deal", dealSchema);

app.use("/upload", express.static(path.join(__dirname, "upload")));

const now = new Date();
console.log(`Starting on ${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`);
app.listen(PORT, () => {
  console.log(`Server is running  at PORT ${PORT}`);
});