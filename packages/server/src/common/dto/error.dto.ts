import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({
    description: 'Error code like AUTH_001',
    example: 'AUTH_001',
  })
  code: string;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Invalid or expired token',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Additional error details (optional)',
    example: { field: 'deviceId', issue: 'must not be empty' },
  })
  details?: any;

  constructor(code: string, message: string, details?: any) {
    this.code = code;
    this.message = message;
    if (details !== undefined) {
      this.details = details;
    }
  }
}
