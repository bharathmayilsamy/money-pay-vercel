import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type KycStatus = 'Verified' | 'Pending' | 'Rejected';
export type TenantStatus = 'Active' | 'Evicted';
export type DueStatus = 'Pending' | 'Paid';

export type Tenant = {
  id: string;
  name: string;
  phone: string;
  email: string;
  aadhaar: string;
  altPhone: string;
  dob: string;
  gender: string;
  currentAddress: string;
  permanentAddress: string;
  govtId: string;
  vehicleNo: string;
  remarks: string;
  flatId: string;
  propertyId: string;
  rent: number;
  deposit: number;
  status: TenantStatus;
  kycStatus: KycStatus;
  joiningDate: string;
  moveInDate: string;
  agreementEndDate: string;
  occupation: string;
  emergencyContact: string;
};

export type PendingRegistration = {
  id: string;
  name: string;
  phone: string;
  email: string;
  aadhaar: string;
  altPhone: string;
  dob: string;
  gender: string;
  currentAddress: string;
  permanentAddress: string;
  govtId: string;
  vehicleNo: string;
  remarks: string;
  registeredDate: string;
};

export type Flat = {
  id: string;
  name: string;
  rent: number;
  status: 'Occupied' | 'Vacant';
  tenantId?: string;
};

export type Property = {
  id: string;
  name: string;
  address: string;
  flats: Flat[];
};

export type Due = {
  id: string;
  tenantId: string;
  category: string;
  amount: number;
  dueDate: string;
  status: DueStatus;
};

export type Payment = {
  id: string;
  tenantId: string;
  category: string;
  amount: number;
  date: string;
  remark: string;
};

export type Expense = {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  remark: string;
};

export type MaintenanceRequest = {
  id: string;
  tenantId: string;
  category: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  dateRaised: string;
  dateResolved?: string;
  adminNote?: string;
};

export type Notice = {
  id: string;
  title: string;
  content: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  postedDate: string;
  expiryDate: string;
};

export type Agreement = {
  id: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  periodMonths: number;
  lockInMonths: number;
  rentAmount: number;
  deposit: number;
};

export type UtilityBill = {
  id: string;
  flatId: string;
  tenantId: string;
  period: string;
  previousReading: number;
  currentReading: number;
  ratePerUnit: number;
  amount: number;
  status: 'Pending' | 'Paid';
  date: string;
};

export type Visitor = {
  id: string;
  name: string;
  phone: string;
  tenantId: string;
  purpose: string;
  checkInTime: string;
  checkOutTime?: string;
  vehicleNo?: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  details: string;
  date: string;
};

export type UserType = 'Admin' | 'Tenant' | null;

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

const TODAY = new Date().toISOString().split('T')[0];
const MONTH = new Date().toISOString().slice(0, 7);

const initialProperties: Property[] = [
  {
    id: 'p1',
    name: 'Sunrise Residency',
    address: 'Andheri East, Mumbai - 400069',
    flats: [
      { id: 'f1', name: '1ST_FLR-101_1 Road Facing', rent: 13000, status: 'Occupied', tenantId: 't1' },
      { id: 'f2', name: '1ST_FLR-101_2 Staircase Facing', rent: 12500, status: 'Occupied', tenantId: 't2' },
      { id: 'f3', name: '2ND_FLR-201_1 Road Facing', rent: 12700, status: 'Occupied', tenantId: 't3' },
      { id: 'f4', name: '2ND_FLR-201_2 Garden Facing', rent: 14000, status: 'Vacant' },
    ],
  },
  {
    id: 'p2',
    name: 'Green Valley Apartments',
    address: 'Whitefield, Bangalore - 560066',
    flats: [
      { id: 'f5', name: 'Tower A - 101', rent: 18000, status: 'Vacant' },
      { id: 'f6', name: 'Tower A - 102', rent: 17500, status: 'Vacant' },
      { id: 'f7', name: 'Tower B - 201', rent: 22000, status: 'Vacant' },
    ],
  },
];

