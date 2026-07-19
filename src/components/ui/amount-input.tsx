import { useState } from "react";
import { Input } from "@/components/ui/input";
import { inrToWords } from "@/lib/inr-words";

interface AmountInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  /** Hide the "in words" helper below the field. */
  hideWords?: boolean;
}

/** Indian-locale formatted number with a "in words" helper below. */
export function AmountInput({ id, value, onChange, hideWords }: AmountInputProps) {
  const [focused, setFocused] = useState(false);
  const display = focused
    ? value === 0
      ? ""
      : String(value)
    : value === 0
      ? ""
      : value.toLocaleString("en-IN");

  const words = inrToWords(value);

  return (
    <div>
      <Input
        id={id}
        inputMode="numeric"
        value={display}
        placeholder="0"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          onChange(digits === "" ? 0 : Number(digits));
        }}
      />
      {!hideWords && words && (
        <div className="mt-1 text-[11px] italic text-muted-foreground">₹ {words}</div>
      )}
    </div>
  );
}
