"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_session_1 = __importDefault(require("express-session"));
const connect_session_knex_1 = require("connect-session-knex");
const date_fns_1 = require("date-fns");
function sessionDb(config, knex) {
    let store;
    const { db, cookieName } = config.session;
    const age = (0, date_fns_1.hoursToMilliseconds)(config.session.ttlHours) || (0, date_fns_1.hoursToMilliseconds)(48);
    if (db) {
        store = new connect_session_knex_1.ConnectSessionKnexStore({
            tableName: 'unleash_session',
            createTable: false,
            knex,
        });
    }
    else {
        store = new express_session_1.default.MemoryStore();
    }
    return (0, express_session_1.default)({
        name: cookieName,
        rolling: false,
        resave: false,
        saveUninitialized: false,
        store,
        secret: [config.server.secret],
        cookie: {
            path: config.server.baseUriPath === ''
                ? '/'
                : config.server.baseUriPath,
            secure: config.secureHeaders,
            maxAge: age,
            sameSite: 'lax',
        },
    });
}
exports.default = sessionDb;
//# sourceMappingURL=session-db.js.map