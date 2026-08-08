'use strict';
exports.up = function (db, cb) {
    db.runSql(`
    DELETE FROM client_instances a USING client_instances b WHERE a.app_name = b.app_name AND a.instance_id = b.instance_id AND a.created_at < b.created_at;
    ALTER TABLE client_instances ADD PRIMARY KEY (app_name, instance_id);
  `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
        ALTER TABLE client_instances DROP CONSTRAINT client_instances_pkey;
        DROP INDEX IF EXISTS client_instance_pkey
    `, cb);
};
//# sourceMappingURL=20210302080040-add-pk-to-client-instances.js.map