import { register } from 'prom-client';
import { PrometheusController } from './prometheus.controller';

describe('PrometheusController', () => {
  it('writes Prometheus metrics as text/plain', async () => {
    jest.spyOn(register, 'metrics').mockResolvedValueOnce('metrics-body');
    const response = {
      set: jest.fn(),
      end: jest.fn(),
    };
    const controller = new PrometheusController();

    await controller.index(response as never);

    expect(response.set).toHaveBeenCalledWith('Content-Type', register.contentType);
    expect(response.end).toHaveBeenCalledWith('metrics-body');
  });
});
