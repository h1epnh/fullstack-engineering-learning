export {};
/** TODO: Make this run properly
test('should fail creation of PAT when PAT limit has been reached', async () => {
    const setup = await setupAppWithoutSupertest(db.stores);
    const address = setup.server.address();
    expect(address).not.toBeNull();
    expect(address).toHaveProperty('port');
    // @ts-ignore We just checked that we do indeed have the port
    const baseUrl = `http://localhost:${address.port}`;

    const tokenCreations: Promise<any>[] = [];
    const tokenUrl = `${baseUrl}/api/admin/user/tokens`;
    for (let i = 0; i < PAT_LIMIT; i++) {
        tokenCreations.push(
            fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: `my pat ${i}`,
                    expiresAt: tomorrow,
                }),
                credentials: 'include',
            }).catch((rej) => {
                console.log('Rejected');
            }),
        );
    }
    await Promise.all(tokenCreations);
    expect(tokenCreations).toHaveLength(PAT_LIMIT);
    const denied = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            description: `my pat ${PAT_LIMIT}`,
            expiresAt: tomorrow,
        }),
    });
    expect(denied.status).toBe(403);
    await setup.destroy();
});
*/
//# sourceMappingURL=pat.e2e.test.d.ts.map