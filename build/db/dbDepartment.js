"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbDepartment = void 0;
const mysql = require("mysql");
class dbDepartment {
    constructor(dbPool) {
        this.pool = dbPool;
        //this.dbConnect();
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
    getDepartment(id) {
        const funcQuery = `
        SELECT * FROM uni_department
        WHERE id=${this.cleanInput(id)}
        `;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
    getDepartments() {
        const funcQuery = `SELECT * FROM uni_department`;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
    addDepartment(data) {
        const funcQuery = `
        INSERT INTO uni_department (name,description) 
            values (${this.cleanInput(data.name)},
                    ${this.cleanInput(data.description || null)}
            );
        `;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result.insertId);
            });
        });
    }
    listDepartmentOptions() {
        const funcQuery = `SELECT id,name FROM uni_department`;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
}
exports.dbDepartment = dbDepartment;
//# sourceMappingURL=dbDepartment.js.map