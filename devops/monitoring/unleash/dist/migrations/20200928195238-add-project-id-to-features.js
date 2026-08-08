'use strict';
exports.up = function (db, cb) {
    return db.addColumn('features', 'project', {
        type: 'string',
        defaultValue: 'default',
    }, cb);
};
exports.down = function (db, cb) {
    return db.removeColumn('features', 'project', cb);
};
//# sourceMappingURL=20200928195238-add-project-id-to-features.js.map