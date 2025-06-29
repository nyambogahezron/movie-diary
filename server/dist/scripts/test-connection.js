"use strict";
const { prisma } = require('../config/database.ts');
async function testConnection() {
    try {
        console.log('Testing Prisma Accelerate connection...');
        // Test with Prisma
        const userCount = await prisma.user.count();
        console.log('Prisma connection successful! User count:', userCount);
        console.log('Connection test completed successfully!');
    }
    catch (error) {
        console.error('Connection test failed:', error);
        console.error('Full error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testConnection();
//# sourceMappingURL=test-connection.js.map