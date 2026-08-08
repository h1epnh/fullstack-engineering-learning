'use strict';
exports.up = function (db, cb) {
    db.runSql(`
          ALTER TABLE feature_strategies ALTER COLUMN parameters SET DEFAULT '{}';
          UPDATE feature_strategies set parameters = '{}' where parameters is null;
          ALTER TABLE feature_strategies ALTER COLUMN parameters SET NOT NULL;
          `, cb);
};
exports.down = function (db, cb) {
    cb();
};
//# sourceMappingURL=20211013093114-feature-strategies-parameters-not-null.js.map