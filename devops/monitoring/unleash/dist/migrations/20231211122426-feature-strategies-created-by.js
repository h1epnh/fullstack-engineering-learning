'use strict';
exports.up = function (db, callback) {
    db.runSql(`
        ALTER TABLE feature_strategies ADD COLUMN IF NOT EXISTS created_by INTEGER;
        `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
        ALTER TABLE feature_strategies DROP COLUMN IF EXISTS created_by;
        `, callback);
};
//# sourceMappingURL=20231211122426-feature-strategies-created-by.js.map