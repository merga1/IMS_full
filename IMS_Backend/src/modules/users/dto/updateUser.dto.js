// src/modules/users/dto/updateUser.dto.js

class UpdateUserDto {
  constructor(data) {
    if (data.email !== undefined) this.email = data.email;
    if (data.name !== undefined) this.name = data.name;
    if (data.department !== undefined) this.department = data.department;
    if (data.clearanceLevel !== undefined) this.clearanceLevel = data.clearanceLevel;
    if (data.roleId !== undefined) this.roleId = data.roleId;
    if (data.active !== undefined) this.active = data.active;
  }

  static from(data) {
    return new UpdateUserDto(data);
  }
}

export default UpdateUserDto;
