export class ErrorDto {
  code: string;
  message: string;
  details?: any;

  constructor(code: string, message: string, details?: any) {
    this.code = code;
    this.message = message;
    if (details !== undefined) {
      this.details = details;
    }
  }
}
