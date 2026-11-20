export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: { requestId?: string; [key: string]: unknown };
}

export interface ApiFailure {
  success: false;
  statusCode: number;
  error: { code: string; message: string };
  meta?: { requestId?: string };
}
