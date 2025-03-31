const express = require('express');
const { initialize, isEnabled } = require('unleash-client');

const app = express();
const port = 3001;

// --- Unleash Initialization ---
let unleashInstance; // Use let if you might re-initialize or handle errors later

try {
    unleashInstance = initialize({
        url: 'http://localhost:4242/api/', // Your Unleash server URL
        appName: 'my-greeter-app',      // Name of this application
        instanceId: 'my-app-instance-1', // Unique instance ID (optional but good practice)
        environment: 'development',     // Matches the environment in Unleash UI
        refreshInterval: 5000,          // How often (ms) the SDK polls for changes (e.g., 5 seconds)
        customHeaders: {                // Authentication!
            'Authorization': 'default:development.6e86117d6fef20c7fbe99c9be3c093511a16021899e56b70a6319a12', // <-- PASTE YOUR CLIENT TOKEN HERE
        },
    });

    unleashInstance.on('error', console.error); // Log errors
    unleashInstance.on('warn', console.warn);   // Log warnings
    unleashInstance.on('ready', () => {        // Log when SDK is ready
        console.log('Unleash SDK is ready!');
    });

    // Give the SDK a little time to fetch initial data on startup
    // In a real app, you might have a health check or wait for the 'ready' event
    console.log('Initializing Unleash, waiting a moment...');

} catch (error) {
    console.error('Failed to initialize Unleash:', error);
    // Handle initialization failure (e.g., exit, run in offline mode)
}
// -----------------------------

app.get('/', (req, res) => {
    // Get userId from query parameter for demo purposes
    const userId = req.query.userId || 'anonymous'; // Default to 'anonymous' if no userId provided

    // --- Unleash Context ---
    const unleashContext = {
        userId: userId,
        // You can add other context fields here:
        // sessionId: req.session?.id, // If using sessions
        // remoteAddress: req.ip,
        // properties: { deviceType: 'mobile' } // Custom properties
    };
    // -----------------------

    // --- Check the Feature Toggle ---
    // isEnabled(toggleName, context, defaultValue)
    const useNewGreeter = isEnabled('newGreeterMessage', unleashContext, false);
    // ------------------------------

    let greeting;
    if (useNewGreeter) {
        console.log(`User '${userId}' - Serving NEW greeting. ${useNewGreeter}`);
        greeting = `👋 Hello there, ${userId}! Welcome to the enhanced experience!`;
    } else {
        console.log(`User '${userId}' - Serving OLD greeting. ${useNewGreeter}`);
        greeting = `Hi ${userId}, welcome.`;
    }

    res.send(`<h1>${greeting}</h1>`);
});

app.listen(port, () => {
    console.log(`Greeter app listening at http://localhost:${port}`);
    console.log('Try visiting:');
    console.log(`  http://localhost:${port}`);
    console.log(`  http://localhost:${port}?userId=testUser1`);
    console.log(`  http://localhost:${port}?userId=anotherUser`);
});

// Graceful shutdown for Unleash client
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing Unleash client');
    if (unleashInstance) {
        unleashInstance.destroy();
    }
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing Unleash client');
    if (unleashInstance) {
        unleashInstance.destroy();
    }
    process.exit(0);
});
