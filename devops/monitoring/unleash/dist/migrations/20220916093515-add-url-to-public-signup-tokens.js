'use strict';
exports.up = function (db, callback) {
    db.runSql(`
            ALTER table public_signup_tokens
                ADD COLUMN IF NOT EXISTS url text
       `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
            ALTER table public_signup_tokens
                DROP COLUMN url
        `, callback);
};
//# sourceMappingURL=20220916093515-add-url-to-public-signup-tokens.js.map