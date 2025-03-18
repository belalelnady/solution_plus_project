"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const mysql = require("mysql");
exports.pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
//# sourceMappingURL=dbcon-dev.js.map