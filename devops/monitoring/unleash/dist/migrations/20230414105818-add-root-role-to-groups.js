'use strict';
exports.up = function (db, callback) {
    db.runSql(`
        ALTER TABLE groups ADD COLUMN root_role_id INTEGER DEFAULT NULL;
        ALTER TABLE groups
        ADD CONSTRAINT fk_group_role_id
                        FOREIGN KEY(root_role_id)
                            REFERENCES roles(id);
        `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
          ALTER TABLE groups DROP CONSTRAINT fk_group_role_id;
          ALTER TABLE groups DROP COLUMN root_role_id;
        `, callback);
};
//# sourceMappingURL=20230414105818-add-root-role-to-groups.js.map