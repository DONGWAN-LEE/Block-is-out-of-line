import { ApiProperty } from '@nestjs/swagger';
import { ErrorDto } from './error.dto.js';

export class ApiResponse<T> {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response payload, null on failure',
    nullable: true,
  })
  data: T | null;

  @ApiProperty({
    description: 'Error details, null on success',
    type: ErrorDto,
    nullable: true,
  })
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
