import { supabase } from './supabase';
import type {
  Property,
  Flat,
  Tenant,
  PendingRegistration,
  Due,
  Payment,
  Expense,
  MaintenanceRequest,
  Notice,
  Agreement,
  UtilityBill,
  Visitor,
  ActivityLog,
} from '@/store/useStore';

// ─── Row → App type mappers ───────────────────────────────────────────────────

function dbToFlat(r: Record<string, unknown>): Flat {
  return {
    id: r.id as string,
    name: r.name as string,
    rent: (r.rent as number) ?? 0,
    status: (r.status as Flat['status']) ?? 'Vacant',
    tenantId: (r.tenant_id as string) || undefined,
  };
}

function dbToTenant(r: Record<string, unknown>): Tenant {
  return {
    id: r.id as string,
    name: r.name as string,
    phone: r.phone as string,
    email: (r.email as string) ?? '',
    aadhaar: (r.aadhaar as string) ?? '',
    altPhone: (r.alt_phone as string) ?? '',
    dob: (r.dob as string) ?? '',
    gender: (r.gender as string) ?? '',
    currentAddress: (r.current_address as string) ?? '',
    permanentAddress: (r.permanent_address as string) ?? '',
    govtId: (r.govt_id as string) ?? '',
    vehicleNo: (r.vehicle_no as string) ?? '',
    remarks: (r.remarks as string) ?? '',
    flatId: (r.flat_id as string) ?? '',
    propertyId: (r.property_id as string) ?? '',
    rent: (r.rent as number) ?? 0,
    deposit: (r.deposit as number) ?? 0,
    status: (r.status as Tenant['status']) ?? 'Active',
    kycStatus: (r.kyc_status as Tenant['kycStatus']) ?? 'Pending',
    joiningDate: (r.joining_date as string) ?? '',
    moveInDate: (r.move_in_date as string) ?? '',
    agreementEndDate: (r.agreement_end_date as string) ?? '',
    occupation: (r.occupation as string) ?? '',
    emergencyContact: (r.emergency_contact as string) ?? '',
  };
}

function dbToPendingReg(r: Record<string, unknown>): PendingRegistration {
  return {
    id: r.id as string,
    name: r.name as string,
    phone: r.phone as string,
    email: (r.email as string) ?? '',
    aadhaar: (r.aadhaar as string) ?? '',
    altPhone: (r.alt_phone as string) ?? '',
    dob: (r.dob as string) ?? '',
    gender: (r.gender as string) ?? '',
    currentAddress: (r.current_address as string) ?? '',
    permanentAddress: (r.permanent_address as string) ?? '',
    govtId: (r.govt_id as string) ?? '',
    vehicleNo: (r.vehicle_no as string) ?? '',
    remarks: (r.remarks as string) ?? '',
    registeredDate: (r.registered_date as string) ?? '',
  };
}

function dbToDue(r: Record<string, unknown>): Due {
  return {
    id: r.id as string,
    tenantId: r.tenant_id as string,
    category: r.category as string,
    amount: r.amount as number,
    dueDate: r.due_date as string,
    status: (r.status as Due['status']) ?? 'Pending',
  };
}

function dbToPayment(r: Record<string, unknown>): Payment {
  return {
    id: r.id as string,
    tenantId: r.tenant_id as string,
    category: r.category as string,
    amount: r.amount as number,
    date: r.date as string,
    remark: (r.remark as string) ?? '',
  };
}

function dbToExpense(r: Record<string, unknown>): Expense {
  return {
    id: r.id as string,
    description: r.description as string,
    category: r.category as string,
    amount: r.amount as number,
    date: r.date as string,
    remark: (r.remark as string) ?? '',
  };
}

function dbToMaintenance(r: Record<string, unknown>): MaintenanceRequest {
  return {
    id: r.id as string,
    tenantId: r.tenant_id as string,
    category: r.category as string,
    description: r.description as string,
    priority: r.priority as MaintenanceRequest['priority'],
    status: r.status as MaintenanceRequest['status'],
    dateRaised: r.date_raised as string,
    dateResolved: (r.date_resolved as string) || undefined,
    adminNote: (r.admin_note as string) || undefined,
  };
}

function dbToNotice(r: Record<string, unknown>): Notice {
  return {
    id: r.id as string,
    title: r.title as string,
    content: r.content as string,
    priority: r.priority as Notice['priority'],
    postedDate: r.posted_date as string,
    expiryDate: r.expiry_date as string,
  };
}

function dbToAgreement(r: Record<string, unknown>): Agreement {
  return {
    id: r.id as string,
    tenantId: r.tenant_id as string,
    startDate: r.start_date as string,
    endDate: r.end_date as string,
    periodMonths: r.period_months as number,
    lockInMonths: r.lock_in_months as number,
    rentAmount: r.rent_amount as number,
    deposit: r.deposit as number,
  };
}

