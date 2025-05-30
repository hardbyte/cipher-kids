import { trace } from '@opentelemetry/api';

export const routerTracer = trace.getTracer('billing-web-router', '1.0.0');
