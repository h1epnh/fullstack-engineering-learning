"use strict";
exports.up = function (db, cb) {
    db.runSql(`
            INSERT INTO feature_lifecycles (feature, stage, created_at)
            SELECT features.name, 'initial', features.created_at
            FROM features
                LEFT JOIN feature_lifecycles ON features.name = feature_lifecycles.feature
            WHERE feature_lifecycles.feature IS NULL;
        `, cb);
};
exports.down = function (db, cb) {
    db.runSql(``, cb);
};
//# sourceMappingURL=20240506141345-lifecycle-initial-stage.js.map