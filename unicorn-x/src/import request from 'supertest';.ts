import request from 'supertest';
import app from './index';

describe('UnicornX Express App', () => {
  it('GET /api/health should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('environment');
    expect(res.body).toHaveProperty('services');
  });

  it('GET /non-existent should return 404', async () => {
    const res = await request(app).get('/non-existent');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not found');
  });

  it('POST /api/commands/process with invalid input returns 400', async () => {
    const res = await request(app)
      .post('/api/commands/process')
      .send({ input: 123 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid input');
  });

  it('POST /api/commands/execute with missing fields returns 400', async () => {
    const res = await request(app)
      .post('/api/commands/execute')
      .send({ intent: null, plan: null });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid request');
  });

  it('POST /api/dashboards/create with missing fields returns 400', async () => {
    const res = await request(app)
      .post('/api/dashboards/create')
      .send({ title: 'Test Dashboard' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid configuration');
  });

  it('POST /api/cache/clear should return success', async () => {
    const res = await request(app).post('/api/cache/clear');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('GET /api/cache/stats should return stats', async () => {
    const res = await request(app).get('/api/cache/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('stats');
  });
});
