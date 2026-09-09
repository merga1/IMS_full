// src/modules/users/dto/createUser.dto.js

class CreateUserDto {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.department = data.department || null;
    this.clearanceLevel = data.clearanceLevel || 1;
    this.roleId = data.roleId;
    this.active = data.active !== undefined ? data.active : true;
  }

  static from(data) {
    return new CreateUserDto(data);
  }
}

export default CreateUserDto;