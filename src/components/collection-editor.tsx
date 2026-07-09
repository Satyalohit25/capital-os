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
import { Trash2, Pencil, Plus } from "lucide-react";
import { formatINR } from "@/lib/finance";
import { useFinance, type CollectionKey, newId } from "@/store/finance-store";

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
}

export function CollectionEditor<T extends { id: string; [k: string]: any }>({
  collectionKey,
  items,
  fields,
  primaryField,
  amountField,
  makeEmpty,
  singular,
}: Props<T>) {
  const addItem = useFinance((s) => s.addItem);
  const updateItem = useFinance((s) => s.updateItem);
  const removeItem = useFinance((s) => s.removeItem);

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
        <div className="text-sm text-neutral-500">
          {items.length} {items.length === 1 ? singular : `${singular}s`}
          {amountField && items.length > 0 && (
            <span className="ml-3 text-neutral-400">
              • Total{" "}
              <span className="font-medium text-neutral-900">
                {formatINR(items.reduce((s, i) => s + Number(i[amountField] || 0), 0))}
              </span>
            </span>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={startAdd}
              className="bg-neutral-900 text-white hover:bg-neutral-800"
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" /> Add {singular}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-normal">
                {editing ? `Edit ${singular}` : `New ${singular}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label htmlFor={f.key} className="text-xs uppercase tracking-wider text-neutral-500">
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
                  ) : (
                    <Input
                      id={f.key}
                      type={f.type === "number" ? "number" : "text"}
                      value={draft[f.key] ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          [f.key]:
                            f.type === "number" ? Number(e.target.value) : e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} className="bg-neutral-900 text-white hover:bg-neutral-800">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="divide-y divide-neutral-950/5 border-t border-neutral-950/5">
        {items.length === 0 && (
          <div className="py-10 text-center text-sm text-neutral-400">
            Nothing here yet. Add your first {singular}.
          </div>
        )}
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-4 py-4">
            <div className="flex-1">
              <div className="text-sm font-medium text-neutral-900">{String(it[primaryField])}</div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                {fields
                  .filter((f) => f.key !== primaryField && f.key !== amountField)
                  .slice(0, 3)
                  .map((f) => (
                    <span key={f.key}>
                      <span className="uppercase tracking-wider text-neutral-400">{f.label}: </span>
                      {f.format ? f.format(it[f.key]) : String(it[f.key])}
                    </span>
                  ))}
              </div>
            </div>
            {amountField && (
              <div className="text-right font-serif text-lg tabular-nums text-neutral-900">
                {formatINR(Number(it[amountField]))}
              </div>
            )}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-400 hover:text-neutral-900"
                onClick={() => startEdit(it)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-400 hover:text-red-600"
                onClick={() => removeItem(collectionKey, it.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
