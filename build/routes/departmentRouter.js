"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentRouter = void 0;
const express = require("express");
const dbDepartment_1 = require("../db/dbDepartment");
const dbcon_dev_1 = require("../db/protected/dbcon-dev");
exports.departmentRouter = express();
const dbControl = new dbDepartment_1.dbDepartment(dbcon_dev_1.pool); //exclusive to departments router
//get
exports.departmentRouter.get('/', (req, res, next) => {
    res.render('departments.html');
});
//post
exports.departmentRouter.post('/', (req, res, next) => {
    dbControl.getDepartments().then(data => res.json(data));
});
exports.departmentRouter.post('/get', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    dbControl.getDepartment(incData.id).then(data => res.json(data));
});
exports.departmentRouter.post('/add', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    //error checking
    if (typeof (incData.name) !== 'string') {
        res.status(400).json({ 'error': 'invalid data recieved' });
    }
    //do insert
    dbControl.addDepartment(incData)
        .then((id) => dbControl.getDepartment(id)
        .then(data => res.json(data)));
});
exports.departmentRouter.post('/options', (req, res, next) => {
    dbControl.listDepartmentOptions().then(data => res.json(data));
});
//# sourceMappingURL=departmentRouter.js.map