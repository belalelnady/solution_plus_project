"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbClassEnrollment = void 0;
const mysql = require("mysql");
class dbClassEnrollment {
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
    getClassEnrollment(studentid) {
        const funcQuery = `
        SELECT ce.studentid AS studentid, ce.classid AS classid,
            s.firstname AS studentFirstName, s.lastname AS studentLastName,
            c.name AS className,ce.id AS id
        FROM uni_class_enrollment ce
            INNER JOIN uni_class c ON ce.classid=c.id
            INNER JOIN uni_student s ON ce.studentid=s.id
        WHERE s.id=${this.cleanInput(studentid)}
        `;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
    getClassEnrollments() {
        const funcQuery = `
        SELECT ce.studentid AS studentid, ce.classid AS classid,
            s.firstname AS studentFirstName, s.lastname AS studentLastName,
            c.name AS className,ce.id AS id
        FROM uni_class_enrollment ce
            INNER JOIN uni_class c ON ce.classid=c.id
            INNER JOIN uni_student s ON ce.studentid=s.id
        `;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
    addClassEnrollment(data) {
        const funcQuery = `
        INSERT INTO uni_class_enrollment (studentid,classid)
            values(
                ${this.cleanInput(data.studentid)},
                ${this.cleanInput(data.classid)}
            );`;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result.insertId);
            });
        });
    }
    deleteClassEnrollment(target) {
        const funcQuery = `DELETE FROM uni_class_enrollment WHERE id=${this.cleanInput(target.id)}`;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result.affectedRows);
            });
        });
    }
    deleteEnrollmentStudent(target) {
        const funcQuery = `
            DELETE FROM uni_class_enrollment 
            WHERE studentid=${this.cleanInput(target.id)}`;
        return new Promise((resolve, reject) => {
            this.pool.query(funcQuery, (err, result, fields) => {
                err ? reject(err) : resolve(result.affectedRows);
            });
        });
    }
}
exports.dbClassEnrollment = dbClassEnrollment;
//# sourceMappingURL=dbClassEnrollment.js.map