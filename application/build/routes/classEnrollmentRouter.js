"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classEnrollmentRouter = void 0;
const express = require("express");
const dbClassEnrollment_1 = require("../db/dbClassEnrollment");
const dbcon_dev_1 = require("../db/protected/dbcon-dev");
exports.classEnrollmentRouter = express();
const dbControl = new dbClassEnrollment_1.dbClassEnrollment(dbcon_dev_1.pool); //exclusive to departments router
exports.classEnrollmentRouter.get('/', (req, res, next) => {
    res.render('enrollments.html');
});
exports.classEnrollmentRouter.post('/', (req, res, next) => {
    dbControl.getClassEnrollments().then(data => res.json(data));
});
exports.classEnrollmentRouter.post('/get', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    dbControl.getClassEnrollment(incData.id).then(data => res.json(data));
});
exports.classEnrollmentRouter.post('/add', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    incData.classid = Number(incData.classid);
    incData.studentid = Number(incData.studentid);
    //error checking
    if (typeof (incData.classid) !== 'number' ||
        typeof (incData.studentid) !== 'number') {
        res.status(400).json({ 'error': 'invalid data recieved' });
    }
    dbControl.addClassEnrollment(incData)
        .then(id => dbControl.getClassEnrollment(id)
        .then(data => res.json(data)));
});
exports.classEnrollmentRouter.post('/delete', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    incData.classid = Number(incData.classid);
    incData.studentid = Number(incData.studentid);
    //error checking
    if (typeof (incData.classid) !== 'number' ||
        typeof (incData.studentid) !== 'number') {
        res.status(400).json({ 'error': 'invalid data recieved' });
    }
    dbControl.deleteClassEnrollment(incData)
        .then(data => res.json({ "affectedRows": data }));
});
//if deleting a student use this first
exports.classEnrollmentRouter.post('/deleteenrollment', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    incData.id = Number(incData.id);
    if (typeof (incData.id) !== 'number') {
        res.status(400).json({ 'error': 'invalid data recieved' });
    }
    dbControl.deleteEnrollmentStudent(incData)
        .then(data => res.json({ "affectedRows": data }));
});
//# sourceMappingURL=classEnrollmentRouter.js.map