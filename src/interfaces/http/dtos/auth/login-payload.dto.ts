import { User } from '@domain/user';

export class LoginPayloadDTO {
  id: string;

  constructor(user: User) {
    this.id = user.id;
  }
}
