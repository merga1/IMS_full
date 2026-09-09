import { Department, Sector } from '@/shared/types';
export function getDepartmentSector(department: Department): Sector {
    const serviceDepartments: Department[] = [
        'LAND_MANAGEMENT',
        'TRANSPORT',
        'REVENUE',
        'SOCIAL_SERVICES',
        'BRANCH_OPERATIONS',
        'UNIVERSAL_SERVICES',
        'ECONOMY_SERVICES',
        'LAND_CONSTRUCTION',
        'TRANSPORT_HOUSING'
    ];

    return serviceDepartments.includes(department) ? 'SERVICE' : 'DIGITALIZATION';
}

export function getSectorDepartments(sector: Sector): Department[] {
    if (sector === 'SERVICE') {
        return [
            'LAND_MANAGEMENT',
            'TRANSPORT',
            'REVENUE',
            'SOCIAL_SERVICES',
            'BRANCH_OPERATIONS',
            'UNIVERSAL_SERVICES',
            'ECONOMY_SERVICES',
            'LAND_CONSTRUCTION',
            'TRANSPORT_HOUSING'
        ];
    } else {
        return [
            'IT',
            'SOFTWARE_DEVELOPMENT',
            'INFRASTRUCTURE',
            'SYSTEM_ADMINISTRATION',
            'ONE_CENTER_TECH',
            'DIGITAL_DATA',
            'ONE_CENTER_EXPANSION'
        ];
    }
}

export function getDepartmentName(department: Department): string {
    const names: Record<Department, string> = {
        LAND_MANAGEMENT: 'Land Management',
        TRANSPORT: 'Transport',
        REVENUE: 'Revenue',
        SOCIAL_SERVICES: 'Social Services',
        BRANCH_OPERATIONS: 'Branch Operations',
        UNIVERSAL_SERVICES: 'Universal Services Directorate',
        ECONOMY_SERVICES: 'Economy Services Directorate',
        LAND_CONSTRUCTION: 'Land & Construction Services',
        TRANSPORT_HOUSING: 'Transport & House Services',
        IT: 'IT Support',
        SOFTWARE_DEVELOPMENT: 'Software Development',
        INFRASTRUCTURE: 'Infrastructure',
        SYSTEM_ADMINISTRATION: 'System Administration',
        ONE_CENTER_TECH: 'One Center Tech',
        DIGITAL_DATA: 'Digitalization Directorate',
        ONE_CENTER_EXPANSION: 'One Center Development Directorate'
    };

    return names[department] || department;
}

export function getSectorName(sector: Sector): string {
    return sector === 'SERVICE'
        ? 'Service Sector'
        : 'Digitalization & One Center Development Sector';
}
