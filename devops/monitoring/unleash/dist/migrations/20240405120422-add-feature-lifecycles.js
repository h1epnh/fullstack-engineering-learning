'use strict';
exports.up = function (db, cb) {
    db.runSql(`
        CREATE TABLE IF NOT EXISTS feature_lifecycles (
            feature VARCHAR(255) NOT NULL REFERENCES features(name) ON DELETE CASCADE,
            stage VARCHAR(255) NULL,
            created_at TIMESTAMP WITH TIME ZONE default now(),
            PRIMARY KEY (feature, stage)
        );`, cb);
};
exports.down = function (db, cb) {
    db.runSql('DROP TABLE IF EXISTS feature_lifecycles;', cb);
};
//# sourceMappingURL=20240405120422-add-feature-lifecycles.js.map