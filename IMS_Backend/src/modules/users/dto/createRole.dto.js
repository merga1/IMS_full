// src/modules/users/dto/createRole.dto.js

class CreateRoleDto {
  constructor(data) {
    this.role_name = data.role_name;
    this.role_rank = data.role_rank;
    this.permissionIds = data.permissionIds || [];
  }

  static from(data) {
    return new CreateRoleDto(data);
  }
}

export default CreateRoleDto;
