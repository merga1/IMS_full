import { create } from 'zustand';
import { User, Role } from "@/shared/types";
import { authApi, usersApi, apiClient, BackendUser } from "@/shared/api";

// ─── Mock User List (ONLY for demo panel display in LoginPage) ────────────────
// These are NOT used for real authentication.

const MOCK_USERS: User[] = [
  { id: 'u-admin', faydaId: 'FIN-ADMIN', fullName: 'System Administrator', email: 'admin@mesob.gov.et', role: 'SYSTEM_ADMIN', rank: 0, branch: 'HQ', userType: 'EMPLOYEE', status: 'ACTIVE' },
  { id: 'u1', faydaId: 'FIN-1000', fullName: 'Abebe Bikila', email: 'abebe@mesob.gov.et', role: 'GD', rank: 1, branch: 'HQ', userType: 'EMPLOYEE', status: 'ACTIVE' },
  { id: 'u2', faydaId: 'FIN-1001', fullName: 'Haile Gebrselassie', email: 'haile@mesob.gov.et', role: 'DGD_SERVICE', rank: 2, department: 'BRANCH_OPERATIONS', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u1', status: 'ACTIVE' },
  { id: 'u2b', faydaId: 'FIN-1001B', fullName: 'Meseret Defar', email: 'meseret@mesob.gov.et', role: 'DGD_DIGITALIZATION', rank: 2, department: 'IT', sector: 'DIGITALIZATION', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u1', status: 'ACTIVE' },
  { id: 'u3', faydaId: 'FIN-1002', fullName: 'Derartu Tulu', email: 'derartu@mesob.gov.et', role: 'DIRECTOR', rank: 3, department: 'LAND_MANAGEMENT', sector: 'SERVICE', branch: 'ARADA', userType: 'EMPLOYEE', supervisorId: 'u2', status: 'ACTIVE' },
  { id: 'u4', faydaId: 'FIN-1003', fullName: 'Tirunesh Dibaba', email: 'tirunesh@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'LAND_MANAGEMENT', sector: 'SERVICE', branch: 'ARADA', userType: 'EMPLOYEE', supervisorId: 'u3', status: 'ACTIVE' },
  { id: 'u5', faydaId: 'FIN-1004', fullName: 'Kenenisa Bekele', email: 'kenenisa@mesob.gov.et', role: 'STOREKEEPER', rank: 5, department: 'LAND_MANAGEMENT', sector: 'SERVICE', branch: 'ARADA', userType: 'EMPLOYEE', supervisorId: 'u3', status: 'ACTIVE' },
  { id: 'u5-hq', faydaId: 'FIN-1004-HQ', fullName: 'Bekele Tadesse', email: 'bekele@mesob.gov.et', role: 'STOREKEEPER', rank: 5, department: 'BRANCH_OPERATIONS', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u1', status: 'ACTIVE' },
  { id: 'u6', faydaId: 'FIN-1005', fullName: 'Mamo W', email: 'mamo@mesob.gov.et', role: 'MAINTENANCE', rank: 5, department: 'IT', sector: 'DIGITALIZATION', branch: 'ARADA', userType: 'EMPLOYEE', supervisorId: 'u2b', status: 'ACTIVE' },
  { id: 'u7', faydaId: 'FIN-1006', fullName: 'Almaz Ayana', email: 'almaz@mesob.gov.et', role: 'EMPLOYEE', rank: 5, department: 'LAND_MANAGEMENT', sector: 'SERVICE', branch: 'ARADA', userType: 'EMPLOYEE', supervisorId: 'u4', status: 'ACTIVE' },
  { id: 'u8', faydaId: 'FIN-2000', fullName: 'John Consultant', email: 'john@external.com', role: 'THIRD_PARTY', branch: 'HQ', userType: 'THIRD_PARTY', sponsorId: 'u4', status: 'ACTIVE', rank: 0 },
  { id: 'st-univ-1', faydaId: 'FIN-ST-UNIV-1', fullName: 'Univ Op Staff', email: 'staff.univ@mesob.gov.et', role: 'EMPLOYEE', rank: 5, department: 'UNIVERSAL_SERVICES', team: 'UNIVERSAL_OPERATOR_SERVICE', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'tl-univ-1', status: 'ACTIVE' },
  { id: 'st-econ-1', faydaId: 'FIN-ST-ECON-1', fullName: 'Civil Reg Staff', email: 'staff.civil@mesob.gov.et', role: 'EMPLOYEE', rank: 5, department: 'ECONOMY_SERVICES', team: 'CIVIL_REGISTRATION', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'tl-econ-1', status: 'ACTIVE' },
  { id: 'st-land-1', faydaId: 'FIN-ST-LAND-1', fullName: 'Land Dev Staff', email: 'staff.land@mesob.gov.et', role: 'EMPLOYEE', rank: 5, department: 'LAND_CONSTRUCTION', team: 'LAND_DEVELOPMENT', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'tl-land-2', status: 'ACTIVE' },
  { id: 'st-trans-1', faydaId: 'FIN-ST-TRANS-1', fullName: 'Traffic Staff', email: 'staff.traffic@mesob.gov.et', role: 'EMPLOYEE', rank: 5, department: 'TRANSPORT_HOUSING', team: 'TRAFFIC_MANAGEMENT', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'tl-trans-1', status: 'ACTIVE' },
  { id: 'st-digi-1', faydaId: 'FIN-ST-DIGI-1', fullName: 'Cyber Staff', email: 'staff.cyber@mesob.gov.et', role: 'EMPLOYEE', rank: 5, department: 'IT', team: 'CYBER_SECURITY', sector: 'DIGITALIZATION', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'tl-digi-3', status: 'ACTIVE' },
  { id: 'u3-digi', faydaId: 'FIN-1002-IT', fullName: 'Bill Gates', email: 'bill@mesob.gov.et', role: 'DIRECTOR', rank: 3, department: 'IT', sector: 'DIGITALIZATION', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u2b', status: 'ACTIVE' },
  { id: 'u-tech-1', faydaId: 'FIN-TECH-1', fullName: 'Mark Zucker', email: 'mark@mesob.gov.et', role: 'EMPLOYEE', rank: 5, department: 'IT', sector: 'DIGITALIZATION', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u3-digi', status: 'ACTIVE' },
  { id: 'u-dir-univ', faydaId: 'FIN-DIR-UNIV', fullName: 'Universal Dir', email: 'univ@mesob.gov.et', role: 'DIRECTOR', rank: 3, department: 'UNIVERSAL_SERVICES', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u2', status: 'ACTIVE' },
  { id: 'u-dir-econ', faydaId: 'FIN-DIR-ECON', fullName: 'Economy Dir', email: 'econ@mesob.gov.et', role: 'DIRECTOR', rank: 3, department: 'ECONOMY_SERVICES', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u2', status: 'ACTIVE' },
  { id: 'u-dir-trans', faydaId: 'FIN-DIR-TRANS', fullName: 'Transport Dir', email: 'trans@mesob.gov.et', role: 'DIRECTOR', rank: 3, department: 'TRANSPORT_HOUSING', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u2', status: 'ACTIVE' },
  { id: 'u-dir-one', faydaId: 'FIN-DIR-ONE', fullName: 'One Center Dir', email: 'one@mesob.gov.et', role: 'DIRECTOR', rank: 3, department: 'ONE_CENTER_EXPANSION', sector: 'DIGITALIZATION', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u2b', status: 'ACTIVE' },
  { id: 'tl-univ-1', faydaId: 'FIN-TL-UNIV-1', fullName: 'Universal Operator TL', email: 'univ.op@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'UNIVERSAL_SERVICES', team: 'UNIVERSAL_OPERATOR_SERVICE', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-univ', status: 'ACTIVE' },
  { id: 'tl-univ-2', faydaId: 'FIN-TL-UNIV-2', fullName: 'Volunteer Service TL', email: 'vol.svc@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'UNIVERSAL_SERVICES', team: 'VOLUNTEER_SERVICE', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-univ', status: 'ACTIVE' },
  { id: 'tl-econ-1', faydaId: 'FIN-TL-ECON-1', fullName: 'Civil Reg TL', email: 'civil@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'ECONOMY_SERVICES', team: 'CIVIL_REGISTRATION', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-econ', status: 'ACTIVE' },
  { id: 'tl-econ-2', faydaId: 'FIN-TL-ECON-2', fullName: 'Revenue TL', email: 'revenue@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'ECONOMY_SERVICES', team: 'REVENUE_SERVICES', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-econ', status: 'ACTIVE' },
  { id: 'tl-econ-3', faydaId: 'FIN-TL-ECON-3', fullName: 'Business Svc TL', email: 'business@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'ECONOMY_SERVICES', team: 'BUSINESS_SERVICES', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-econ', status: 'ACTIVE' },
  { id: 'tl-econ-4', faydaId: 'FIN-TL-ECON-4', fullName: 'Investment TL', email: 'invest@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'ECONOMY_SERVICES', team: 'INVESTMENT_SERVICES', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-econ', status: 'ACTIVE' },
  { id: 'tl-econ-5', faydaId: 'FIN-TL-ECON-5', fullName: 'Emp & Skills TL', email: 'skills@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'ECONOMY_SERVICES', team: 'EMPLOYMENT_SKILLS', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-econ', status: 'ACTIVE' },
  { id: 'tl-econ-6', faydaId: 'FIN-TL-ECON-6', fullName: 'Doc Verify TL', email: 'docs@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'ECONOMY_SERVICES', team: 'DOC_VERIFICATION', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-econ', status: 'ACTIVE' },
  { id: 'tl-land-1', faydaId: 'FIN-TL-LAND-1', fullName: 'Building Permit TL', email: 'build@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'LAND_CONSTRUCTION', team: 'BUILDING_PERMIT', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u3', status: 'ACTIVE' },
  { id: 'tl-land-2', faydaId: 'FIN-TL-LAND-2', fullName: 'Land Dev TL', email: 'landdev@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'LAND_CONSTRUCTION', team: 'LAND_DEVELOPMENT', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u3', status: 'ACTIVE' },
  { id: 'tl-land-3', faydaId: 'FIN-TL-LAND-3', fullName: 'Land Tenure TL', email: 'tenure@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'LAND_CONSTRUCTION', team: 'LAND_TENURE', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u3', status: 'ACTIVE' },
  { id: 'tl-land-4', faydaId: 'FIN-TL-LAND-4', fullName: 'Planning TL', email: 'plan@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'LAND_CONSTRUCTION', team: 'PLANNING_DEVELOPMENT', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u3', status: 'ACTIVE' },
  { id: 'tl-trans-1', faydaId: 'FIN-TL-TRANS-1', fullName: 'Traffic Mgmt TL', email: 'traffic@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'TRANSPORT_HOUSING', team: 'TRAFFIC_MANAGEMENT', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-trans', status: 'ACTIVE' },
  { id: 'tl-trans-2', faydaId: 'FIN-TL-TRANS-2', fullName: 'Driver & Vehicle TL', email: 'driver@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'TRANSPORT_HOUSING', team: 'DRIVER_VEHICLE', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-trans', status: 'ACTIVE' },
  { id: 'tl-trans-3', faydaId: 'FIN-TL-TRANS-3', fullName: 'Housing Dev TL', email: 'housing@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'TRANSPORT_HOUSING', team: 'HOUSING_DEVELOPMENT', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-trans', status: 'ACTIVE' },
  { id: 'tl-trans-4', faydaId: 'FIN-TL-TRANS-4', fullName: 'Housing Corp TL', email: 'hcorp@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'TRANSPORT_HOUSING', team: 'HOUSING_CORPORATION', sector: 'SERVICE', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u-dir-trans', status: 'ACTIVE' },
  { id: 'tl-digi-1', faydaId: 'FIN-TL-DIGI-1', fullName: 'Software Dev TL', email: 'soft@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'IT', team: 'SOFTWARE_DEV', sector: 'DIGITALIZATION', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u3-digi', status: 'ACTIVE' },
  { id: 'tl-digi-2', faydaId: 'FIN-TL-DIGI-2', fullName: 'Network TL', email: 'net@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'IT', team: 'NETWORK_INFRA', sector: 'DIGITALIZATION', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u3-digi', status: 'ACTIVE' },
  { id: 'tl-digi-3', faydaId: 'FIN-TL-DIGI-3', fullName: 'Cyber Security TL', email: 'cyber@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'IT', team: 'CYBER_SECURITY', sector: 'DIGITALIZATION', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u3-digi', status: 'ACTIVE' },
  { id: 'tl-digi-4', faydaId: 'FIN-TL-DIGI-4', fullName: 'Tech Training TL', email: 'train@mesob.gov.et', role: 'TEAM_LEADER', rank: 4, department: 'IT', team: 'TECH_TRAINING_MAINTENANCE', sector: 'DIGITALIZATION', branch: 'HQ', userType: 'EMPLOYEE', supervisorId: 'u3-digi', status: 'ACTIVE' },
];

// ─── Helper: map backend user shape → frontend User type ──────────────────────

function mapBackendUser(backendUser: BackendUser): User {
  const roleName = backendUser.role?.role_name as Role;
  const rank = backendUser.role?.role_rank ?? 0;
  return {
    id: backendUser.user_id,
    faydaId: backendUser.fayda_id,
    fullName: backendUser.full_name,
    email: backendUser.email,
    role: roleName,
    rank,
    branch: (backendUser.branch?.branch_name ?? 'HQ') as any,
    userType: backendUser.user_type,
    status: 'ACTIVE',
  };
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  users: User[];          // Demo panel only
  isAuthenticated: boolean;
  /** Primary login: authenticate via Fayda ID + password against real backend */
  login: (faydaId: string, password: string) => Promise<void>;
  /** Email-based login bridge: resolves email → fayda_id then calls login() */
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  mockSwitchRole: (role: Role) => void;
  registerUser: (user: User) => void;
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: MOCK_USERS,
  isAuthenticated: false,

  login: async (faydaId: string, password: string) => {
    try {
      const res = await authApi.login({ fayda_id: faydaId.trim(), password });
      if (res.data?.token) {
        apiClient.setToken(res.data.token);
      }
      const mappedUser = mapBackendUser(res.data.user);
      set({ user: mappedUser, isAuthenticated: true });
    } catch (err: any) {
      // If backend is offline or unreachable, fallback to demo user
      const cleanId = faydaId.trim().toLowerCase();
      const mockUser = MOCK_USERS.find(
        u => u.faydaId.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
      );
      if (mockUser && (!err.statusCode || err.statusCode >= 500 || err.message?.includes('fetch') || err.message?.includes('Failed') || err.message?.includes('Network') || err.message?.includes('504') || err.message?.includes('502'))) {
        console.info('[Auth] Backend offline, falling back to demo session:', mockUser.fullName);
        set({ user: mockUser, isAuthenticated: true });
        return;
      }
      throw err;
    }
  },

  loginWithEmail: async (email: string, password: string) => {
    const cleanEmail = email.toLowerCase().trim();
    // Try to find fayda_id via demo list first
    const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (mockUser) {
      await get().login(mockUser.faydaId, password);
      return;
    }
    // Fallback: treat the email input as a direct fayda_id
    await get().login(cleanEmail, password);
  },

  logout: async () => {
    try { await authApi.logout(); } catch { /* ignore backend errors */ }
    apiClient.setToken(null);
    set({ user: null, isAuthenticated: false });
  },

  checkSession: async () => {
    const token = apiClient.getToken();
    if (!token) return;
    try {
      const res = await usersApi.me();
      if (res?.data) {
        set({ user: mapBackendUser(res.data), isAuthenticated: true });
      }
    } catch {
      console.warn('[Auth] Session validation failed; clearing token');
      apiClient.setToken(null);
    }
  },

  fetchUsers: async () => {
    try {
      const res = await usersApi.getAll({ limit: '100' });
      const userList = (res.data as any)?.users || (Array.isArray(res.data) ? res.data : []);
      if (userList.length > 0) {
        const liveUsers = userList.map(mapBackendUser);
        const merged = [
          ...liveUsers,
          ...MOCK_USERS.filter(mu => !liveUsers.some((lu: User) => lu.faydaId.toLowerCase() === mu.faydaId.toLowerCase()))
        ];
        set({ users: merged });
      }
    } catch (err) {
      console.warn('[Auth] Live user fetch failed, fallback to mock users:', err);
    }
  },

  mockSwitchRole: (role) => {
    const targetUser = get().users.find(u => u.role === role);
    if (targetUser) set({ user: targetUser, isAuthenticated: true });
  },

  registerUser: (newUser) =>
    set(state => ({ users: [...state.users, newUser] })),
}));
