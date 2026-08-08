"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const role_schema_1 = require("./role-schema");
test('role schema rejects a role without a name', async () => {
    expect.assertions(1);
    const role = {
        permissions: [],
    };
    try {
        await role_schema_1.roleSchema.validateAsync(role);
    }
    catch (error) {
        expect(error.details[0].message).toBe('"name" is required');
    }
});
test('role schema allows a role with an empty description', async () => {
    const role = {
        name: 'Brønsted',
        description: '',
    };
    const value = await role_schema_1.roleSchema.validateAsync(role);
    expect(value.description).toEqual('');
});
test('role schema rejects a role with a broken permission list', async () => {
    expect.assertions(1);
    const role = {
        name: 'Mendeleev',
        permissions: [
            {
                aPropertyThatIsAproposToNothing: true,
            },
        ],
    };
    try {
        await role_schema_1.roleSchema.validateAsync(role);
    }
    catch (error) {
        expect(error.details[0].message).toBe('"permissions[0]" must contain at least one of [id, name]');
    }
});
test('role schema allows a role with an empty permission list', async () => {
    const role = {
        name: 'Avogadro',
        permissions: [],
    };
    const value = await role_schema_1.roleSchema.validateAsync(role);
    expect(value.permissions).toEqual([]);
});
test('role schema allows a role with a null list', async () => {
    const role = {
        name: 'Curie',
        permissions: null,
    };
    const value = await role_schema_1.roleSchema.validateAsync(role);
    expect(value.permissions).toEqual(null);
});
test('role schema allows an undefined with a null list', async () => {
    const role = {
        name: 'Fischer',
    };
    const value = await role_schema_1.roleSchema.validateAsync(role);
    expect(value.permissions).toEqual(undefined);
});
test('role schema strips roleType if present', async () => {
    const role = {
        name: 'Grignard',
        roleType: 'Organic Chemistry',
    };
    const value = await role_schema_1.roleSchema.validateAsync(role);
    expect(value.roleType).toEqual(undefined);
});
//# sourceMappingURL=role-schema.test.js.map