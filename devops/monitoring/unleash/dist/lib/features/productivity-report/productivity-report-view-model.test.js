"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const productivity_report_view_model_1 = require("./productivity-report-view-model");
const mockData = {
    unleashUrl: 'http://example.com',
    userEmail: 'user@example.com',
    userName: 'Test User',
};
const mockMetrics = {
    health: 0,
    flagsCreated: 0,
    productionUpdates: 0,
    previousMonth: {
        health: 0,
        flagsCreated: 0,
        productionUpdates: 0,
    },
};
describe('productivityReportViewModel', () => {
    describe('healthColor', () => {
        it('returns RED for health between 0 and 24', () => {
            const metrics = {
                ...mockMetrics,
                health: 20,
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.healthColor()).toBe('#d93644');
        });
        it('returns ORANGE for health between 25 and 74', () => {
            const metrics = {
                ...mockMetrics,
                health: 50,
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.healthColor()).toBe('#d76500');
        });
        it('returns GREEN for health 75 or above', () => {
            const metrics = {
                ...mockMetrics,
                health: 80,
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.healthColor()).toBe('#68a611');
        });
    });
    describe('healthTrendMessage', () => {
        it('returns correct trend message when health increased', () => {
            const metrics = {
                ...mockMetrics,
                health: 80,
                previousMonth: { ...mockMetrics.previousMonth, health: 70 },
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.healthTrendMessage()).toBe("<span style='color: #68a611'>&#9650;</span> 10% more than previous month");
        });
        it('returns correct trend message when health decreased', () => {
            const metrics = {
                ...mockMetrics,
                health: 60,
                previousMonth: { ...mockMetrics.previousMonth, health: 70 },
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.healthTrendMessage()).toBe("<span style='color: #d93644'>&#9660;</span> 10% less than previous month");
        });
        it('returns correct message when health is the same', () => {
            const metrics = {
                ...mockMetrics,
                health: 70,
                previousMonth: { ...mockMetrics.previousMonth, health: 70 },
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.healthTrendMessage()).toBe('Same as last month');
        });
    });
    describe('flagsCreatedTrendMessage', () => {
        it('returns correct trend message for flagsCreated increase', () => {
            const metrics = {
                ...mockMetrics,
                flagsCreated: 10,
                previousMonth: {
                    ...mockMetrics.previousMonth,
                    flagsCreated: 8,
                },
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.flagsCreatedTrendMessage()).toBe("<span style='color: #68a611'>&#9650;</span> 2 more than previous month");
        });
    });
    describe('productionUpdatedTrendMessage', () => {
        it('returns correct trend message for productionUpdates decrease', () => {
            const metrics = {
                ...mockMetrics,
                productionUpdates: 5,
                previousMonth: {
                    ...mockMetrics.previousMonth,
                    productionUpdates: 8,
                },
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.productionUpdatedTrendMessage()).toBe("<span style='color: #d93644'>&#9660;</span> 3 less than previous month");
        });
    });
    describe('Missing previous month data', () => {
        it('returns no trends messages', () => {
            const metrics = {
                health: 100,
                flagsCreated: 10,
                productionUpdates: 5,
                previousMonth: null,
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.healthTrendMessage()).toBe(null);
            expect(viewModel.flagsCreatedTrendMessage()).toBe(null);
            expect(viewModel.productionUpdatedTrendMessage()).toBe(null);
        });
    });
    describe('Action text', () => {
        it('healthy instance', () => {
            const metrics = {
                ...mockMetrics,
                health: 75,
                previousMonth: {
                    ...mockMetrics.previousMonth,
                    health: 75,
                },
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.actionText()).toBe(null);
        });
        it('health declined', () => {
            const metrics = {
                ...mockMetrics,
                health: 75,
                previousMonth: {
                    ...mockMetrics.previousMonth,
                    health: 76,
                },
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.actionText()).toBe('Remember to archive stale flags to reduce technical debt and keep your project healthy');
        });
        it('health improved but below healthy threshold', () => {
            const metrics = {
                ...mockMetrics,
                health: 74,
                previousMonth: {
                    ...mockMetrics.previousMonth,
                    health: 73,
                },
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.actionText()).toBe('Remember to archive stale flags to reduce technical debt and keep your project healthy');
        });
        it('healthy with no previous month data', () => {
            const metrics = {
                ...mockMetrics,
                health: 75,
                previousMonth: null,
            };
            const viewModel = (0, productivity_report_view_model_1.productivityReportViewModel)({
                ...mockData,
                metrics,
            });
            expect(viewModel.actionText()).toBe(null);
        });
    });
});
//# sourceMappingURL=productivity-report-view-model.test.js.map