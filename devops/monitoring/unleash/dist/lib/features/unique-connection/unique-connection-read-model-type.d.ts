export interface IUniqueConnectionReadModel {
    getStats(): Promise<{
        previous: number;
        current: number;
        previousBackend: number;
        currentBackend: number;
        previousFrontend: number;
        currentFrontend: number;
    }>;
}
//# sourceMappingURL=unique-connection-read-model-type.d.ts.map