import { Team, Department } from '@/shared/types';

/**
 * Maps a Team to its parent Directorate (Department)
 */
export function getTeamDirectorate(team: Team): Department {
    // Universal Services
    if (['UNIVERSAL_OPERATOR_SERVICE', 'VOLUNTEER_SERVICE'].includes(team)) return 'UNIVERSAL_SERVICES';

    // Economy Services
    if (['CIVIL_REGISTRATION', 'REVENUE_SERVICES', 'BUSINESS_SERVICES', 'INVESTMENT_SERVICES', 'EMPLOYMENT_SKILLS', 'DOC_VERIFICATION'].includes(team)) return 'ECONOMY_SERVICES';

    // Land & Construction
    if (['BUILDING_PERMIT', 'LAND_DEVELOPMENT', 'LAND_TENURE', 'PLANNING_DEVELOPMENT'].includes(team)) return 'LAND_CONSTRUCTION';

    // Transport & Housing
    if (['TRAFFIC_MANAGEMENT', 'DRIVER_VEHICLE', 'HOUSING_DEVELOPMENT', 'HOUSING_CORPORATION'].includes(team)) return 'TRANSPORT_HOUSING';

    // Digitalization (Teams under IT Director effectively, or specific Digital Directorates)
    // *Correction*: User said "under Digitalization directorate there are 4 teams". 
    // In our system, 'Digitalization' is a SECTOR. 
    // The Department "IT" (mapped to 'IT' in sectorMapping) seems to be the catch-all for these, 
    // OR we map them to 'DIGITAL_DATA' if the user meant that.
    // Given the team names (Software Dev, Network, Cyber), they fit best under the 'IT' Department 
    // or 'DIGITAL_DATA' if that was the intended "Digitalization Directorate".
    // Let's map them to 'IT' for now as it's the most logical existing technical Department, 
    // or 'DIGITAL_DATA' if we want to be precise with the new enum. 
    // Let's use 'IT' as the code for the "Digitalization Directorate" containing these teams.
    if (['SOFTWARE_DEV', 'NETWORK_INFRA', 'CYBER_SECURITY', 'TECH_TRAINING_MAINTENANCE'].includes(team)) return 'IT';

    return 'UNIVERSAL_SERVICES'; // Default fallback
}

export function getTeamName(team: Team): string {
    const names: Record<Team, string> = {
        UNIVERSAL_OPERATOR_SERVICE: 'Universal Operator Service Group',
        VOLUNTEER_SERVICE: 'Volunteer Service Team',
        CIVIL_REGISTRATION: 'Civil Registration & Residency',
        REVENUE_SERVICES: 'Revenue Services Group',
        BUSINESS_SERVICES: 'Business Services Group',
        INVESTMENT_SERVICES: 'Investment Services Group',
        EMPLOYMENT_SKILLS: 'Employment & Skills Services',
        DOC_VERIFICATION: 'Document Verification & Registration',
        BUILDING_PERMIT: 'Building Permit Services',
        LAND_DEVELOPMENT: 'Land Development & Management',
        LAND_TENURE: 'Land Information & Tenure',
        PLANNING_DEVELOPMENT: 'Planning & Development Services',
        TRAFFIC_MANAGEMENT: 'Traffic Management Services',
        DRIVER_VEHICLE: 'Driver & Vehicle Services',
        HOUSING_DEVELOPMENT: 'Housing Development & Management',
        HOUSING_CORPORATION: 'Housing Corporation Services',
        SOFTWARE_DEV: 'Software Dev & DB Admin',
        NETWORK_INFRA: 'Network & Infrastructure Mgmt',
        CYBER_SECURITY: 'Cyber Security Management',
        TECH_TRAINING_MAINTENANCE: 'Tech Training & Maintenance'
    };
    return names[team];
}