const initialTenants: Tenant[] = [
  {
    id: 't1', name: 'Chandan', phone: '9876543210', email: 'chandan@example.com',
    aadhaar: '1234-5678-9012', altPhone: '9876543211', dob: '1990-01-15', gender: 'Male',
    currentAddress: 'Flat 101, Sunrise Residency, Mumbai', permanentAddress: 'Delhi',
    govtId: 'PAN123456', vehicleNo: 'MH01AB1234', remarks: 'Good tenant',
    flatId: 'f1', propertyId: 'p1', rent: 13000, deposit: 26000,
    status: 'Active', kycStatus: 'Verified', joiningDate: '2026-01-01',
    moveInDate: '2026-01-01', agreementEndDate: '2026-12-31',
    occupation: 'Software Engineer', emergencyContact: '9876543212',
  },
  {
    id: 't2', name: 'Sunil Kumar G M', phone: '9988776655', email: 'sunil@example.com',
    aadhaar: '2345-6789-0123', altPhone: '', dob: '1988-05-20', gender: 'Male',
    currentAddress: 'Flat 102, Sunrise Residency, Mumbai', permanentAddress: 'Bangalore',
    govtId: 'VOTER789', vehicleNo: 'KA02CD5678', remarks: '',
    flatId: 'f2', propertyId: 'p1', rent: 12500, deposit: 25000,
    status: 'Active', kycStatus: 'Verified', joiningDate: '2026-02-01',
    moveInDate: '2026-02-01', agreementEndDate: '2027-01-31',
    occupation: 'Business', emergencyContact: '9988776656',
  },
  {
    id: 't3', name: 'Santhosh NG', phone: '9876543212', email: 'santhosh@example.com',
    aadhaar: '3456-7890-1234', altPhone: '9876543213', dob: '1992-08-10', gender: 'Male',
    currentAddress: 'Flat 201, Sunrise Residency, Mumbai', permanentAddress: 'Pune',
    govtId: 'PAN789012', vehicleNo: 'MH12XY3456', remarks: '',
    flatId: 'f3', propertyId: 'p1', rent: 12700, deposit: 25400,
    status: 'Active', kycStatus: 'Pending', joiningDate: '2026-03-01',
    moveInDate: '2026-03-01', agreementEndDate: '2027-02-28',
    occupation: 'Student', emergencyContact: '9876543214',
  },
];

const initialDues: Due[] = [
  { id: genId(), tenantId: 't1', category: 'Rent', amount: 13000, dueDate: '2026-06-01', status: 'Pending' },
  { id: genId(), tenantId: 't2', category: 'Rent', amount: 12500, dueDate: '2026-06-01', status: 'Pending' },
  { id: genId(), tenantId: 't3', category: 'Rent', amount: 12700, dueDate: '2026-06-01', status: 'Pending' },
  { id: genId(), tenantId: 't3', category: 'Electricity Bill', amount: 850, dueDate: '2026-05-25', status: 'Pending' },
  { id: genId(), tenantId: 't1', category: 'Water Bill', amount: 200, dueDate: '2026-05-30', status: 'Pending' },
  { id: genId(), tenantId: 't2', category: 'WiFi', amount: 600, dueDate: '2026-05-20', status: 'Pending' },
];

const initialPayments: Payment[] = [
  { id: genId(), tenantId: 't1', category: 'Rent', amount: 13000, date: '2026-05-01', remark: 'May Rent' },
  { id: genId(), tenantId: 't2', category: 'Rent', amount: 12500, date: '2026-05-01', remark: 'May Rent' },
  { id: genId(), tenantId: 't3', category: 'Rent', amount: 12700, date: '2026-05-02', remark: 'May Rent' },
  { id: genId(), tenantId: 't1', category: 'Rent', amount: 13000, date: '2026-04-01', remark: 'April Rent' },
  { id: genId(), tenantId: 't2', category: 'Rent', amount: 12500, date: '2026-04-01', remark: 'April Rent' },
  { id: genId(), tenantId: 't1', category: 'Electricity Bill', amount: 750, date: '2026-04-10', remark: 'April EB' },
];

