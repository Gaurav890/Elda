// Add Patient Modal with 3-Step Form

'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MultiStepForm } from '@/components/forms/MultiStepForm';
import { useCreatePatient } from '@/hooks/usePatients';
import { PatientCreate } from '@/types/patient';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Form validation schema
const patientSchema = z.object({
  // Step 1: Basic Info
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  phone_number: z.string().optional(),

  // Step 2: Health & Routine
  medical_conditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),

  // Step 3: Preferences
  timezone: z.string().optional(),
  preferred_voice: z.enum(['male', 'female', 'neutral']).optional(),
  communication_style: z.enum(['friendly', 'formal', 'casual']).optional(),
  language: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface AddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPatientModal({ open, onOpenChange }: AddPatientModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [tempArrayInputs, setTempArrayInputs] = useState({
    medical_condition: '',
    medication: '',
    allergy: '',
    dietary_restriction: '',
  });

  const createPatient = useCreatePatient();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: undefined,
      phone_number: '',
      medical_conditions: [],
      medications: [],
      allergies: [],
      dietary_restrictions: [],
      emergency_contact_name: '',
      emergency_contact_phone: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferred_voice: 'female',
      communication_style: 'friendly',
      language: 'en',
    },
  });

  // Validate step before proceeding
  const canProceedToNextStep = () => {
    const values = form.getValues();

    if (currentStep === 1) {
      return values.first_name && values.last_name && values.date_of_birth;
    }

    return true; // Steps 2 and 3 are optional
  };

  const handleNext = () => {
    if (canProceedToNextStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    form.handleSubmit((data) => {
      createPatient.mutate(data as PatientCreate, {
        onSuccess: () => {
          form.reset();
          setCurrentStep(1);
          onOpenChange(false);
        },
      });
    })();
  };

  // Helper functions for array fields
  const addArrayItem = (field: keyof typeof tempArrayInputs, arrayField: keyof PatientFormData) => {
    const value = tempArrayInputs[field].trim();
    if (value) {
      const currentArray = (form.getValues(arrayField) as string[]) || [];
      form.setValue(arrayField as any, [...currentArray, value]);
      setTempArrayInputs({ ...tempArrayInputs, [field]: '' });
    }
  };

  const removeArrayItem = (arrayField: keyof PatientFormData, index: number) => {
    const currentArray = (form.getValues(arrayField) as string[]) || [];
    form.setValue(arrayField as any, currentArray.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Add Loved One</DialogTitle>
          <DialogDescription>
            Add a new person to your care circle to start monitoring their health and well-being.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <MultiStepForm
            currentStep={currentStep}
            totalSteps={3}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            canGoNext={canProceedToNextStep()}
            isSubmitting={createPatient.isPending}
          >
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Mary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Johnson" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                            }}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1-555-0123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Health & Routine */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Health & Emergency Contacts</h3>

                {/* Medical Conditions */}
                <FormField
                  control={form.control}
                  name="medical_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add condition..."
                          value={tempArrayInputs.medical_condition}
                          onChange={(e) =>
                            setTempArrayInputs({ ...tempArrayInputs, medical_condition: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addArrayItem('medical_condition', 'medical_conditions');
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => addArrayItem('medical_condition', 'medical_conditions')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
                            >
                              {item}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('medical_conditions', index)}
                                className="hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Medications */}
                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medications</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add medication..."
                          value={tempArrayInputs.medication}
                          onChange={(e) =>
                            setTempArrayInputs({ ...tempArrayInputs, medication: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addArrayItem('medication', 'medications');
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => addArrayItem('medication', 'medications')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
                            >
                              {item}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('medications', index)}
                                className="hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Allergies */}
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add allergy..."
                          value={tempArrayInputs.allergy}
                          onChange={(e) =>
                            setTempArrayInputs({ ...tempArrayInputs, allergy: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addArrayItem('allergy', 'allergies');
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => addArrayItem('allergy', 'allergies')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
                            >
                              {item}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('allergies', index)}
                                className="hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dietary Restrictions */}
                <FormField
                  control={form.control}
                  name="dietary_restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Restrictions</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add restriction..."
                          value={tempArrayInputs.dietary_restriction}
                          onChange={(e) =>
                            setTempArrayInputs({ ...tempArrayInputs, dietary_restriction: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addArrayItem('dietary_restriction', 'dietary_restrictions');
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => addArrayItem('dietary_restriction', 'dietary_restrictions')}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
                            >
                              {item}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('dietary_restrictions', index)}
                                className="hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Emergency Contacts */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-md font-semibold mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergency_contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Sarah Johnson" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergency_contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1-555-0123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI & Communication Preferences</h3>

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Automatically detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preferred_voice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Voice</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communication_style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Style</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="it">Italian</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-4">
                  <p className="text-sm text-textSecondary">
                    These preferences help customize the AI companion's voice and communication style
                    to best suit your loved one's preferences.
                  </p>
                </div>
              </div>
            )}
          </MultiStepForm>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
