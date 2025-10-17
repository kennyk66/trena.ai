'use client';

import { useState, FormEvent } from 'react';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { OnboardingNav } from '@/components/onboarding/onboarding-nav';
import { MultiSelect } from '@/components/onboarding/multi-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { saveOnboardingStep } from '@/lib/onboarding/onboarding-client';
import { MotivatorsFormData } from '@/types/onboarding';
import { MOTIVATORS, SELLING_STYLES, EMAIL_OPENER_STYLES } from '@/lib/constants/onboarding-options';

export default function MotivatorsPage() {
  const { currentStepNumber, totalSteps, goToNextStep, goToPreviousStep } =
    useOnboarding('motivators');

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MotivatorsFormData>({
    motivators: [],
    motivators_other: '',
    selling_style: '',
    email_opener_style: '',
    use_name_in_outreach: true,
    current_target: '',
    biggest_blocker: '',
    support_needs: '',
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

        {/* Current Target */}
        <div className="space-y-2">
          <Label htmlFor="current_target">What&apos;s your current target? (optional)</Label>
          <Input
            id="current_target"
            type="text"
            placeholder="$100K/month or 20 deals/quarter"
            value={formData.current_target}
            onChange={(e) => setFormData({ ...formData, current_target: e.target.value })}
          />
        </div>

        {/* Biggest Blocker */}
        <div className="space-y-2">
          <Label htmlFor="biggest_blocker">What&apos;s your biggest blocker right now? (optional)</Label>
          <Input
            id="biggest_blocker"
            type="text"
            placeholder="Finding qualified leads, follow-up, time management..."
            value={formData.biggest_blocker}
            onChange={(e) => setFormData({ ...formData, biggest_blocker: e.target.value })}
          />
        </div>

        {/* Support Needs */}
        <div className="space-y-2">
          <Label htmlFor="support_needs">What kind of support would help most? (optional)</Label>
          <Input
            id="support_needs"
            type="text"
            placeholder="Lead generation, messaging templates, prioritization..."
            value={formData.support_needs}
            onChange={(e) => setFormData({ ...formData, support_needs: e.target.value })}
          />
        </div>

        {/* Email Opener Style */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">
              How do you like to open a cold email?
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              This helps Trena craft the perfect opening line
            </p>
          </div>

          <RadioGroup
            value={formData.email_opener_style}
            onValueChange={(value) =>
              setFormData({ ...formData, email_opener_style: value })
            }
            className="space-y-3"
          >
            {EMAIL_OPENER_STYLES.map((style) => (
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
        </div>

        {/* Use Name in Outreach */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">
              Should Trena use your name in outreach?
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Some people prefer a more personal touch
            </p>
          </div>

          <RadioGroup
            value={formData.use_name_in_outreach ? 'yes' : 'no'}
            onValueChange={(value) =>
              setFormData({ ...formData, use_name_in_outreach: value === 'yes' })
            }
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="use-name-yes" />
              <Label htmlFor="use-name-yes" className="text-sm font-normal cursor-pointer">
                Yes, use my name
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="use-name-no" />
              <Label htmlFor="use-name-no" className="text-sm font-normal cursor-pointer">
                No, keep it general
              </Label>
            </div>
          </RadioGroup>
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
