'use strict';
exports.up = function (db, cb) {
    db.runSql(`
       DELETE FROM user_feedback WHERE nevershow = false;
        `, cb);
};
exports.down = function (db, cb) {
    cb();
};
//# sourceMappingURL=20220131082150-reset-feedback-form.js.map