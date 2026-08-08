"use strict";
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE tag_types
        ADD COLUMN IF NOT EXISTS color VARCHAR(10);
        
        UPDATE tag_types
        SET color = '#FFFFFF'
        WHERE color IS NULL;
        `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE tag_types
        DROP COLUMN IF EXISTS color;
        `, cb);
};
//# sourceMappingURL=20250318091635-add-tag-type-color.js.map