const initialExpenses: Expense[] = [
  { id: genId(), description: 'Plumbing Repair - Kitchen', amount: 2500, date: '2026-04-15', category: 'Repairs', remark: 'Kitchen sink blockage' },
  { id: genId(), description: 'Common Area Painting', amount: 8000, date: '2026-03-20', category: 'Maintenance', remark: 'Annual paint' },
  { id: genId(), description: 'Electrician - Wiring Fix', amount: 1200, date: '2026-05-10', category: 'Repairs', remark: 'Flat 201 lights' },
];

const initialMaintenanceRequests: MaintenanceRequest[] = [
  { id: 'mr1', tenantId: 't1', category: 'Plumbing', description: 'Bathroom tap leaking since 3 days', priority: 'High', status: 'In Progress', dateRaised: '2026-05-05', adminNote: 'Plumber scheduled for Thursday' },
  { id: 'mr2', tenantId: 't2', category: 'Electrical', description: 'Hall light not working', priority: 'Medium', status: 'Open', dateRaised: '2026-05-08' },
  { id: 'mr3', tenantId: 't3', category: 'AC', description: 'AC not cooling properly', priority: 'High', status: 'Resolved', dateRaised: '2026-04-20', dateResolved: '2026-04-23', adminNote: 'Gas refill done' },
];

const initialNotices: Notice[] = [
  { id: 'n1', title: 'Water Supply Disruption', content: 'Water supply will be disrupted on 15th May 2026 from 9 AM to 2 PM for pipeline maintenance. Please store water accordingly.', priority: 'Important', postedDate: '2026-05-10', expiryDate: '2026-05-16' },
  { id: 'n2', title: 'Society Meeting', content: 'Monthly society meeting on 20th May 2026 at 6 PM in the ground floor common area. Attendance is mandatory.', priority: 'Normal', postedDate: '2026-05-08', expiryDate: '2026-05-21' },
  { id: 'n3', title: 'Rent Due Reminder', content: 'This is a reminder that rent for June 2026 is due by 5th June. Please make your payment on time to avoid late fees.', priority: 'Urgent', postedDate: '2026-05-01', expiryDate: '2026-06-06' },
];

const initialAgreements: Agreement[] = [
  { id: 'a1', tenantId: 't1', startDate: '2026-01-01', endDate: '2026-12-31', periodMonths: 11, lockInMonths: 6, rentAmount: 13000, deposit: 26000 },
  { id: 'a2', tenantId: 't2', startDate: '2026-02-01', endDate: '2027-01-31', periodMonths: 11, lockInMonths: 6, rentAmount: 12500, deposit: 25000 },
  { id: 'a3', tenantId: 't3', startDate: '2026-03-01', endDate: '2027-02-28', periodMonths: 11, lockInMonths: 6, rentAmount: 12700, deposit: 25400 },
];

const initialUtilityBills: UtilityBill[] = [
  { id: 'ub1', flatId: 'f1', tenantId: 't1', period: '2026-04', previousReading: 1200, currentReading: 1294, ratePerUnit: 8, amount: 752, status: 'Paid', date: '2026-04-30' },
  { id: 'ub2', flatId: 'f2', tenantId: 't2', period: '2026-04', previousReading: 980, currentReading: 1048, ratePerUnit: 8, amount: 544, status: 'Paid', date: '2026-04-30' },
  { id: 'ub3', flatId: 'f3', tenantId: 't3', period: '2026-05', previousReading: 760, currentReading: 867, ratePerUnit: 8, amount: 856, status: 'Pending', date: '2026-05-30' },
];

const initialVisitors: Visitor[] = [
  { id: 'v1', name: 'Rajan Sharma', phone: '9123456789', tenantId: 't1', purpose: 'Personal Visit', checkInTime: '2026-05-08T14:30:00', checkOutTime: '2026-05-08T17:00:00', vehicleNo: 'MH03XY1234' },
  { id: 'v2', name: 'Priya Mehta', phone: '9876512345', tenantId: 't2', purpose: 'Family Visit', checkInTime: '2026-05-07T11:00:00', vehicleNo: '' },
  { id: 'v3', name: 'Delivery Agent', phone: '9000012345', tenantId: 't3', purpose: 'Package Delivery', checkInTime: '2026-05-08T10:15:00', checkOutTime: '2026-05-08T10:25:00' },
];

