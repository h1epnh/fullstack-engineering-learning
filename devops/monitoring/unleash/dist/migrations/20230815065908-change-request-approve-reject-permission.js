'use strict';
exports.up = function (db, callback) {
    db.runSql(`
          UPDATE permissions SET display_name = 'Approve/Reject change requests' WHERE permission = 'APPROVE_CHANGE_REQUEST';
        `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
           UPDATE permissions SET display_name = 'Approve change requests' WHERE permission = 'APPROVE_CHANGE_REQUEST';
        `, callback);
};
//# sourceMappingURL=20230815065908-change-request-approve-reject-permission.js.map