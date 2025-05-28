import { User } from '@domain/user';
import { UserResponseDTO } from '@interfaces/http';

export class UserMapper {
  static toView(user: User): UserResponseDTO {
    return new UserResponseDTO(user.name, user.email, user.role, user.photo);
  }

  static toEntity(user: User): User {
    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.role,
      user.isActive,
      user.photo,
    );
  }
}
