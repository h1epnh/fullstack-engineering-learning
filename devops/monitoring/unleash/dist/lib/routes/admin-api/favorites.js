"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = __importDefault(require("../controller"));
const types_1 = require("../../types");
const openapi_1 = require("../../openapi");
class FavoritesController extends controller_1.default {
    constructor(config, { favoritesService, openApiService, }) {
        super(config);
        this.logger = config.getLogger('/routes/favorites-controller');
        this.favoritesService = favoritesService;
        this.openApiService = openApiService;
        this.route({
            method: 'post',
            path: '/:projectId/features/:featureName/favorites',
            handler: this.addFavoriteFeature,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'addFavoriteFeature',
                    summary: 'Add feature to favorites',
                    description: 'This endpoint marks the feature in the url as favorite',
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(401, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:projectId/features/:featureName/favorites',
            handler: this.removeFavoriteFeature,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    operationId: 'removeFavoriteFeature',
                    summary: 'Remove feature from favorites',
                    description: 'This endpoint removes the feature in the url from favorites',
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(401, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'post',
            path: '/:projectId/favorites',
            handler: this.addFavoriteProject,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Add project to favorites',
                    description: 'This endpoint marks the project in the url as favorite',
                    operationId: 'addFavoriteProject',
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(401, 404),
                    },
                }),
            ],
        });
        this.route({
            method: 'delete',
            path: '/:projectId/favorites',
            handler: this.removeFavoriteProject,
            permission: types_1.NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Features'],
                    summary: 'Remove project from favorites',
                    description: 'This endpoint removes the project in the url from favorites',
                    operationId: 'removeFavoriteProject',
                    responses: {
                        200: openapi_1.emptyResponse,
                        ...(0, openapi_1.getStandardResponses)(401, 404),
                    },
                }),
            ],
        });
    }
    async addFavoriteFeature(req, res) {
        const { featureName } = req.params;
        const { user } = req;
        await this.favoritesService.favoriteFeature({
            feature: featureName,
            user,
        }, req.audit);
        res.status(200).end();
    }
    async removeFavoriteFeature(req, res) {
        const { featureName } = req.params;
        const { user } = req;
        await this.favoritesService.unfavoriteFeature({
            feature: featureName,
            user,
        }, req.audit);
        res.status(200).end();
    }
    async addFavoriteProject(req, res) {
        const { projectId } = req.params;
        const { user } = req;
        await this.favoritesService.favoriteProject({
            project: projectId,
            user,
        }, req.audit);
        res.status(200).end();
    }
    async removeFavoriteProject(req, res) {
        const { projectId } = req.params;
        const { user } = req;
        await this.favoritesService.unfavoriteProject({
            project: projectId,
            user: user,
        }, req.audit);
        res.status(200).end();
    }
}
exports.default = FavoritesController;
//# sourceMappingURL=favorites.js.map