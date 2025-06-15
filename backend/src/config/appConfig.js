require('dotenv').config();

const config = {
    app: {
        port: parseInt(process.env.PORT || '5000', 10),
        env: process.env.NODE_ENV || 'development',
        corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000']
    },
    db: {
        uri: process.env.MONGODB_URI,
        options: {
            serverSelectionTimeoutMS: 5000,
            ssl: true,
            tlsInsecure: true
        }
    },
    email: {
        enabled: process.env.EMAIL_ENABLED === 'true',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASSWORD || ''
        }
    },
    push: {
        enabled: process.env.PUSH_ENABLED === 'true',
        email: process.env.PUSH_EMAIL || '',
        publicKey: process.env.PUSH_PUBLIC_KEY || '',
        privateKey: process.env.PUSH_PRIVATE_KEY || ''
    }
};

// Validate required configuration based on environment
const validateConfig = () => {
    // Always required configs
    const required = {
        'app.port': config.app.port,
        'db.uri': config.db.uri
    };

    // Production-only required configs
    if (config.app.env === 'production') {
        if (config.email.enabled) {
            required['email.host'] = config.email?.host;
            required['email.auth.user'] = config.email?.auth?.user;
            required['email.auth.pass'] = config.email?.auth?.pass;
        }
        if (config.push.enabled) {
            required['push.email'] = config.push?.email;
            required['push.publicKey'] = config.push?.publicKey;
            required['push.privateKey'] = config.push?.privateKey;
        }
    }

    const missing = Object.entries(required)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }

    // Log configuration
    console.log('Server configuration:');
    console.log(`- Environment: ${config.app.env}`);
    console.log(`- Port: ${config.app.port}`);
    console.log(`Email enabled: ${config.email.enabled}`);
    console.log(`Push notifications enabled: ${config.push.enabled}`);
};

validateConfig();

module.exports = config;