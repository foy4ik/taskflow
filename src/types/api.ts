export interface ApiSuccess<T> {
  data: T;
}

export interface ApiSuccessWithMeta<T, M> {
  data: T;
  meta: M;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
