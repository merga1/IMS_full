import { basename } from 'path';
import { fileURLToPath } from 'url';

import permissions from '../../../shared/constants/permissions.js';
import prisma from '../../index.js';

const { PERMISSIONS, ROLE_PERMISSIONS, ROLE_RANKS } = permissions;

async function seedPermissions() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Sync Permissions
  for (const permissionCode of Object.values(PERMISSIONS)) {
    const [module, action] = permissionCode.split('.');

    await prisma.permission.upsert({
      where: { code: permissionCode },
      update: {},
      create: {
        code: permissionCode,
        module,
        description: `Permission to ${action.toLowerCase()} ${module.toLowerCase()}`,
      },
    });
  }
  console.log('✅ Permissions synced.');

  // 2. Sync Roles and Assign Permissions
  // Map both descriptive names and system codes (e.g. SYSTEM_ADMIN, GD, etc.)
  const allPermissions = await prisma.permission.findMany();
  const permissionIdsByCode = new Map(allPermissions.map((p) => [p.code, p.permission_id]));
  const allCodes = Object.values(PERMISSIONS);
  const roleDefinitions = [
    { name: 'SYSTEM_ADMIN', rank: ROLE_RANKS['System Administrator'], codes: allCodes },
    { name: 'System Administrator', rank: ROLE_RANKS['System Administrator'], codes: allCodes },
    { name: 'GD', rank: ROLE_RANKS['General Director'], codes: allCodes },
    { name: 'General Director', rank: ROLE_RANKS['General Director'], codes: ROLE_PERMISSIONS['General Director'] },
    { name: 'DGD', rank: ROLE_RANKS['Deputy General Director'], codes: ROLE_PERMISSIONS['Deputy General Director'] },
    { name: 'Deputy General Director', rank: ROLE_RANKS['Deputy General Director'], codes: ROLE_PERMISSIONS['Deputy General Director'] },
    { name: 'DIRECTOR', rank: ROLE_RANKS.Director, codes: ROLE_PERMISSIONS.Director },
    { name: 'Director', rank: ROLE_RANKS.Director, codes: ROLE_PERMISSIONS.Director },
    { name: 'TEAM_LEADER', rank: ROLE_RANKS['Team Leader'], codes: ROLE_PERMISSIONS['Team Leader'] },
    { name: 'Team Leader', rank: ROLE_RANKS['Team Leader'], codes: ROLE_PERMISSIONS['Team Leader'] },
    { name: 'STOREKEEPER', rank: ROLE_RANKS.Storekeeper, codes: ROLE_PERMISSIONS.Storekeeper },
    { name: 'Storekeeper', rank: ROLE_RANKS.Storekeeper, codes: ROLE_PERMISSIONS.Storekeeper },
    { name: 'MAINTENANCE', rank: ROLE_RANKS['Maintenance Team'], codes: ROLE_PERMISSIONS['Maintenance Team'] },
    { name: 'Maintenance Team', rank: ROLE_RANKS['Maintenance Team'], codes: ROLE_PERMISSIONS['Maintenance Team'] },
    { name: 'EMPLOYEE', rank: ROLE_RANKS.Employee, codes: ROLE_PERMISSIONS.Employee },
    { name: 'Employee', rank: ROLE_RANKS.Employee, codes: ROLE_PERMISSIONS.Employee },
    { name: 'THIRD_PARTY', rank: ROLE_RANKS['Third-Party'], codes: ROLE_PERMISSIONS['Third-Party'] },
    { name: 'Third-Party', rank: ROLE_RANKS['Third-Party'], codes: ROLE_PERMISSIONS['Third-Party'] },
  ].map((role) => ({
    ...role,
    permissions: role.codes
      .map((code) => permissionIdsByCode.get(code))
      .filter(Boolean)
      .map((permission_id) => ({ permission_id })),
  }));

  for (const r of roleDefinitions) {
    await prisma.role.upsert({
      where: { role_name: r.name },
      update: {
        role_rank: r.rank,
        permissions: {
          set: [],
          connect: r.permissions,
        },
      },
      create: {
        role_name: r.name,
        role_rank: r.rank,
        permissions: { connect: r.permissions },
      },
    });
    console.log(`   > Synced Role: ${r.name} (Rank ${r.rank})`);
  }

  // 3. Sync Default Branches
  const hqBranch = await prisma.branch.upsert({
    where: { branch_id: 1 },
    update: { branch_name: 'HQ', type: 'HQ' },
    create: { branch_id: 1, branch_name: 'HQ', type: 'HQ', location: 'Addis Ababa' },
  });

  const aradaBranch = await prisma.branch.upsert({
    where: { branch_id: 2 },
    update: { branch_name: 'ARADA', type: 'BRANCH' },
    create: { branch_id: 2, branch_name: 'ARADA', type: 'BRANCH', location: 'Arada Subcity' },
  });
  console.log('✅ Branches synced.');

  // 4. Sync Default Users
  const bcrypt = await import('bcrypt');
  const seedPassword = process.env.SEED_DEFAULT_PASSWORD;
  if (!seedPassword || seedPassword.length < 12) {
    throw new Error('Set SEED_DEFAULT_PASSWORD to a unique value of at least 12 characters before seeding demo users.');
  }
  const defaultHashedPassword = await bcrypt.default.hash(seedPassword, 12);

  const defaultUsers = [
    { fayda_id: 'FIN-ADMIN', full_name: 'System Administrator', email: 'admin@mesob.gov.et', role_name: 'SYSTEM_ADMIN', branch_id: hqBranch.branch_id },
    { fayda_id: 'FIN-1000', full_name: 'Abebe Bikila', email: 'abebe@mesob.gov.et', role_name: 'GD', branch_id: hqBranch.branch_id },
    { fayda_id: 'FIN-1001', full_name: 'Deputy General Director', email: 'dgd@mesob.gov.et', role_name: 'DGD', branch_id: hqBranch.branch_id },
    { fayda_id: 'FIN-1002', full_name: 'Derartu Tulu', email: 'derartu@mesob.gov.et', role_name: 'DIRECTOR', branch_id: aradaBranch.branch_id },
    { fayda_id: 'FIN-1003', full_name: 'Team Leader', email: 'teamleader@mesob.gov.et', role_name: 'TEAM_LEADER', branch_id: aradaBranch.branch_id },
    { fayda_id: 'FIN-1004', full_name: 'Kenenisa Bekele', email: 'kenenisa@mesob.gov.et', role_name: 'STOREKEEPER', branch_id: aradaBranch.branch_id },
    { fayda_id: 'FIN-1006', full_name: 'Almaz Ayana', email: 'almaz@mesob.gov.et', role_name: 'EMPLOYEE', branch_id: aradaBranch.branch_id },
  ];

  for (const u of defaultUsers) {
    const role = await prisma.role.findUnique({ where: { role_name: u.role_name } });
    if (!role) continue;

    await prisma.user.upsert({
      where: { fayda_id: u.fayda_id },
      update: {
        full_name: u.full_name,
        email: u.email,
        password: defaultHashedPassword,
        role_id: role.role_id,
        branch_id: u.branch_id,
        user_type: 'EMPLOYEE',
      },
      create: {
        fayda_id: u.fayda_id,
        full_name: u.full_name,
        email: u.email,
        password: defaultHashedPassword,
        role_id: role.role_id,
        branch_id: u.branch_id,
        user_type: 'EMPLOYEE',
      },
    });
    console.log(`   > Synced User: ${u.full_name} (${u.fayda_id} / ${u.email})`);
  }
  console.log('✅ Demo users seeded with SEED_DEFAULT_PASSWORD.');

  console.log('✅ All Seeding completed successfully.');
}

// Run if executed directly
const isMain = basename(fileURLToPath(import.meta.url)) === basename(process.argv[1]);
if (isMain) {
  seedPermissions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedPermissions;
