"use strict";
exports.up = function (db, cb) {
    db.runSql(`SELECT id
                                   FROM projects`, (err, results) => {
        results.rows.forEach((project) => {
            db.runSql(`INSERT INTO project_environments(project_id, environment_name) VALUES (?, ':global:') ON CONFLICT DO NOTHING;`, [project.id]);
        });
        cb();
    });
};
exports.down = function (db, cb) {
    db.runSql('DELETE FROM project_environments', cb);
};
//# sourceMappingURL=20210830113948-connect-projects-to-global-envrionments.js.map