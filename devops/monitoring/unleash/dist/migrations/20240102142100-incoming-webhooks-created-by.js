"use strict";
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE incoming_webhooks ALTER COLUMN created_by_user_id DROP NOT NULL;
        ALTER TABLE incoming_webhook_tokens ALTER COLUMN created_by_user_id DROP NOT NULL;
        `, cb);
};
exports.down = function (db, callback) {
    callback();
};
//# sourceMappingURL=20240102142100-incoming-webhooks-created-by.js.map