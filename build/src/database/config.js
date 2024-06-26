"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env;
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: DB_HOST,
    port: Number(DB_PORT),
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],
    synchronize: true,
});
