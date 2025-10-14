'use client';

import { useState, FormEvent } from 'react';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { OnboardingNav } from '@/components/onboarding/onboarding-nav';
import { MultiSelect } from '@/components/onboarding/multi-select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { saveOnboardingStep } from '@/lib/onboarding/onboarding-client';
import { MotivatorsFormData } from '@/types/onboarding';
import { MOTIVATORS, SELLING_STYLES } from '@/lib/constants/onboarding-options';

export default function MotivatorsPage() {
  const { currentStepNumber, totalSteps, goToNextStep, goToPreviousStep } =
    useOnboarding('motivators');

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MotivatorsFormData>({
    motivators: [],
    motivators_other: '',
    selling_style: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof MotivatorsFormData, string>>
  >({});

  const motivatorOptions = MOTIVATORS.map((m) => ({
    value: m,
    label: m,
  }));

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MotivatorsFormData, string>> = {};

    if (formData.motivators.length === 0) {
      newErrors.motivators = 'Please select at least one motivator';
    }

    if (
      formData.motivators.includes('Other') &&
      !formData.motivators_other?.trim()
    ) {
      newErrors.motivators_other = 'Please specify other motivator';
    }

    if (!formData.selling_style) {
      newErrors.selling_style = 'Please select a selling style';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await saveOnboardingStep(formData);

      if (result.success) {
        goToNextStep();
      } else {
        console.error('Error saving step:', result.error);
        alert('Failed to save progress. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProgressBar currentStep={currentStepNumber} totalSteps={totalSteps} />

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What drives you?</h2>
        <p className="text-muted-foreground">
          Understanding your motivations helps Trena provide coaching and
          encouragement that resonates with you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Motivators */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">
              What motivates you in sales? (Select all that apply) <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Be honest — this helps us understand the &quot;need behind the need&quot;
            </p>
          </div>

          <MultiSelect
            options={motivatorOptions}
            selected={formData.motivators}
            onChange={(selected) =>
              setFormData({ ...formData, motivators: selected })
            }
            allowOther={true}
            otherValue={formData.motivators_other || ''}
            onOtherChange={(value) =>
              setFormData({ ...formData, motivators_other: value })
            }
            otherPlaceholder="Specify what motivates you..."
          />

          {errors.motivators && (
            <p className="text-sm text-red-500">{errors.motivators}</p>
          )}
          {errors.motivators_other && (
            <p className="text-sm text-red-500">{errors.motivators_other}</p>
          )}
        </div>

        {/* Selling Style */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">
              What&apos;s your selling style? <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              This helps Trena match your natural communication tone
            </p>
          </div>

          <RadioGroup
            value={formData.selling_style}
            onValueChange={(value) =>
              setFormData({ ...formData, selling_style: value })
            }
            className="space-y-3"
          >
            {SELLING_STYLES.map((style) => (
              <div key={style.value} className="flex items-center space-x-2">
                <RadioGroupItem value={style.value} id={style.value} />
                <Label
                  htmlFor={style.value}
                  className="text-sm font-normal cursor-pointer"
                >
                  {style.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {errors.selling_style && (
            <p className="text-sm text-red-500">{errors.selling_style}</p>
          )}
        </div>

        <OnboardingNav
          onBack={goToPreviousStep}
          isLoading={isLoading}
          isNextDisabled={false}
        />
      </form>
    </div>
  );
}
