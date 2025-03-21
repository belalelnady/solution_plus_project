"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRouter = void 0;
const express = require("express");
const dbClass_1 = require("../db/dbClass");
const dbcon_dev_1 = require("../db/protected/dbcon-dev");
exports.classRouter = express();
const dbControl = new dbClass_1.dbClass(dbcon_dev_1.pool); //exclusive to departments router
exports.classRouter.get('/', (req, res, next) => {
    res.render('classes.html');
});
exports.classRouter.post('/', (req, res, next) => {
    dbControl.getClasses().then(data => res.json(data));
});
exports.classRouter.post('/get', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    dbControl.getClass(incData.id).then(data => res.json(data));
});
exports.classRouter.post('/add', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    incData.departmentid = Number(incData.departmentid);
    incData.buildingid = Number(incData.buildingid);
    //error checking
    if (typeof (incData.name) !== 'string' ||
        typeof (incData.departmentid) !== 'number' ||
        typeof (incData.buildingid) !== 'number') {
        res.status(400).json({ 'error': 'invalid data recieved' });
    }
    //do insert
    dbControl.addClass(incData)
        .then(id => dbControl.getClass(id))
        .then(data => res.json(data));
});
exports.classRouter.post('/options', (req, res, next) => {
    dbControl.listClassOptions().then(data => res.json(data));
});
//# sourceMappingURL=classRouter.js.map