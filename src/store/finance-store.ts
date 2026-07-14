/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Frequency = "monthly" | "weekly" | "yearly" | "one-time";

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  type: "salary" | "side" | "bonus" | "variable" | "expected";
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
  category: "utility" | "subscription" | "essential" | "optional" | "variable";
  autoPay: boolean;
}

export type DebtKind =
  | "personal-loan"
  | "bank-loan"
  | "family"
  | "friend"
  | "emi"
  | "bnpl"
  | "owed-to-me";

export interface Debt {
  id: string;
  name: string;
  lender: string;
  kind: DebtKind;
  original: number;
  remaining: number;
  emi: number;
  apr: number;
  dueDay: number;
  priority: number; // lower = higher priority
}

export interface CreditLine {
  id: string;
  name: string;
  kind: "credit-card" | "overdraft" | "line-of-credit";
  limit: number;
  used: number;
  statementDay: number;
  dueDay: number;
  minPayment: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  monthly: number;
  deadline?: string;
  isEmergency?: boolean;
}

export interface Investment {
  id: string;
  name: string;
  kind: "sip" | "mutual-fund" | "stock" | "fd" | "rd" | "gold" | "crypto";
  invested: number;
  currentValue: number;
}

export interface Asset {
  id: string;
  name: string;
  category: "cash" | "bank" | "vehicle" | "electronics" | "property" | "gold";
  value: number;
}

export type Strategy = "snowball" | "avalanche";

export interface PaymentRecord {
  paid: boolean;
  paidDate?: string; // ISO date
  paidAmount?: number;
}

export interface Settings {
  currency: "INR";
  strategy: Strategy;
  month: string; // YYYY-MM
  extraPayment: number;
  profileName: string;
  avatarUrl?: string;
  onboarded: boolean;
  theme: "light" | "dark" | "system";
}

interface State {
  income: IncomeSource[];
  bills: Bill[];
  debts: Debt[];
  creditLines: CreditLine[];
  savings: SavingsGoal[];
  investments: Investment[];
  assets: Asset[];
  settings: Settings;
  checklist: Record<string, PaymentRecord>; // key: `${month}:${kind}:${id}`

  addItem: <K extends CollectionKey>(k: K, item: Collections[K][number]) => void;
  updateItem: <K extends CollectionKey>(
    k: K,
    id: string,
    patch: Partial<Collections[K][number]>,
  ) => void;
  removeItem: (k: CollectionKey, id: string) => void;
  setSettings: (patch: Partial<Settings>) => void;
  markPaid: (key: string, record: PaymentRecord) => void;
  clearPaid: (key: string) => void;
  clearCollections: () => void;
  resetSeed: () => void;
}

type Collections = {
  income: IncomeSource[];
  bills: Bill[];
  debts: Debt[];
  creditLines: CreditLine[];
  savings: SavingsGoal[];
  investments: Investment[];
  assets: Asset[];
};
export type CollectionKey = keyof Collections;

const uid = () => Math.random().toString(36).slice(2, 10);

