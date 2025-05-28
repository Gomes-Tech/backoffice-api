export class UserResponseDTO {
  name: string;
  email: string;
  role: string;
  photo?: string;

  constructor(name: string, email: string, role: string, photo?: string) {
    this.name = name;
    this.email = email;
    this.role = role;
    this.photo = photo || null;
  }
}
