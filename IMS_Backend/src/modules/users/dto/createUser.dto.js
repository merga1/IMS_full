// src/modules/users/dto/createUser.dto.js

class CreateUserDto {
  constructor(data) {
    this.fayda_id = data.fayda_id;
    this.email = data.email;
    this.password = data.password;
    this.full_name = data.full_name;
    this.role_id = data.roleId;
    this.branch_id = data.branch_id ?? null;
    this.user_type = data.user_type || 'EMPLOYEE';
    this.supervisor_id = data.supervisor_id ?? null;
  }

  static from(data) {
    return new CreateUserDto(data);
  }
}

export default CreateUserDto;
