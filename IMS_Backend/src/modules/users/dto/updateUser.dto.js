// src/modules/users/dto/updateUser.dto.js

class UpdateUserDto {
  constructor(data) {
    if (data.email !== undefined) this.email = data.email;
    if (data.full_name !== undefined) this.full_name = data.full_name;
    if (data.roleId !== undefined) this.role_id = data.roleId;
    if (data.branch_id !== undefined) this.branch_id = data.branch_id;
    if (data.user_type !== undefined) this.user_type = data.user_type;
    if (data.supervisor_id !== undefined) this.supervisor_id = data.supervisor_id;
    if (data.is_suspended_from_clearance !== undefined) {
      this.is_suspended_from_clearance = data.is_suspended_from_clearance;
    }
  }

  static from(data) {
    return new UpdateUserDto(data);
  }
}

export default UpdateUserDto;
