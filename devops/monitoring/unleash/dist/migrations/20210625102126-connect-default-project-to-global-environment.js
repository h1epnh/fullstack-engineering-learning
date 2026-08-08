"use strict";
exports.up = function (db, cb) {
    db.runSql(`
    INSERT INTO project_environments(project_id, environment_name) VALUES ('default', ':global:');
  `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
    DELETE FROM project_environments WHERE project_id = 'default' AND environment_name = ':global:';
  `, cb);
};
exports._meta = {
    version: 1,
};
//# sourceMappingURL=20210625102126-connect-default-project-to-global-environment.js.map