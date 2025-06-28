import supertest from 'supertest';
import { createTestApp } from '../test-app';

describe('Health Check', () => {
	const app = createTestApp();
	const request = supertest(app);

	it('should return status 200 and ok message', async () => {
		const response = await request.get('/');

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			status: 'ok',
			message: 'Server is running',
		});
	});
});
