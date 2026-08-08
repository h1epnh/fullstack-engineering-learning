"use strict";
exports.up = function (db, cb) {
    db.runSql(`
            ALTER TABLE users
                ALTER COLUMN image_url TYPE text;
        `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
            ALTER TABLE users
                ALTER COLUMN image_url TYPE VARCHAR(255);
        `, cb);
};
//# sourceMappingURL=20240125085703-users-table-increae-image-url-size.js.map