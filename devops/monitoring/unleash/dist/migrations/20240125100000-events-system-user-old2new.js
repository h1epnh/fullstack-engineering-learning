'use strict';
exports.up = function (db, callback) {
    db.runSql(`
        UPDATE events SET created_by_user_id = -1337 WHERE created_by_user_id = -1;
        `, callback);
};
exports.down = function (db, callback) {
    callback();
};
//# sourceMappingURL=20240125100000-events-system-user-old2new.js.map