function dbToUtilityBill(r: Record<string, unknown>): UtilityBill {
  return {
    id: r.id as string,
    flatId: r.flat_id as string,
    tenantId: r.tenant_id as string,
    period: r.period as string,
    previousReading: r.previous_reading as number,
    currentReading: r.current_reading as number,
    ratePerUnit: r.rate_per_unit as number,
    amount: r.amount as number,
    status: r.status as UtilityBill['status'],
    date: r.date as string,
  };
}

function dbToVisitor(r: Record<string, unknown>): Visitor {
  return {
    id: r.id as string,
    name: r.name as string,
    phone: (r.phone as string) ?? '',
    tenantId: r.tenant_id as string,
    purpose: r.purpose as string,
    checkInTime: r.check_in_time as string,
    checkOutTime: (r.check_out_time as string) || undefined,
    vehicleNo: (r.vehicle_no as string) || undefined,
  };
}

function dbToActivityLog(r: Record<string, unknown>): ActivityLog {
  return {
    id: r.id as string,
    action: r.action as string,
    details: (r.details as string) ?? '',
    date: r.date as string,
  };
}

// ─── App type → DB row mappers ────────────────────────────────────────────────

function tenantToDb(t: Tenant) {
  return {
    id: t.id, name: t.name, phone: t.phone, email: t.email,
    aadhaar: t.aadhaar, alt_phone: t.altPhone, dob: t.dob, gender: t.gender,
    current_address: t.currentAddress, permanent_address: t.permanentAddress,
    govt_id: t.govtId, vehicle_no: t.vehicleNo, remarks: t.remarks,
    flat_id: t.flatId, property_id: t.propertyId, rent: t.rent, deposit: t.deposit,
    status: t.status, kyc_status: t.kycStatus, joining_date: t.joiningDate,
    move_in_date: t.moveInDate, agreement_end_date: t.agreementEndDate,
    occupation: t.occupation, emergency_contact: t.emergencyContact,
  };
}

function pendingRegToDb(r: PendingRegistration) {
  return {
    id: r.id, name: r.name, phone: r.phone, email: r.email,
    aadhaar: r.aadhaar, alt_phone: r.altPhone, dob: r.dob, gender: r.gender,
    current_address: r.currentAddress, permanent_address: r.permanentAddress,
    govt_id: r.govtId, vehicle_no: r.vehicleNo, remarks: r.remarks,
    registered_date: r.registeredDate,
  };
}

function dueToDb(d: Due) {
  return { id: d.id, tenant_id: d.tenantId, category: d.category, amount: d.amount, due_date: d.dueDate, status: d.status };
}

function paymentToDb(p: Payment) {
  return { id: p.id, tenant_id: p.tenantId, category: p.category, amount: p.amount, date: p.date, remark: p.remark };
}

function expenseToDb(e: Expense) {
  return { id: e.id, description: e.description, category: e.category, amount: e.amount, date: e.date, remark: e.remark };
}

function maintenanceToDb(r: MaintenanceRequest) {
  return {
    id: r.id, tenant_id: r.tenantId, category: r.category, description: r.description,
    priority: r.priority, status: r.status, date_raised: r.dateRaised,
    date_resolved: r.dateResolved ?? null, admin_note: r.adminNote ?? null,
  };
}

function noticeToDb(n: Notice) {
  return { id: n.id, title: n.title, content: n.content, priority: n.priority, posted_date: n.postedDate, expiry_date: n.expiryDate };
}

function agreementToDb(a: Agreement) {
  return {
    id: a.id, tenant_id: a.tenantId, start_date: a.startDate, end_date: a.endDate,
    period_months: a.periodMonths, lock_in_months: a.lockInMonths,
    rent_amount: a.rentAmount, deposit: a.deposit,
  };
}

function utilityBillToDb(b: UtilityBill) {
  return {
    id: b.id, flat_id: b.flatId, tenant_id: b.tenantId, period: b.period,
    previous_reading: b.previousReading, current_reading: b.currentReading,
    rate_per_unit: b.ratePerUnit, amount: b.amount, status: b.status, date: b.date,
  };
}

function visitorToDb(v: Visitor) {
  return {
    id: v.id, name: v.name, phone: v.phone ?? '', tenant_id: v.tenantId,
    purpose: v.purpose, check_in_time: v.checkInTime,
    check_out_time: v.checkOutTime ?? null, vehicle_no: v.vehicleNo ?? null,
  };
}

function activityLogToDb(l: ActivityLog) {
  return { id: l.id, action: l.action, details: l.details, date: l.date };
}