const initialPendingRegistrations: PendingRegistration[] = [];

const initialActivityLogs: ActivityLog[] = [
  { id: genId(), action: 'System Initialized', details: 'Demo data loaded successfully', date: new Date().toISOString() },
  { id: genId(), action: 'Rent Due Added', details: 'June rent dues generated for all tenants', date: new Date().toISOString() },
];

interface StoreState {
  userType: UserType;
  currentUserPhone: string | null;
  properties: Property[];
  tenants: Tenant[];
  pendingRegistrations: PendingRegistration[];
  dues: Due[];
  payments: Payment[];
  expenses: Expense[];
  maintenanceRequests: MaintenanceRequest[];
  notices: Notice[];
  agreements: Agreement[];
  utilityBills: UtilityBill[];
  visitors: Visitor[];
  activityLogs: ActivityLog[];

  login: (type: UserType, phone: string) => void;
  logout: () => void;
  addLog: (action: string, details: string) => void;

  setTenants: (tenants: Tenant[]) => void;
  addTenant: (tenant: Tenant) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;

  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  updateFlat: (propertyId: string, flatId: string, updates: Partial<Flat>) => void;

  addPendingRegistration: (reg: PendingRegistration) => void;
  approvePendingRegistration: (id: string) => void;
  rejectPendingRegistration: (id: string) => void;

  setDues: (dues: Due[]) => void;
  addDue: (due: Due) => void;
  updateDue: (id: string, updates: Partial<Due>) => void;
  deleteDue: (id: string) => void;

  addPayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;

  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;

  addMaintenanceRequest: (req: MaintenanceRequest) => void;
  updateMaintenanceRequest: (id: string, updates: Partial<MaintenanceRequest>) => void;
  deleteMaintenanceRequest: (id: string) => void;

  addNotice: (notice: Notice) => void;
  deleteNotice: (id: string) => void;

  addAgreement: (agreement: Agreement) => void;
  updateAgreement: (id: string, updates: Partial<Agreement>) => void;

  addUtilityBill: (bill: UtilityBill) => void;
  updateUtilityBill: (id: string, updates: Partial<UtilityBill>) => void;
  deleteUtilityBill: (id: string) => void;

  addVisitor: (visitor: Visitor) => void;
  updateVisitor: (id: string, updates: Partial<Visitor>) => void;
  deleteVisitor: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      userType: null,
      currentUserPhone: null,
      properties: initialProperties,
      tenants: initialTenants,
      pendingRegistrations: initialPendingRegistrations,
      dues: initialDues,
      payments: initialPayments,
      expenses: initialExpenses,
      maintenanceRequests: initialMaintenanceRequests,
      notices: initialNotices,
      agreements: initialAgreements,
      utilityBills: initialUtilityBills,
      visitors: initialVisitors,
      activityLogs: initialActivityLogs,

      login: (type, phone) => set({ userType: type, currentUserPhone: phone }),
      logout: () => set({ userType: null, currentUserPhone: null }),
      addLog: (action, details) => set((s) => ({
        activityLogs: [{ id: genId(), action, details, date: new Date().toISOString() }, ...s.activityLogs].slice(0, 50),
      })),

      setTenants: (tenants) => set({ tenants }),
      addTenant: (tenant) => set((s) => ({ tenants: [...s.tenants, tenant] })),
      updateTenant: (id, updates) => set((s) => ({ tenants: s.tenants.map((t) => t.id === id ? { ...t, ...updates } : t) })),
      deleteTenant: (id) => set((s) => ({ tenants: s.tenants.filter((t) => t.id !== id) })),

