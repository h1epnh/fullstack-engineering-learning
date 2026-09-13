CREATE TABLE connect_configs (
    name VARCHAR(255) NOT NULL,
    config BYTEA NOT NULL,
    PRIMARY KEY (name)
);

CREATE TABLE connect_offsets (
    id VARCHAR(255) NOT NULL,
    "offset" BYTEA NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE connect_statuses (
    id VARCHAR(255) NOT NULL,
    status BYTEA NOT NULL,
    PRIMARY KEY (id)
);



