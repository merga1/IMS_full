// src/modules/users/dto/assignPermission.dto.js

class AssignPermissionDto {
  constructor(data) {
    this.permissionIds = data.permissionIds || [];
  }

  static from(data) {
    return new AssignPermissionDto(data);
  }
}

export default AssignPermissionDto;