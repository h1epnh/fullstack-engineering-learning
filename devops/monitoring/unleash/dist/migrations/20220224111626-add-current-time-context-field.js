'use strict';
exports.up = function (db, cb) {
    db.runSql(`
       INSERT INTO context_fields(name, description, sort_order) VALUES('currentTime', 'Allows you to constrain on date values', 3);
        `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
       DELETE FROM context_fields WHERE name = 'currentTime';
        `, cb);
};
//# sourceMappingURL=20220224111626-add-current-time-context-field.js.map