import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('API Health Check', () => {
  it('API Is Running', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
