"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStrategyToFeatureEnv = exports.createFeatureFlag = exports.ADMIN_BASE_PATH = exports.FEATURES_BASE_PATH = void 0;
exports.FEATURES_BASE_PATH = '/api/admin/projects/default/features';
exports.ADMIN_BASE_PATH = '/api/admin';
const createFeatureFlag = (app, postData, expectStatusCode = 201) => app.request
    .post(exports.FEATURES_BASE_PATH)
    .send(postData)
    .expect(expectStatusCode);
exports.createFeatureFlag = createFeatureFlag;
const addStrategyToFeatureEnv = (app, postData, envName, featureName, expectStatusCode = 200) => {
    const url = `${exports.ADMIN_BASE_PATH}/projects/default/features/${featureName}/environments/${envName}/strategies`;
    return app.request.post(url).send(postData).expect(expectStatusCode);
};
exports.addStrategyToFeatureEnv = addStrategyToFeatureEnv;
//# sourceMappingURL=app.utils.js.map