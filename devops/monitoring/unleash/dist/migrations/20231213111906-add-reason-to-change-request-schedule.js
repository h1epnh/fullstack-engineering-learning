"use strict";
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE change_request_schedule ADD COLUMN failure_reason text`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE change_request_schedule DROP COLUMN failure_reason`, cb);
};
//# sourceMappingURL=20231213111906-add-reason-to-change-request-schedule.js.map