'use strict';
exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE change_request_schedule
        ALTER COLUMN status TYPE text USING status::text;

        COMMIT;

        DROP TYPE IF EXISTS change_request_schedule_status CASCADE
    `, cb);
};
exports.down = function (db, cb) {
    db.runSql(`
      CREATE TYPE change_request_schedule_status AS ENUM ('pending', 'failed');

      ALTER TABLE change_request_schedule
      ALTER COLUMN status TYPE change_request_schedule_status USING status::change_request_schedule_status;

    `, cb);
};
//# sourceMappingURL=20231103064746-change-request-schedule-change-type.js.map