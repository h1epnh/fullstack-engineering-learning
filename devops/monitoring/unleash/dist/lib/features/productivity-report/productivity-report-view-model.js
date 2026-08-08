"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productivityReportViewModel = void 0;
const RED = '#d93644';
const GREEN = '#68a611';
const ORANGE = '#d76500';
const productivityReportViewModel = ({ unleashUrl, userEmail, userName, metrics, }) => ({
    userName,
    userEmail,
    ...metrics,
    unleashUrl,
    healthColor() {
        const healthRating = this.health;
        const healthColor = healthRating >= 0 && healthRating <= 24
            ? RED
            : healthRating >= 25 && healthRating <= 74
                ? ORANGE
                : GREEN;
        return healthColor;
    },
    actionText() {
        const improveMessage = 'Remember to archive stale flags to reduce technical debt and keep your project healthy';
        const previousHealth = this.previousMonth?.health || 0;
        if (this.health <= 74) {
            return improveMessage;
        }
        if (this.health < previousHealth) {
            return improveMessage;
        }
        return null;
    },
    healthTrendMessage() {
        return this.previousMonthText('%', this.health, this.previousMonth?.health);
    },
    flagsCreatedTrendMessage() {
        return this.previousMonthText('', this.flagsCreated, this.previousMonth?.flagsCreated);
    },
    productionUpdatedTrendMessage() {
        return this.previousMonthText('', this.productionUpdates, this.previousMonth?.productionUpdates);
    },
    previousMonthText(unit, currentValue, previousValue) {
        if (previousValue == null) {
            return null;
        }
        if (currentValue > previousValue) {
            return `<span style='color: ${GREEN}'>&#9650;</span> ${currentValue - previousValue}${unit} more than previous month`;
        }
        if (previousValue > currentValue) {
            return `<span style='color: ${RED}'>&#9660;</span> ${previousValue - currentValue}${unit} less than previous month`;
        }
        return `Same as last month`;
    },
});
exports.productivityReportViewModel = productivityReportViewModel;
//# sourceMappingURL=productivity-report-view-model.js.map