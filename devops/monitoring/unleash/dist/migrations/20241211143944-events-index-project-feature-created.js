'use strict';
exports.up = function (db, callback) {
    db.runSql(`
          CREATE INDEX idx_events_project_feature_created
            ON events (project, feature_name, created_at DESC);
        `, callback);
};
exports.down = function (db, callback) {
    db.runSql(`
           DROP INDEX idx_events_project_feature_created;
        `, callback);
};
//# sourceMappingURL=20241211143944-events-index-project-feature-created.js.map