const seed = () => ({
  income: [
    { id: uid(), name: "Primary Salary", amount: 145000, frequency: "monthly", type: "salary" },
    { id: uid(), name: "Freelance", amount: 22000, frequency: "monthly", type: "side" },
  ] as IncomeSource[],
  bills: [
    { id: uid(), name: "Rent", amount: 32000, dueDay: 5, category: "essential", autoPay: false },
    {
      id: uid(),
      name: "Electricity",
      amount: 3200,
      dueDay: 12,
      category: "utility",
      autoPay: true,
    },
    { id: uid(), name: "Broadband", amount: 1499, dueDay: 18, category: "utility", autoPay: true },
    {
      id: uid(),
      name: "Groceries",
      amount: 12000,
      dueDay: 1,
      category: "variable",
      autoPay: false,
    },
    {
      id: uid(),
      name: "Netflix",
      amount: 649,
      dueDay: 22,
      category: "subscription",
      autoPay: true,
    },
  ] as Bill[],
  debts: [
    {
      id: uid(),
      name: "Home Mortgage",
      lender: "HDFC Bank",
      kind: "bank-loan",
      original: 2200000,
      remaining: 1420000,
      emi: 42500,
      apr: 8.4,
      dueDay: 5,
      priority: 3,
    },
    {
      id: uid(),
      name: "Car Loan",
      lender: "ICICI",
      kind: "bank-loan",
      original: 850000,
      remaining: 385000,
      emi: 14200,
      apr: 9.2,
      dueDay: 10,
      priority: 2,
    },
    {
      id: uid(),
      name: "Personal Credit Line",
      lender: "Axis",
      kind: "personal-loan",
      original: 200000,
      remaining: 40000,
      emi: 8500,
      apr: 14,
      dueDay: 15,
      priority: 1,
    },
  ] as Debt[],
  creditLines: [
    {
      id: uid(),
      name: "HDFC Regalia",
      kind: "credit-card",
      limit: 300000,
      used: 78000,
      statementDay: 3,
      dueDay: 21,
      minPayment: 3900,
    },
  ] as CreditLine[],
  savings: [
    {
      id: uid(),
      name: "Emergency Fund",
      target: 600000,
      current: 450000,
      monthly: 20000,
      isEmergency: true,
    },
    { id: uid(), name: "Vacation — Japan", target: 250000, current: 80000, monthly: 15000 },
    { id: uid(), name: "House Renovation", target: 500000, current: 120000, monthly: 10000 },
  ] as SavingsGoal[],
  investments: [
    { id: uid(), name: "Index SIP", kind: "sip", invested: 240000, currentValue: 312000 },
    { id: uid(), name: "Bluechip MF", kind: "mutual-fund", invested: 180000, currentValue: 224000 },
    { id: uid(), name: "Digital Gold", kind: "gold", invested: 60000, currentValue: 71000 },
  ] as Investment[],
  assets: [
    { id: uid(), name: "Savings Account", category: "bank", value: 185000 },
    { id: uid(), name: "Cash on Hand", category: "cash", value: 12000 },
    { id: uid(), name: "Honda City", category: "vehicle", value: 620000 },
  ] as Asset[],
});

const emptyCollections = () => ({
  income: [] as IncomeSource[],
  bills: [] as Bill[],
  debts: [] as Debt[],
  creditLines: [] as CreditLine[],
  savings: [] as SavingsGoal[],
  investments: [] as Investment[],
  assets: [] as Asset[],
});

export const useFinance = create<State>()(
  persist(
    (set) => ({
      ...seed(),
      settings: {
        currency: "INR",
        strategy: "snowball",
        month: new Date().toISOString().slice(0, 7),
        extraPayment: 10000,
        profileName: "Arjun Mehta",
        onboarded: false,
        theme: "system",
      },
      checklist: {},

      addItem: (k, item) =>
        set(
          (s) => ({ [k]: [...(s[k] as any[]), { ...item, id: (item as any).id || uid() }] }) as any,
        ),
      updateItem: (k, id, patch) =>
        set(
          (s) =>
            ({
              [k]: (s[k] as any[]).map((it) => (it.id === id ? { ...it, ...patch } : it)),
            }) as any,
        ),
      removeItem: (k, id) =>
        set((s) => ({ [k]: (s[k] as any[]).filter((it) => it.id !== id) }) as any),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      markPaid: (key, record) => set((s) => ({ checklist: { ...s.checklist, [key]: record } })),
      clearPaid: (key) =>
        set((s) => {
          const next = { ...s.checklist };
          delete next[key];
          return { checklist: next };
        }),
      clearCollections: () => set(() => ({ ...emptyCollections(), checklist: {} })),
      // resetSeed intentionally preserves settings (including onboarded, profileName, theme)
      resetSeed: () => set((s) => ({ ...seed(), checklist: {}, settings: s.settings })),
    }),
    {
      name: "fin-os:v1",
      version: 2,
      migrate(persisted: any, version) {
        if (version < 2) {
          // Upgrade boolean checklist values to PaymentRecord
          const old = persisted?.state?.checklist ?? {};
          const upgraded: Record<string, PaymentRecord> = {};
          for (const [k, v] of Object.entries(old)) {
            if (v === true) upgraded[k] = { paid: true };
            // false → drop (same as unchecked)
          }
          return { ...persisted, state: { ...persisted.state, checklist: upgraded } };
        }
        return persisted;
      },
    },
  ),
);

export const newId = uid;
