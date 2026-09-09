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
        module: module.toLowerCase(),
        description: `Permission to ${action.toLowerCase()} ${module.toLowerCase()}`,
      },
    });
  }
  console.log('✅ Permissions synced.');

  // 2. Sync Roles and Assign Permissions
  // Map both descriptive names and system codes (e.g. SYSTEM_ADMIN, GD, etc.)
  const allPermissions = await prisma.permission.findMany();
  const allConnect = allPermissions.map((p) => ({ permission_id: p.permission_id }));

  const roleDefinitions = [
    { name: 'SYSTEM_ADMIN', rank: 0, permissions: allConnect },
    { name: 'System Administrator', rank: 0, permissions: allConnect },
    { name: 'GD', rank: 1, permissions: allConnect },
    { name: 'General Director', rank: 1, permissions: allConnect },
    { name: 'DIRECTOR', rank: 3, permissions: allConnect.slice(0, 10) },
    { name: 'Director', rank: 3, permissions: allConnect.slice(0, 10) },
    { name: 'STOREKEEPER', rank: 5, permissions: allConnect.slice(0, 8) },
    { name: 'Storekeeper', rank: 5, permissions: allConnect.slice(0, 8) },
    { name: 'EMPLOYEE', rank: 5, permissions: allConnect.slice(0, 4) },
    { name: 'Employee', rank: 5, permissions: allConnect.slice(0, 4) },
  ];

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
  const defaultHashedPassword = await bcrypt.default.hash('Password@123', 12);

  const defaultUsers = [
    { fayda_id: 'FIN-ADMIN', full_name: 'System Administrator', email: 'admin@mesob.gov.et', role_name: 'SYSTEM_ADMIN', branch_id: hqBranch.branch_id },
    { fayda_id: 'FIN-1000', full_name: 'Abebe Bikila', email: 'abebe@mesob.gov.et', role_name: 'GD', branch_id: hqBranch.branch_id },
    { fayda_id: 'FIN-1002', full_name: 'Derartu Tulu', email: 'derartu@mesob.gov.et', role_name: 'DIRECTOR', branch_id: aradaBranch.branch_id },
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
  console.log('✅ Default users seeded with Password: Password@123');

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