// ─── Load all data from Supabase ──────────────────────────────────────────────

export interface SupabaseAllData {
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
}

export async function loadAllData(): Promise<SupabaseAllData | null> {
  if (!supabase) return null;
  try {
    const [
      propsRes, flatsRes, tenantsRes, pendingRes,
      duesRes, paymentsRes, expensesRes, maintenanceRes,
      noticesRes, agreementsRes, utilityRes, visitorsRes, logsRes,
    ] = await Promise.all([
      supabase.from('mp_properties').select('*'),
      supabase.from('mp_flats').select('*'),
      supabase.from('mp_tenants').select('*'),
      supabase.from('mp_pending_registrations').select('*'),
      supabase.from('mp_dues').select('*'),
      supabase.from('mp_payments').select('*'),
      supabase.from('mp_expenses').select('*'),
      supabase.from('mp_maintenance_requests').select('*'),
      supabase.from('mp_notices').select('*'),
      supabase.from('mp_agreements').select('*'),
      supabase.from('mp_utility_bills').select('*'),
      supabase.from('mp_visitors').select('*'),
      supabase.from('mp_activity_logs').select('*').order('date', { ascending: false }).limit(50),
    ]);

    const propRows = (propsRes.data ?? []) as Record<string, unknown>[];
    const flatRows = (flatsRes.data ?? []) as Record<string, unknown>[];

    const properties: Property[] = propRows.map((p) => ({
      id: p.id as string,
      name: p.name as string,
      address: p.address as string,
      flats: flatRows.filter((f) => f.property_id === p.id).map(dbToFlat),
    }));

    return {
      properties,
      tenants: ((tenantsRes.data ?? []) as Record<string, unknown>[]).map(dbToTenant),
      pendingRegistrations: ((pendingRes.data ?? []) as Record<string, unknown>[]).map(dbToPendingReg),
      dues: ((duesRes.data ?? []) as Record<string, unknown>[]).map(dbToDue),
      payments: ((paymentsRes.data ?? []) as Record<string, unknown>[]).map(dbToPayment),
      expenses: ((expensesRes.data ?? []) as Record<string, unknown>[]).map(dbToExpense),
      maintenanceRequests: ((maintenanceRes.data ?? []) as Record<string, unknown>[]).map(dbToMaintenance),
      notices: ((noticesRes.data ?? []) as Record<string, unknown>[]).map(dbToNotice),
      agreements: ((agreementsRes.data ?? []) as Record<string, unknown>[]).map(dbToAgreement),
      utilityBills: ((utilityRes.data ?? []) as Record<string, unknown>[]).map(dbToUtilityBill),
      visitors: ((visitorsRes.data ?? []) as Record<string, unknown>[]).map(dbToVisitor),
      activityLogs: ((logsRes.data ?? []) as Record<string, unknown>[]).map(dbToActivityLog),
    };
  } catch {
    return null;
  }
}

// ─── Seed initial data into Supabase ─────────────────────────────────────────

export async function seedSupabase(data: {
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
}) {
  if (!supabase) return;
  const propRows = data.properties.map(({ id, name, address }) => ({ id, name, address }));
  const flatRows = data.properties.flatMap((p) =>
    p.flats.map((f) => ({ id: f.id, property_id: p.id, name: f.name, rent: f.rent, status: f.status, tenant_id: f.tenantId ?? null }))
  );

  await Promise.all([
    supabase.from('mp_properties').upsert(propRows, { onConflict: 'id' }),
    supabase.from('mp_flats').upsert(flatRows, { onConflict: 'id' }),
    supabase.from('mp_tenants').upsert(data.tenants.map(tenantToDb), { onConflict: 'id' }),
    supabase.from('mp_pending_registrations').upsert(data.pendingRegistrations.map(pendingRegToDb), { onConflict: 'id' }),
    supabase.from('mp_dues').upsert(data.dues.map(dueToDb), { onConflict: 'id' }),
    supabase.from('mp_payments').upsert(data.payments.map(paymentToDb), { onConflict: 'id' }),
    supabase.from('mp_expenses').upsert(data.expenses.map(expenseToDb), { onConflict: 'id' }),
    supabase.from('mp_maintenance_requests').upsert(data.maintenanceRequests.map(maintenanceToDb), { onConflict: 'id' }),
    supabase.from('mp_notices').upsert(data.notices.map(noticeToDb), { onConflict: 'id' }),
    supabase.from('mp_agreements').upsert(data.agreements.map(agreementToDb), { onConflict: 'id' }),
    supabase.from('mp_utility_bills').upsert(data.utilityBills.map(utilityBillToDb), { onConflict: 'id' }),
    supabase.from('mp_visitors').upsert(data.visitors.map(visitorToDb), { onConflict: 'id' }),
    supabase.from('mp_activity_logs').upsert(data.activityLogs.map(activityLogToDb), { onConflict: 'id' }),
  ]);
}

