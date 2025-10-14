'use client';

import { TONE_OPTIONS } from '@/lib/constants/outreach-options';
import type { ToneOption } from '@/types/outreach';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ToneSelectorProps {
  value: ToneOption;
  onChange: (tone: ToneOption) => void;
  disabled?: boolean;
}

export function ToneSelector({ value, onChange, disabled = false }: ToneSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Tone</Label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as ToneOption)}
        disabled={disabled}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {TONE_OPTIONS.map((option) => (
          <div key={option.value} className="relative">
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="peer sr-only"
            />
            <Label
              htmlFor={option.value}
              className="flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{option.icon}</span>
                <span className="font-semibold">{option.label}</span>
              </div>
              <p className="text-xs text-gray-600">{option.description}</p>
              {option.example && (
                <p className="text-xs text-gray-500 italic mt-1 line-clamp-2">
                  {option.example}
                </p>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