      setProperties: (properties) => set({ properties }),
      addProperty: (property) => set((s) => ({ properties: [...s.properties, property] })),
      updateProperty: (id, updates) => set((s) => ({ properties: s.properties.map((p) => p.id === id ? { ...p, ...updates } : p) })),
      deleteProperty: (id) => set((s) => ({ properties: s.properties.filter((p) => p.id !== id) })),
      updateFlat: (propertyId, flatId, updates) => set((s) => ({
        properties: s.properties.map((p) => p.id === propertyId
          ? { ...p, flats: p.flats.map((f) => f.id === flatId ? { ...f, ...updates } : f) }
          : p
        ),
      })),

      addPendingRegistration: (reg) => set((s) => ({ pendingRegistrations: [...s.pendingRegistrations, reg] })),
      approvePendingRegistration: (id) => set((s) => {
        const reg = s.pendingRegistrations.find((r) => r.id === id);
        if (!reg) return s;
        const newTenant: Tenant = {
          id: genId(), name: reg.name, phone: reg.phone, email: reg.email,
          aadhaar: reg.aadhaar, altPhone: reg.altPhone, dob: reg.dob, gender: reg.gender,
          currentAddress: reg.currentAddress, permanentAddress: reg.permanentAddress,
          govtId: reg.govtId, vehicleNo: reg.vehicleNo, remarks: reg.remarks,
          flatId: '', propertyId: '', rent: 0, deposit: 0,
          status: 'Active', kycStatus: 'Pending', joiningDate: TODAY,
          moveInDate: '', agreementEndDate: '', occupation: '', emergencyContact: '',
        };
        return {
          tenants: [...s.tenants, newTenant],
          pendingRegistrations: s.pendingRegistrations.filter((r) => r.id !== id),
        };
      }),
      rejectPendingRegistration: (id) => set((s) => ({ pendingRegistrations: s.pendingRegistrations.filter((r) => r.id !== id) })),

      setDues: (dues) => set({ dues }),
      addDue: (due) => set((s) => ({ dues: [...s.dues, due] })),
      updateDue: (id, updates) => set((s) => ({ dues: s.dues.map((d) => d.id === id ? { ...d, ...updates } : d) })),
      deleteDue: (id) => set((s) => ({ dues: s.dues.filter((d) => d.id !== id) })),

      addPayment: (payment) => set((s) => ({ payments: [...s.payments, payment] })),
      deletePayment: (id) => set((s) => ({ payments: s.payments.filter((p) => p.id !== id) })),

      addExpense: (expense) => set((s) => ({ expenses: [...s.expenses, expense] })),
      deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      addMaintenanceRequest: (req) => set((s) => ({ maintenanceRequests: [...s.maintenanceRequests, req] })),
      updateMaintenanceRequest: (id, updates) => set((s) => ({ maintenanceRequests: s.maintenanceRequests.map((r) => r.id === id ? { ...r, ...updates } : r) })),
      deleteMaintenanceRequest: (id) => set((s) => ({ maintenanceRequests: s.maintenanceRequests.filter((r) => r.id !== id) })),

      addNotice: (notice) => set((s) => ({ notices: [...s.notices, notice] })),
      deleteNotice: (id) => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),

      addAgreement: (agreement) => set((s) => ({ agreements: [...s.agreements, agreement] })),
      updateAgreement: (id, updates) => set((s) => ({ agreements: s.agreements.map((a) => a.id === id ? { ...a, ...updates } : a) })),

      addUtilityBill: (bill) => set((s) => ({ utilityBills: [...s.utilityBills, bill] })),
      updateUtilityBill: (id, updates) => set((s) => ({ utilityBills: s.utilityBills.map((b) => b.id === id ? { ...b, ...updates } : b) })),
      deleteUtilityBill: (id) => set((s) => ({ utilityBills: s.utilityBills.filter((b) => b.id !== id) })),

      addVisitor: (visitor) => set((s) => ({ visitors: [...s.visitors, visitor] })),
      updateVisitor: (id, updates) => set((s) => ({ visitors: s.visitors.map((v) => v.id === id ? { ...v, ...updates } : v) })),
      deleteVisitor: (id) => set((s) => ({ visitors: s.visitors.filter((v) => v.id !== id) })),
    }),
    { name: 'moneyPayData' }
  )
);

export function formatINR(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}

export function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
