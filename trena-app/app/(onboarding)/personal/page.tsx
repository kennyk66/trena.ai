'use client';

import { useState, FormEvent } from 'react';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { OnboardingNav } from '@/components/onboarding/onboarding-nav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveOnboardingStep } from '@/lib/onboarding/onboarding-client';
import { PersonalFormData } from '@/types/onboarding';
import { EXPERIENCE_LEVELS } from '@/lib/constants/onboarding-options';

export default function PersonalPage() {
  const { currentStepNumber, totalSteps, goToNextStep, goToPreviousStep } =
    useOnboarding('personal');

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PersonalFormData>({
    name: '',
    job_title: '',
    company_name: '',
    sales_quota: '',
    experience_level: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PersonalFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.job_title.trim()) {
      newErrors.job_title = 'Job title is required';
    }
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }
    if (!formData.experience_level) {
      newErrors.experience_level = 'Experience level is required';
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
        <h2 className="text-2xl font-bold">Tell us about yourself</h2>
        <p className="text-muted-foreground">
          Help us understand your role and experience so we can personalize your
          Trena experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Smith"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="job_title">
            Job Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="job_title"
            type="text"
            placeholder="Account Executive"
            value={formData.job_title}
            onChange={(e) =>
              setFormData({ ...formData, job_title: e.target.value })
            }
            className={errors.job_title ? 'border-red-500' : ''}
          />
          {errors.job_title && (
            <p className="text-sm text-red-500">{errors.job_title}</p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="company_name"
            type="text"
            placeholder="Acme Corp"
            value={formData.company_name}
            onChange={(e) =>
              setFormData({ ...formData, company_name: e.target.value })
            }
            className={errors.company_name ? 'border-red-500' : ''}
          />
          {errors.company_name && (
            <p className="text-sm text-red-500">{errors.company_name}</p>
          )}
        </div>

        {/* Sales Quota */}
        <div className="space-y-2">
          <Label htmlFor="sales_quota">Monthly/Quarterly Sales Quota (optional)</Label>
          <Input
            id="sales_quota"
            type="text"
            placeholder="$50,000/month or 10 deals/quarter"
            value={formData.sales_quota}
            onChange={(e) =>
              setFormData({ ...formData, sales_quota: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            This helps us track your progress and celebrate wins
          </p>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label htmlFor="experience_level">
            Sales Experience <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.experience_level}
            onValueChange={(value) =>
              setFormData({ ...formData, experience_level: value })
            }
          >
            <SelectTrigger
              className={errors.experience_level ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.experience_level && (
            <p className="text-sm text-red-500">{errors.experience_level}</p>
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
