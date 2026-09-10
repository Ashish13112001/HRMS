export type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export type ApiError = {
  success: false;
  message: string;
  code: string;
};

export function successResponse<T>(data: T, message: string): ApiSuccess<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(message: string, code: string): ApiError {
  return {
    success: false,
    message,
    code,
  };
}
