'use strict';
exports.up = function (db, callback) {
    db.runSql(`
          UPDATE permissions SET display_name = 'Skip change request process' WHERE permission = 'SKIP_CHANGE_REQUEST';
        `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
        UPDATE permissions SET display_name = 'Skip change request process (API-only)' WHERE permission = 'SKIP_CHANGE_REQUEST';
        `, callback);
};
//# sourceMappingURL=20230411085947-skip-change-request-ui.js.map