"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_impl_1 = require("./lib/server-impl");
try {
    (0, server_impl_1.start)();
}
catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit();
}
//# sourceMappingURL=server.js.map