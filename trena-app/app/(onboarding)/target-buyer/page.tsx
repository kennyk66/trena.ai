'use client';

import { useState, FormEvent } from 'react';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { OnboardingNav } from '@/components/onboarding/onboarding-nav';
import { MultiSelect } from '@/components/onboarding/multi-select';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveOnboardingStep } from '@/lib/onboarding/onboarding-client';
import { TargetBuyerFormData } from '@/types/onboarding';
import {
  INDUSTRIES,
  BUYER_ROLES,
  REGIONS,
  SALES_MOTIONS,
} from '@/lib/constants/onboarding-options';

export default function TargetBuyerPage() {
  const { currentStepNumber, totalSteps, goToNextStep, goToPreviousStep } =
    useOnboarding('target-buyer');

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TargetBuyerFormData>({
    target_industries: [],
    industries_other: '',
    target_roles: [],
    roles_other: '',
    target_region: '',
    sales_motion: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof TargetBuyerFormData, string>>
  >({});

  const industryOptions = INDUSTRIES.map((i) => ({ value: i, label: i }));
  const roleOptions = BUYER_ROLES.map((r) => ({ value: r, label: r }));

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TargetBuyerFormData, string>> = {};

    if (formData.target_industries.length === 0) {
      newErrors.target_industries = 'Please select at least one industry';
    }

    if (
      formData.target_industries.includes('Other') &&
      !formData.industries_other?.trim()
    ) {
      newErrors.industries_other = 'Please specify other industry';
    }

    if (formData.target_roles.length === 0) {
      newErrors.target_roles = 'Please select at least one role';
    }

    if (
      formData.target_roles.includes('Other') &&
      !formData.roles_other?.trim()
    ) {
      newErrors.roles_other = 'Please specify other role';
    }

    if (!formData.target_region) {
      newErrors.target_region = 'Please select a region';
    }

    if (!formData.sales_motion) {
      newErrors.sales_motion = 'Please select a sales motion';
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
        <h2 className="text-2xl font-bold">Who are you selling to?</h2>
        <p className="text-muted-foreground">
          Help us understand your ideal customer profile so we can find the best
          leads for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Target Industries */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">
              Target Industries (Select all that apply){' '}
              <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Which industries do you typically sell to?
            </p>
          </div>

          <MultiSelect
            options={industryOptions}
            selected={formData.target_industries}
            onChange={(selected) =>
              setFormData({ ...formData, target_industries: selected })
            }
            allowOther={true}
            otherValue={formData.industries_other || ''}
            onOtherChange={(value) =>
              setFormData({ ...formData, industries_other: value })
            }
            otherPlaceholder="Specify other industry..."
          />

          {errors.target_industries && (
            <p className="text-sm text-red-500">{errors.target_industries}</p>
          )}
          {errors.industries_other && (
            <p className="text-sm text-red-500">{errors.industries_other}</p>
          )}
        </div>

        {/* Target Roles */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">
              Target Buyer Roles (Select all that apply){' '}
              <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Which decision-makers do you usually reach out to?
            </p>
          </div>

          <MultiSelect
            options={roleOptions}
            selected={formData.target_roles}
            onChange={(selected) =>
              setFormData({ ...formData, target_roles: selected })
            }
            allowOther={true}
            otherValue={formData.roles_other || ''}
            onOtherChange={(value) =>
              setFormData({ ...formData, roles_other: value })
            }
            otherPlaceholder="Specify other role..."
          />

          {errors.target_roles && (
            <p className="text-sm text-red-500">{errors.target_roles}</p>
          )}
          {errors.roles_other && (
            <p className="text-sm text-red-500">{errors.roles_other}</p>
          )}
        </div>

        {/* Geographic Region */}
        <div className="space-y-2">
          <Label htmlFor="target_region">
            Geographic Region <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.target_region}
            onValueChange={(value) =>
              setFormData({ ...formData, target_region: value })
            }
          >
            <SelectTrigger
              className={errors.target_region ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select your primary region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.target_region && (
            <p className="text-sm text-red-500">{errors.target_region}</p>
          )}
        </div>

        {/* Sales Motion */}
        <div className="space-y-2">
          <Label htmlFor="sales_motion">
            Sales Motion <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.sales_motion}
            onValueChange={(value) =>
              setFormData({ ...formData, sales_motion: value })
            }
          >
            <SelectTrigger
              className={errors.sales_motion ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select your sales approach" />
            </SelectTrigger>
            <SelectContent>
              {SALES_MOTIONS.map((motion) => (
                <SelectItem key={motion.value} value={motion.value}>
                  {motion.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sales_motion && (
            <p className="text-sm text-red-500">{errors.sales_motion}</p>
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
