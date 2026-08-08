"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const log4js_1 = require("log4js");
const internals_1 = require("../../internals");
const event_service_1 = __importStar(require("./event-service"));
describe('filterPrivateProjectsFromParams', () => {
    it('should return IS_ANY_OF with allowed projects when projectParam is undefined and mode is limited', () => {
        const projectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2'],
        };
        const projectParam = undefined;
        const result = (0, event_service_1.filterAccessibleProjects)(projectParam, projectAccess);
        expect(result).toBe('IS_ANY_OF:project1,project2');
    });
    it('should return the original projectParam when mode is all', () => {
        const projectAccess = {
            mode: 'all',
        };
        const projectParam = 'IS:project3';
        const result = (0, event_service_1.filterAccessibleProjects)(projectParam, projectAccess);
        expect(result).toBe(projectParam);
    });
    it('should filter out projects not in allowedProjects when mode is limited', () => {
        const projectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2'],
        };
        const projectParam = 'IS_ANY_OF:project1,project3';
        const result = (0, event_service_1.filterAccessibleProjects)(projectParam, projectAccess);
        expect(result).toBe('IS_ANY_OF:project1');
    });
    it('should return a single project if only one is allowed', () => {
        const projectAccess = {
            mode: 'limited',
            projects: ['project1'],
        };
        const projectParam = 'IS_ANY_OF:project1,project2';
        const result = (0, event_service_1.filterAccessibleProjects)(projectParam, projectAccess);
        expect(result).toBe('IS_ANY_OF:project1');
    });
    it('should return undefined if projectParam is undefined and projectAccess mode is all', () => {
        const projectAccess = {
            mode: 'all',
        };
        const projectParam = undefined;
        const result = (0, event_service_1.filterAccessibleProjects)(projectParam, projectAccess);
        expect(result).toBeUndefined();
    });
    it('should return the original projectParam if all projects are allowed when mode is limited', () => {
        const projectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2', 'project3'],
        };
        const projectParam = 'IS_ANY_OF:project1,project2';
        const result = (0, event_service_1.filterAccessibleProjects)(projectParam, projectAccess);
        expect(result).toBe('IS_ANY_OF:project1,project2');
    });
    it('should throw an error if no projects match', () => {
        const projectAccess = {
            mode: 'limited',
            projects: ['project1', 'project2'],
        };
        const projectParam = 'IS_ANY_OF:project3,project4';
        expect(() => (0, event_service_1.filterAccessibleProjects)(projectParam, projectAccess)).toThrow('No accessible projects in the search parameters');
    });
});
describe('storeEvents', () => {
    test.each([
        {},
        {
            data: {
                name: 'test',
            },
        },
        {
            predata: {
                name: 'pretest',
            },
            data: {
                name: 'test',
            },
        },
    ])('should store the event %s', async (preDataAndData) => {
        const eventStore = {
            batchStore: jest.fn(),
        };
        const eventService = new event_service_1.default({
            eventStore,
            featureTagStore: {
                getAllByFeatures: jest.fn().mockReturnValue([]),
            },
        }, { getLogger: log4js_1.getLogger, eventBus: undefined }, undefined, undefined);
        const event = {
            type: internals_1.USER_UPDATED,
            createdBy: 'test',
            createdByUserId: 1,
            ip: '127.0.0.1',
            ...preDataAndData,
        };
        await eventService.storeEvent(event);
        expect(eventStore.batchStore).toHaveBeenCalledWith([event]);
    });
    test('should not store the event when predata and data are the same', async () => {
        const eventStore = {
            batchStore: jest.fn(),
        };
        const eventService = new event_service_1.default({
            eventStore,
            featureTagStore: {
                getAllByFeatures: jest.fn().mockReturnValue([]),
            },
        }, { getLogger: log4js_1.getLogger, eventBus: undefined }, undefined, undefined);
        const event = {
            type: internals_1.USER_UPDATED,
            createdBy: 'test',
            createdByUserId: 1,
            ip: '127.0.0.1',
            preData: {
                name: 'test',
                nest: {
                    this: 'object',
                },
            },
            data: {
                name: 'test',
                nest: {
                    this: 'object',
                },
            },
        };
        await eventService.storeEvent(event);
        expect(eventStore.batchStore).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=event-service.test.js.map