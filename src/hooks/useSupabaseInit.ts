import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { isSupabaseEnabled } from '@/lib/supabase';
import {
  loadAllData,
  seedSupabase,
  syncTenants,
  syncProperties,
  syncPendingRegistrations,
  syncDues,
  syncPayments,
  syncExpenses,
  syncMaintenanceRequests,
  syncNotices,
  syncAgreements,
  syncUtilityBills,
  syncVisitors,
  syncActivityLogs,
} from '@/lib/supabaseDB';

export function useSupabaseInit() {
  const isSyncing = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!isSupabaseEnabled || initialized.current) return;
    initialized.current = true;

    // Load all data from Supabase on mount
    loadAllData().then((data) => {
      if (!data) return;

      const hasData =
        data.properties.length > 0 ||
        data.tenants.length > 0 ||
        data.dues.length > 0;

      isSyncing.current = true;

      const store = useStore.getState();

      if (hasData) {
        // Supabase has data — use it (cloud overrides localStorage)
        store.setProperties(data.properties);
        store.setTenants(data.tenants);
        store.setDues(data.dues);
        // For collections without a setter, we use internal mutations via setters below
        if (data.payments.length > 0) {
          // Replace payments by deleting all and re-adding
          for (const p of store.payments) store.deletePayment(p.id);
          for (const p of data.payments) store.addPayment(p);
        }
        if (data.expenses.length > 0) {
          for (const e of store.expenses) store.deleteExpense(e.id);
          for (const e of data.expenses) store.addExpense(e);
        }
        if (data.maintenanceRequests.length > 0) {
          for (const r of store.maintenanceRequests) store.deleteMaintenanceRequest(r.id);
          for (const r of data.maintenanceRequests) store.addMaintenanceRequest(r);
        }
        if (data.notices.length > 0) {
          for (const n of store.notices) store.deleteNotice(n.id);
          for (const n of data.notices) store.addNotice(n);
        }
        if (data.agreements.length > 0) {
          for (const a of data.agreements) store.addAgreement(a);
        }
        if (data.utilityBills.length > 0) {
          for (const b of store.utilityBills) store.deleteUtilityBill(b.id);
          for (const b of data.utilityBills) store.addUtilityBill(b);
        }
        if (data.visitors.length > 0) {
          for (const v of store.visitors) store.deleteVisitor(v.id);
          for (const v of data.visitors) store.addVisitor(v);
        }
        if (data.pendingRegistrations.length > 0) {
          for (const r of data.pendingRegistrations) store.addPendingRegistration(r);
        }
      } else {
        // No data in Supabase yet — seed from current localStorage state
        const s = useStore.getState();
        seedSupabase({
          properties: s.properties,
          tenants: s.tenants,
          pendingRegistrations: s.pendingRegistrations,
          dues: s.dues,
          payments: s.payments,
          expenses: s.expenses,
          maintenanceRequests: s.maintenanceRequests,
          notices: s.notices,
          agreements: s.agreements,
          utilityBills: s.utilityBills,
          visitors: s.visitors,
          activityLogs: s.activityLogs,
        });
      }

      // Allow a tick for state to settle before enabling sync
      setTimeout(() => { isSyncing.current = false; }, 200);
    });

    // Subscribe to store changes — sync changed collections to Supabase
    const unsub = useStore.subscribe((state, prev) => {
      if (isSyncing.current) return;

      if (state.tenants !== prev.tenants) syncTenants(state.tenants);
      if (state.properties !== prev.properties) syncProperties(state.properties);
      if (state.pendingRegistrations !== prev.pendingRegistrations) syncPendingRegistrations(state.pendingRegistrations);
      if (state.dues !== prev.dues) syncDues(state.dues);
      if (state.payments !== prev.payments) syncPayments(state.payments);
      if (state.expenses !== prev.expenses) syncExpenses(state.expenses);
      if (state.maintenanceRequests !== prev.maintenanceRequests) syncMaintenanceRequests(state.maintenanceRequests);
      if (state.notices !== prev.notices) syncNotices(state.notices);
      if (state.agreements !== prev.agreements) syncAgreements(state.agreements);
      if (state.utilityBills !== prev.utilityBills) syncUtilityBills(state.utilityBills);
      if (state.visitors !== prev.visitors) syncVisitors(state.visitors);
      if (state.activityLogs !== prev.activityLogs) syncActivityLogs(state.activityLogs);
    });

    return () => { unsub(); };
  }, []);
}
