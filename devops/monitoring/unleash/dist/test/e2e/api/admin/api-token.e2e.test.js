"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_helper_1 = require("../../helpers/test-helper");
const database_init_1 = __importDefault(require("../../helpers/database-init"));
const no_logger_1 = __importDefault(require("../../../fixtures/no-logger"));
const api_token_1 = require("../../../../lib/types/models/api-token");
const util_1 = require("../../../../lib/util");
const date_fns_1 = require("date-fns");
let db;
let app;
beforeAll(async () => {
    db = await (0, database_init_1.default)('token_api_serial', no_logger_1.default);
    app = await (0, test_helper_1.setupAppWithCustomConfig)(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    }, db.rawDatabase);
});
afterAll(async () => {
    if (db) {
        await db.destroy();
    }
    await app.destroy();
});
afterEach(async () => {
    await db.stores.apiTokenStore.deleteAll();
});
test('returns empty list of tokens', async () => {
    return app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.tokens.length).toBe(0);
    });
});
test('creates new client token', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        username: 'default-client',
        type: 'client',
    })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
        expect(res.body.username).toBe('default-client');
        expect(res.body.tokenName).toBe(res.body.username);
        expect(res.body.type).toBe('client');
        expect(res.body.createdAt).toBeTruthy();
        expect(res.body.secret.length > 16).toBe(true);
    });
});
test('update client token with expiry', async () => {
    const tokenSecret = '*:environment.random-secret-update';
    await db.stores.apiTokenStore.insert({
        username: 'test',
        projects: ['*'],
        tokenName: 'test_token',
        secret: tokenSecret,
        type: api_token_1.ApiTokenType.CLIENT,
        environment: 'development',
    });
    await app.request
        .put(`/api/admin/api-tokens/${tokenSecret}`)
        .send({
        expiresAt: new Date(),
    })
        .set('Content-Type', 'application/json')
        .expect(200);
    return app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.tokens.length).toBe(1);
        expect(res.body.tokens[0].expiresAt).toBeTruthy();
    });
});
test('creates a lot of client tokens', async () => {
    const requests = [];
    for (let i = 0; i < 10; i++) {
        requests.push(app.request
            .post('/api/admin/api-tokens')
            .send({
            username: 'default-client',
            type: 'client',
        })
            .set('Content-Type', 'application/json')
            .expect(201));
    }
    await Promise.all(requests);
    expect.assertions(4);
    await app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.tokens.length).toBe(10);
        expect(res.body.tokens[2].type).toBe('client');
    });
    await app.request
        .get('/api/admin/api-tokens/default-client')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.tokens.length).toBe(10);
        expect(res.body.tokens[2].type).toBe('client');
    });
});
test('removes api token', async () => {
    const tokenSecret = '*:environment.random-secret';
    await db.stores.apiTokenStore.insert({
        environment: 'development',
        projects: ['*'],
        tokenName: 'testtoken',
        username: 'test',
        secret: tokenSecret,
        type: api_token_1.ApiTokenType.CLIENT,
    });
    await app.request
        .delete(`/api/admin/api-tokens/${tokenSecret}`)
        .set('Content-Type', 'application/json')
        .expect(200);
    return app.request
        .get('/api/admin/api-tokens')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
        expect(res.body.tokens.length).toBe(0);
    });
});
test('creates new client token: project & environment defaults to "*"', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        username: 'default-client',
        type: 'client',
    })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
        expect(res.body.type).toBe('client');
        expect(res.body.secret.length > 16).toBe(true);
        expect(res.body.environment).toBe(util_1.DEFAULT_ENV);
        expect(res.body.projects[0]).toBe(api_token_1.ALL);
    });
});
test('creates new client token with project & environment set', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        username: 'default-client',
        type: 'client',
        project: 'default',
        environment: util_1.DEFAULT_ENV,
    })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
        expect(res.body.type).toBe('client');
        expect(res.body.secret.length > 16).toBe(true);
        expect(res.body.environment).toBe(util_1.DEFAULT_ENV);
        expect(res.body.projects[0]).toBe('default');
    });
});
test('should prefix default token with "*:*."', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        username: 'default-client',
        type: 'client',
    })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
        expect(res.body.secret).toMatch(/\*:default\..*/);
    });
});
test('should prefix token with "project:environment."', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        username: 'default-client',
        type: 'client',
        project: 'default',
        environment: util_1.DEFAULT_ENV,
    })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
        expect(res.body.secret).toMatch(/default:default\..*/);
    });
});
test('should not create token for invalid projectId', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        username: 'default-client',
        type: 'client',
        project: 'bogus-project-something',
    })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect((res) => {
        expect(res.body.details[0].message).toMatch(/bogus-project-something/);
    });
});
test('should not create token for invalid environment', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        username: 'default-client',
        type: 'client',
        environment: 'bogus-environment-something',
    })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect((res) => {
        expect(res.body.details[0].message).toMatch(/bogus-environment-something/);
    });
});
test('needs one of the username and tokenName properties set', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        type: 'admin',
        environment: '*',
    })
        .set('Content-Type', 'application/json')
        .expect(400);
});
test('only one of tokenName and username can be set', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        username: 'default-client-name',
        tokenName: 'default-token-name',
        type: 'admin',
        environment: '*',
    })
        .set('Content-Type', 'application/json')
        .expect(400);
});
test('client tokens cannot span all environments', async () => {
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        username: 'default-client',
        type: 'client',
        environment: api_token_1.ALL,
    })
        .set('Content-Type', 'application/json')
        .expect(400);
});
test('should create token for disabled environment', async () => {
    await db.stores.environmentStore.create({
        name: 'disabledEnvironment',
        type: 'production',
        enabled: false,
    });
    return app.request
        .post('/api/admin/api-tokens')
        .send({
        username: 'default',
        type: 'client',
        project: 'default',
        environment: 'disabledEnvironment',
    })
        .set('Content-Type', 'application/json')
        .expect(201);
});
test('updating expiry of non existing token should yield 200', async () => {
    return app.request
        .put('/api/admin/api-tokens/randomnonexistingsecret')
        .send({ expiresAt: (0, date_fns_1.addDays)(new Date(), 14) })
        .set('Content-Type', 'application/json')
        .expect(200);
});
test('Deleting non-existing token should yield 200', async () => {
    return app.request
        .delete('/api/admin/api-tokens/random-non-existing-token')
        .expect(200);
});
//# sourceMappingURL=api-token.e2e.test.js.map