"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function registerGracefulShutdown(unleash, logger) {
    const unleashCloser = (signal) => async () => {
        try {
            logger.info(`Graceful shutdown signal (${signal}) received.`);
            await unleash.stop();
            logger.info('Unleash has been successfully stopped.');
            process.exit(0);
        }
        catch (e) {
            logger.error('Unable to shutdown Unleash. Hard exit!');
            process.exit(1);
        }
    };
    logger.debug('Registering graceful shutdown');
    process.on('SIGINT', unleashCloser('SIGINT'));
    process.on('SIGHUP', unleashCloser('SIGHUP'));
    process.on('SIGTERM', unleashCloser('SIGTERM'));
}
exports.default = registerGracefulShutdown;
//# sourceMappingURL=graceful-shutdown.js.map