"use strict";
exports.up = function (db, cb) {
    db.runSql(`INSERT INTO user_splash(splash_id, user_id, seen) SELECT 'environment', u.id, false FROM users u`, cb);
};
exports.down = function (db, cb) {
    db.runSql('DELETE FROM user_splash', cb);
};
//# sourceMappingURL=20211109103930-add-splash-entry-for-users.js.map