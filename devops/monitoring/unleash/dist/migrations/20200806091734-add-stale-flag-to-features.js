'use strict';
exports.up = function (db, cb) {
    return db.addColumn('features', 'stale', {
        type: 'boolean',
        defaultValue: false,
    }, cb);
};
exports.down = function (db, cb) {
    return db.removeColumn('features', 'stale', cb);
};
//# sourceMappingURL=20200806091734-add-stale-flag-to-features.js.map