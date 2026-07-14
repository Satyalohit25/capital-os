import { useState } from "react";
import { Input } from "@/components/ui/input";

interface AmountInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
}

/** Displays Indian-locale formatted number while editing; stores plain numeric value. */
export function AmountInput({ id, value, onChange }: AmountInputProps) {
  const [focused, setFocused] = useState(false);
  // While focused: show raw digits so user can edit naturally
  // While blurred: show formatted string
  const display = focused
    ? value === 0
      ? ""
      : String(value)
    : value === 0
      ? ""
      : value.toLocaleString("en-IN");

  return (
    <Input
      id={id}
      inputMode="numeric"
      value={display}
      placeholder="0"
      className="font-mono"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const digits = e.target.value.replace(/[^\d]/g, "");
        onChange(digits === "" ? 0 : Number(digits));
      }}
    />
  );
}
