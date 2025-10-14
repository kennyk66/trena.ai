'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowOther?: boolean;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  otherPlaceholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  allowOther = false,
  otherValue = '',
  onOtherChange,
  otherPlaceholder = 'Specify other...',
}: MultiSelectProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
          />
          <Label
            htmlFor={option.value}
            className="text-sm font-normal cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}

      {allowOther && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="other"
              checked={selected.includes('Other')}
              onCheckedChange={() => handleToggle('Other')}
            />
            <Label htmlFor="other" className="text-sm font-normal cursor-pointer">
              Other
            </Label>
          </div>
          {selected.includes('Other') && (
            <Input
              type="text"
              placeholder={otherPlaceholder}
              value={otherValue}
              onChange={(e) => onOtherChange?.(e.target.value)}
              className="ml-6"
            />
          )}
        </div>
      )}
    </div>
  );
}
