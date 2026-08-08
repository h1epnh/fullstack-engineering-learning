"use strict";
exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE api_tokens ADD COLUMN created_by INTEGER`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE api_tokens DROP COLUMN created_by`, cb);
};
//# sourceMappingURL=20231211134633-add-created-by-to-apitokens.js.map