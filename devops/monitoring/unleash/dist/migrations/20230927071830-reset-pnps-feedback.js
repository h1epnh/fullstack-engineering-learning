'use strict';
exports.up = function (db, callback) {
    db.runSql(`
       DELETE FROM user_feedback WHERE feedback_id = 'pnps' AND given < NOW() - INTERVAL '3 months';
        `, callback());
};
exports.down = function (db, callback) {
    callback();
};
//# sourceMappingURL=20230927071830-reset-pnps-feedback.js.map