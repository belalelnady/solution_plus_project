"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRouter = void 0;
const express = require("express");
const dbStudent_1 = require("../db/dbStudent");
const dbcon_dev_1 = require("../db/protected/dbcon-dev");
exports.studentRouter = express();
const dbControl = new dbStudent_1.dbStudent(dbcon_dev_1.pool);
exports.studentRouter.get('/', (req, res, next) => {
    res.render('students.html');
});
exports.studentRouter.post('/', (req, res, next) => {
    dbControl.getStudents().then(data => res.json(data));
});
exports.studentRouter.post('/get', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    incData.id = Number(incData.id);
    if (typeof (incData.id) !== 'number') {
        res.status(400).json({ 'error': 'invalid data recieved' });
    }
    console.log(incData);
    //note: promise.all doesnt work well with funcs that can possibly fail
    dbControl.getStudent(incData.id).then(data => res.json(data));
});
exports.studentRouter.post('/add', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    if (typeof (incData.firstname) !== 'string' ||
        typeof (incData.lastname) !== 'string') {
        res.status(400).json({ 'error': 'invalid data recieved' });
    }
    dbControl.addStudent(incData)
        .then(id => dbControl.getStudent(id))
        .then(data => res.json(data));
});
exports.studentRouter.post('/update', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    if (typeof (incData.firstname) !== 'string' ||
        typeof (incData.lastname) !== 'string') {
        res.status(400).json({ 'error': 'invalid data recieved' });
    }
    dbControl.updateStudent(incData).then(data => res.json({ "changedRows": data }));
});
//use delete all students class enrollment before this function.
exports.studentRouter.post('/delete', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    incData.id = Number(incData.id);
    if (typeof (incData.firstname) !== 'string' ||
        typeof (incData.lastname) !== 'string') {
        res.status(400).json({ 'error': 'invalid data recieved' });
    }
    dbControl.deleteStudent(incData).then(data => res.json({ "affectedRows": data }));
});
//# sourceMappingURL=studentRouter.js.map