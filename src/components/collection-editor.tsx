/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AmountInput } from "@/components/ui/amount-input";
import { Trash2, Pencil, Plus, CheckCircle, Circle } from "lucide-react";
import { formatINR } from "@/lib/finance";
import { useFinance, type CollectionKey, newId, type PaymentRecord } from "@/store/finance-store";

export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  type?: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  format?: (v: any) => ReactNode;
  width?: string;
}

interface Props<T extends { id: string }> {
  collectionKey: CollectionKey;
  items: T[];
  fields: FieldDef<T>[];
  primaryField: keyof T & string;
  amountField?: keyof T & string;
  makeEmpty: () => Omit<T, "id">;
  singular: string;
  /** If provided, enables mark-paid per row. Returns the checklist key for an item. */
  markPaidKey?: (item: T) => string;
  /** Default amount when opening the paid popover (e.g. bill.amount or debt.emi) */
  defaultPaidAmount?: (item: T) => number;
}

export function CollectionEditor<T extends { id: string; [k: string]: any }>({
  collectionKey,
  items,
  fields,
  primaryField,
  amountField,
  makeEmpty,
  singular,
  markPaidKey,
  defaultPaidAmount,
}: Props<T>) {
  const addItem = useFinance((s) => s.addItem);
  const updateItem = useFinance((s) => s.updateItem);
  const removeItem = useFinance((s) => s.removeItem);
  const markPaid = useFinance((s) => s.markPaid);
  const clearPaid = useFinance((s) => s.clearPaid);
  const checklist = useFinance((s) => s.checklist);
  const month = useFinance((s) => s.settings.month);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [draft, setDraft] = useState<any>(makeEmpty());

  const startAdd = () => {
    setEditing(null);
    setDraft(makeEmpty());
    setOpen(true);
  };
  const startEdit = (it: T) => {
    setEditing(it);
    setDraft({ ...it });
    setOpen(true);
  };
  const save = () => {
    if (editing) {
      updateItem(collectionKey, editing.id, draft as any);
    } else {
      addItem(collectionKey, { ...(draft as any), id: newId() });
    }
    setOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? singular : `${singular}s`}
          {amountField && items.length > 0 && (
            <span className="ml-3 text-muted-foreground/80">
              • Total{" "}
              <span className="font-medium text-foreground">
                {formatINR(items.reduce((s, i) => s + Number(i[amountField] || 0), 0))}
              </span>
            </span>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={startAdd}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" /> Add {singular}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-normal">
                {editing ? `Edit ${singular}` : `New ${singular}`}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label
                    htmlFor={f.key}
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    {f.label}
                  </Label>
                  {f.type === "select" && f.options ? (
                    <Select
                      value={String(draft[f.key] ?? "")}
                      onValueChange={(v) => setDraft({ ...draft, [f.key]: v })}
                    >
                      <SelectTrigger id={f.key}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {f.options.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : f.type === "number" ? (
                    <AmountInput
                      id={f.key}
                      value={Number(draft[f.key] ?? 0)}
                      onChange={(v) => setDraft({ ...draft, [f.key]: v })}
                    />
                  ) : (
                    <Input
                      id={f.key}
                      type="text"
                      value={draft[f.key] ?? ""}
                      onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {items.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground/80">
            Nothing here yet. Add your first {singular}.
          </div>
        )}
        {items.map((it) => {
          const paidKey = markPaidKey ? `${month}:${markPaidKey(it)}` : null;
          const record: PaymentRecord | undefined = paidKey ? checklist[paidKey] : undefined;
          const isPaid = record?.paid ?? false;

          return (
            <div key={it.id} className="flex items-center gap-4 py-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {String(it[primaryField])}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {fields
                    .filter((f) => f.key !== primaryField && f.key !== amountField)
                    .slice(0, 3)
                    .map((f) => (
                      <span key={f.key}>
                        <span className="uppercase tracking-wider text-muted-foreground/80">
                          {f.label}:{" "}
                        </span>
                        {f.format ? f.format(it[f.key]) : String(it[f.key])}
                      </span>
                    ))}
                  {isPaid && record?.paidDate && (
                    <span className="text-emerald-600">
                      ✓ Paid {record.paidDate}
                      {record.paidAmount ? ` · ${formatINR(record.paidAmount)}` : ""}
                    </span>
                  )}
                </div>
              </div>
              {amountField && (
                <div className="text-right font-serif text-lg tabular-nums text-foreground">
                  {formatINR(Number(it[amountField]))}
                </div>
              )}
              <div className="flex gap-1">
                {/* Mark paid */}
                {paidKey && (
                  <MarkPaidButton
                    isPaid={isPaid}
                    defaultAmount={defaultPaidAmount ? defaultPaidAmount(it) : 0}
                    onConfirm={(date, amount) =>
                      markPaid(paidKey, { paid: true, paidDate: date, paidAmount: amount })
                    }
                    onClear={() => clearPaid(paidKey)}
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground/80 hover:text-foreground"
                  onClick={() => startEdit(it)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground/80 hover:text-red-600"
                  onClick={() => removeItem(collectionKey, it.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function MarkPaidButton({
  isPaid,
  defaultAmount,
  onConfirm,
  onClear,
}: {
  isPaid: boolean;
  defaultAmount: number;
  onConfirm: (date: string, amount: number) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState(defaultAmount);

  if (isPaid) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-emerald-600 hover:text-muted-foreground"
        onClick={onClear}
        title="Mark unpaid"
      >
        <CheckCircle className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground/80 hover:text-emerald-600"
          title="Mark paid"
          onClick={() => {
            setDate(today);
            setAmount(defaultAmount);
          }}
        >
          <Circle className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Confirm payment</div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Date paid</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Amount paid (₹)
            </label>
            <AmountInput value={amount} onChange={setAmount} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                onConfirm(date, amount);
                setOpen(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
