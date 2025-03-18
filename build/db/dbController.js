"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbController = void 0;
const mysql = require("mysql");
//Admin controls will go here. Like drop and reload tables, etc,etc
class dbController {
    constructor(dbPool) {
        this.pool = dbPool;
        this.dbConnect();
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
            token = token.replace(/ /g, "_");
        }
        return mysql.escape(token);
    }
}
exports.dbController = dbController;
//# sourceMappingURL=dbController.js.map