"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbBuilding = void 0;
const mysql = require("mysql");
class dbBuilding {
    constructor(dbPool) {
        this.pool = dbPool;
    }
    dbConnect() {
        this.pool.getConnection((err) => {
            if (err) {
                throw err;
            }
            else {
                console.log("connected to db");
            }
        });
    }
    dbDisconnect() {
        this.pool.end((err) => {
            if (err) {
                throw err;
            }
            else {
                console.log("disconnected from db");
            }
        });
    }
    cleanInput(token) {
        if (typeof (token) === 'string') {
            token = token.toLocaleLowerCase();
            token = token.replace(/ /g, "_");
        }
        return mysql.escape(token);
    }
    getBuilding(id) {
        const funcQuery = `
        SELECT b.id, b.departmentid, b.name, b.description, d.name AS departmentName
            FROM uni_building b
            INNER JOIN uni_department d ON b.departmentid=d.id    
        WHERE b.id=${this.cleanInput(id)}
        `;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
    getBuildings() {
        const funcQuery = `
        SELECT b.id, b.departmentid, b.name, b.description, d.name AS departmentName
            FROM uni_building b
            INNER JOIN uni_department d ON b.departmentid=d.id    
        `;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
    addBuilding(data) {
        const funcQuery = `
        INSERT INTO uni_building (name,description,departmentid) 
            values (${this.cleanInput(data.name)},
                    ${this.cleanInput(data.description || null)},
                    ${this.cleanInput(data.departmentid)}
            );
        `;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result.insertId);
            });
        });
    }
    listBuildingOptions() {
        const funcQuery = `SELECT id,name FROM uni_building`;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
}
exports.dbBuilding = dbBuilding;
//# sourceMappingURL=dbBuilding.js.map