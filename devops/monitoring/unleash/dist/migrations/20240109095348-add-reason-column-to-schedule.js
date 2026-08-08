'use strict';
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE change_request_schedule ADD COLUMN reason TEXT;
         UPDATE change_request_schedule SET reason = failure_reason;`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE change_request_schedule DROP COLUMN reason;`, cb);
};
//# sourceMappingURL=20240109095348-add-reason-column-to-schedule.js.map