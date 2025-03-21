"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const dbController_1 = require("./db/dbController");
const dbcon_dev_1 = require("./db/protected/dbcon-dev");
const departmentRouter_1 = require("./routes/departmentRouter");
const buildingRouter_1 = require("./routes/buildingRouter");
const classRouter_1 = require("./routes/classRouter");
const studentRouter_1 = require("./routes/studentRouter");
const classEnrollmentRouter_1 = require("./routes/classEnrollmentRouter");
const app = express();
const server = http.Server(app);
const dbControl = new dbController_1.dbController(dbcon_dev_1.pool); //creates db connection
//generic usings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static('./public'));
app.engine('html', require('ejs').renderFile);
//use routes
app.use('/department', departmentRouter_1.departmentRouter);
app.use('/building', buildingRouter_1.buildingRouter);
app.use('/class', classRouter_1.classRouter);
app.use('/student', studentRouter_1.studentRouter);
app.use('/enrollment', classEnrollmentRouter_1.classEnrollmentRouter);
app.get('/', (req, res, next) => {
    res.render('index.html');
});
app.get('*', (req, res) => {
    res.render('404page.html');
});
const port = process.env.PORT || 3000;
server.listen(port);
console.log("server running at http://localhost:" + port);
console.log("  Press CTRL-C to stop\n");
//# sourceMappingURL=server.js.map