"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildingRouter = void 0;
const express = require("express");
const dbBuilding_1 = require("../db/dbBuilding");
const dbcon_dev_1 = require("../db/protected/dbcon-dev");
exports.buildingRouter = express();
const dbControl = new dbBuilding_1.dbBuilding(dbcon_dev_1.pool); //exclusive to departments router
exports.buildingRouter.get('/', (req, res, next) => {
    res.render('buildings.html');
});
exports.buildingRouter.post('/', (req, res, next) => {
    dbControl.getBuildings().then(data => res.json(data));
});
exports.buildingRouter.post('/get', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    dbControl.getBuilding(incData.id).then(data => res.json(data));
});
exports.buildingRouter.post('/add', (req, res, next) => {
    const incData = Object.assign({}, req.body);
    incData.departmentid = Number(incData.departmentid);
    //error checking
    if (typeof (incData.name) !== 'string' ||
        typeof (incData.departmentid) !== 'number') {
        res.status(400).json({ 'error': 'invalid data recieved' });
    }
    //do insert
    dbControl.addBuilding(incData)
        .then((id) => dbControl.getBuilding(id)
        .then(data => res.json(data)));
});
exports.buildingRouter.post('/options', (req, res, next) => {
    dbControl.listBuildingOptions().then(data => res.json(data));
});
//# sourceMappingURL=buildingRouter.js.map