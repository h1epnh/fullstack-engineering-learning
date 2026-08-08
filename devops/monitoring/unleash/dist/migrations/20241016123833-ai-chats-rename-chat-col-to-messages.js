"use strict";
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE ai_chats RENAME COLUMN chat TO messages;
        `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE ai_chats RENAME COLUMN messages TO chat;
        `, cb);
};
//# sourceMappingURL=20241016123833-ai-chats-rename-chat-col-to-messages.js.map