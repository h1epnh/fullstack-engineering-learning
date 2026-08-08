"use strict";
exports.up = function (db, cb) {
    db.runSql(`
    CREATE TABLE IF NOT EXISTS unique_connections
    (
        id VARCHAR(255) PRIMARY KEY NOT NULL,
        updated_at TIMESTAMP DEFAULT now(),
        hll BYTEA NOT NULL
    );
`, cb);
};
exports.down = function (db, cb) {
    db.runSql(`DROP TABLE unique_connections;`, cb);
};
//# sourceMappingURL=20250109150818-unique-connections-table.js.map