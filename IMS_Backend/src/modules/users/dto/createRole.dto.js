// src/modules/users/dto/createRole.dto.js

class CreateRoleDto {
  constructor(data) {
    this.name = data.name;
    this.description = data.description || null;
    this.isSystem = data.isSystem || false;
    this.permissionIds = data.permissionIds || [];
  }

  static from(data) {
    return new CreateRoleDto(data);
  }
}

export default CreateRoleDto;