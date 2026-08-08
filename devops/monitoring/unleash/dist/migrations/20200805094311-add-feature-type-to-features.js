'use strict';
exports.up = function (db, cb) {
    return db.addColumn('features', 'type', {
        type: 'string',
        defaultValue: 'release',
    }, cb);
};
exports.down = function (db, cb) {
    return db.removeColumn('features', 'type', cb);
};
//# sourceMappingURL=20200805094311-add-feature-type-to-features.js.map