import { HttpException, HttpStatus } from '@nestjs/common';

export class LoginException extends HttpException {
  constructor(message: string = 'Invalid credentials') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