// ─── Per-collection sync helpers ─────────────────────────────────────────────
// Each "sync" function does a full replace: upsert all + delete removed rows.

async function upsertAndClean<T extends { id: string }>(
  table: string,
  rows: Record<string, unknown>[],
  allIds: string[]
) {
  if (!supabase) return;
  if (rows.length > 0) await supabase.from(table).upsert(rows, { onConflict: 'id' });
  // Delete any rows in Supabase that are no longer in the store
  const { data: existing } = await supabase.from(table).select('id');
  if (existing) {
    const toDelete = (existing as { id: string }[]).filter((r) => !allIds.includes(r.id)).map((r) => r.id);
    if (toDelete.length > 0) await supabase.from(table).delete().in('id', toDelete);
  }
}

export async function syncTenants(tenants: Tenant[]) {
  await upsertAndClean('mp_tenants', tenants.map(tenantToDb) as Record<string, unknown>[], tenants.map((t) => t.id));
}

export async function syncProperties(properties: Property[]) {
  if (!supabase) return;
  const propRows = properties.map(({ id, name, address }) => ({ id, name, address }));
  const flatRows = properties.flatMap((p) =>
    p.flats.map((f) => ({ id: f.id, property_id: p.id, name: f.name, rent: f.rent, status: f.status, tenant_id: f.tenantId ?? null }))
  );
  if (propRows.length > 0) await supabase.from('mp_properties').upsert(propRows, { onConflict: 'id' });
  if (flatRows.length > 0) await supabase.from('mp_flats').upsert(flatRows, { onConflict: 'id' });

  const allPropIds = properties.map((p) => p.id);
  const allFlatIds = properties.flatMap((p) => p.flats.map((f) => f.id));

  const { data: existingProps } = await supabase.from('mp_properties').select('id');
  if (existingProps) {
    const toDelete = (existingProps as { id: string }[]).filter((r) => !allPropIds.includes(r.id)).map((r) => r.id);
    if (toDelete.length > 0) await supabase.from('mp_properties').delete().in('id', toDelete);
  }
  const { data: existingFlats } = await supabase.from('mp_flats').select('id');
  if (existingFlats) {
    const toDelete = (existingFlats as { id: string }[]).filter((r) => !allFlatIds.includes(r.id)).map((r) => r.id);
    if (toDelete.length > 0) await supabase.from('mp_flats').delete().in('id', toDelete);
  }
}

export async function syncPendingRegistrations(regs: PendingRegistration[]) {
  await upsertAndClean('mp_pending_registrations', regs.map(pendingRegToDb) as Record<string, unknown>[], regs.map((r) => r.id));
}

export async function syncDues(dues: Due[]) {
  await upsertAndClean('mp_dues', dues.map(dueToDb) as Record<string, unknown>[], dues.map((d) => d.id));
}

export async function syncPayments(payments: Payment[]) {
  await upsertAndClean('mp_payments', payments.map(paymentToDb) as Record<string, unknown>[], payments.map((p) => p.id));
}

export async function syncExpenses(expenses: Expense[]) {
  await upsertAndClean('mp_expenses', expenses.map(expenseToDb) as Record<string, unknown>[], expenses.map((e) => e.id));
}

export async function syncMaintenanceRequests(reqs: MaintenanceRequest[]) {
  await upsertAndClean('mp_maintenance_requests', reqs.map(maintenanceToDb) as Record<string, unknown>[], reqs.map((r) => r.id));
}

export async function syncNotices(notices: Notice[]) {
  await upsertAndClean('mp_notices', notices.map(noticeToDb) as Record<string, unknown>[], notices.map((n) => n.id));
}

export async function syncAgreements(agreements: Agreement[]) {
  await upsertAndClean('mp_agreements', agreements.map(agreementToDb) as Record<string, unknown>[], agreements.map((a) => a.id));
}

export async function syncUtilityBills(bills: UtilityBill[]) {
  await upsertAndClean('mp_utility_bills', bills.map(utilityBillToDb) as Record<string, unknown>[], bills.map((b) => b.id));
}

export async function syncVisitors(visitors: Visitor[]) {
  await upsertAndClean('mp_visitors', visitors.map(visitorToDb) as Record<string, unknown>[], visitors.map((v) => v.id));
}

export async function syncActivityLogs(logs: ActivityLog[]) {
  if (!supabase) return;
  if (logs.length > 0) await supabase.from('mp_activity_logs').upsert(logs.map(activityLogToDb), { onConflict: 'id' });
}
