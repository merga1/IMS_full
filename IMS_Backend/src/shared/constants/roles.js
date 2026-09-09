/**
 * System roles
 */
const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  DIRECTOR: 'Director',
  TEAMLEADER: 'Teamleader',
  EXPERT: 'Expert'
};

/**
 * Role hierarchy (higher number = more privileges)
 */
const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 6,
  [ROLES.ADMIN]: 5,
  [ROLES.MANAGER]: 4,
  [ROLES.DIRECTOR]: 3,
  [ROLES.TEAMLEADER]: 2,
  [ROLES.EXPERT]: 1
};

/**
 * Check if role has higher privilege
 */
const hasHigherPrivilege = (role1, role2) => {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
};

export {
  ROLES,
  ROLE_HIERARCHY,
  hasHigherPrivilege
};