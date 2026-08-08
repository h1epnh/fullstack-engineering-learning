'use strict';
exports.up = function (db, callback) {
    db.runSql('ALTER TABLE strategies ADD "parameters_template" json;', callback);
};
exports.down = function (db, callback) {
    db.runSql('ALTER TABLE strategies DROP COLUMN "parameters_template";', callback);
};
//# sourceMappingURL=20141117200435-add-parameters-template-to-strategies.js.map