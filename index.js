const bodyParser = require("body-parser");
const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5000;
const authRouter = require("./routes/authRoute");
const equipmentRouter = require("./routes/equipmentRoute");
const lectureRouter = require("./routes/lectureRoute");
const vacationRouter = require("./routes/vacationRoute");
const projectRouter = require("./routes/projectRoute");
const dbRouter = require("./routes/dbRoute");
const allowIpRouter = require("./routes/allowIpRoute");

const xss = require('xss-clean');
const enforce = require('express-sslify');
const helmet = require('helmet');

const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require('path');
const ip = require('ip');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');

const limiter = rateLimit({
  windowMs: 1 * 1000, // 1s
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

dbConnect();

// Middleware to check if the IP is allowed
const ipFilter = (req, res, next) => {
  let clientIp = req.ip;
  if (clientIp.startsWith('::ffff:')) {
    clientIp = clientIp.slice(7); // Remove the "::ffff:" prefix to get the original IPv4 address
  }

  //console.log("clientIP=", clientIp, "allowIpList=", allowIpList);

  if (clientIp === '127.0.0.1' || clientIp === '::1') {
    return next(); // Allow localhost requests
  }

  // You can also use req.headers['x-forwarded-for'] for proxied requests
  if (allowIpList.length === 0) {
    return next();
  }
  
  for (let i = 0; i < allowIpList.length; i++) {
    const ipNum = ip.toLong(clientIp);
    //console.log("IP: ", ipNum, allowIpList[i].from, allowIpList[i].to);
    if (ipNum >= allowIpList[i].from && ipNum <= allowIpList[i].to)
      return next();
  }

  console.log("Forbidden clientIp=", clientIp);
  res.status(403).send('Forbidden: You are not allowed to access this resource');
};

// Apply to all requests
app.use(limiter);

app.use(ipFilter);
// Enforce HTTPS as the first middleware
//app.use(enforce.HTTPS({ trustProtoHeader: true }));

// Apply security headers (using helmet)
//app.use(helmet());

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(xss());

app.use(cookieParser());

app.use("/api/user", authRouter);
app.use("/api/equipment", equipmentRouter);
app.use("/api/lecture", lectureRouter);
app.use("/api/vacation", vacationRouter);
app.use("/api/project", projectRouter);
app.use("/api/db", dbRouter);
app.use("/api/allowip", allowIpRouter);

app.use(express.static('../Frontend/build'));

const indexHtmlPath = path.join(__dirname, '../Frontend/build', 'index.html');
console.log("path=", indexHtmlPath);

app.get('/*', (req, res) => {
  res.sendFile(indexHtmlPath);
});

app.use(notFound);
app.use(errorHandler);

const now = new Date();
console.log(`Starting on ${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`);
app.listen(PORT, () => {
  console.log(`Server is running  at PORT ${PORT}`);
});
