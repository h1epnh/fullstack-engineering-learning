"use strict";
exports.up = function (db, cb) {
    db.runSql(`INSERT INTO permissions (permission, display_name, type) VALUES
        ('UPDATE_PROJECT_SEGMENT', 'Create/edit project segment', 'project');`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`DELETE FROM permissions WHERE permission = 'UPDATE_PROJECT_SEGMENT';`, cb);
};
//# sourceMappingURL=20230309174400-add-project-segment-permission.js.map