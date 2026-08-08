"use strict";
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE segments ADD COLUMN segment_project_id varchar(255) REFERENCES projects(id) ON DELETE CASCADE;`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE segments DROP COLUMN IF EXISTS segment_project_id;`, cb);
};
//# sourceMappingURL=20230306103400-add-project-column-to-segments.js.map