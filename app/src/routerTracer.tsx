import { trace } from '@opentelemetry/api';

export const routerTracer = trace.getTracer('web-router', '1.0.0');
