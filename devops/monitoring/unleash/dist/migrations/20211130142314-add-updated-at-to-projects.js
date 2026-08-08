'use strict';
exports.up = function (db, callback) {
    db.runSql('ALTER TABLE projects ADD COLUMN "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now();', callback);
};
exports.down = function (db, callback) {
    db.runSql('ALTER TABLE projects DROP COLUMN "updated_at";', callback);
};
//# sourceMappingURL=20211130142314-add-updated-at-to-projects.js.map