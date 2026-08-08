'use strict';
exports.up = function (db, callback) {
    db.runSql('ALTER TABLE client_instances ADD "sdk_version" varchar(255);', callback);
};
exports.down = function (db, callback) {
    db.runSql('ALTER TABLE client_instances DROP COLUMN "sdk_version";', callback);
};
//# sourceMappingURL=20170628205541-add-sdk-version-to-client-instances.js.map