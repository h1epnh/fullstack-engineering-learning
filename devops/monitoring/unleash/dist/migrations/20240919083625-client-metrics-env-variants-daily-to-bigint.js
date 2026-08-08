"use strict";
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE client_metrics_env_variants_daily ALTER COLUMN count TYPE BIGINT`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE client_metrics_env_variants_daily ALTER COLUMN count TYPE INT`, cb);
};
//# sourceMappingURL=20240919083625-client-metrics-env-variants-daily-to-bigint.js.map