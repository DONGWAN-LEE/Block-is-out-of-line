import { ErrorDto } from './error.dto.js';

export class ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorDto | null;

  private constructor(success: boolean, data: T | null, error: ErrorDto | null) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static ok<T>(data: T): ApiResponse<T> {
    return new ApiResponse<T>(true, data, null);
  }

  static fail<T>(error: ErrorDto): ApiResponse<T> {
    return new ApiResponse<T>(false, null, error);
  }
}
