import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { useSubmitSurvey } from "@/hooks/use-survey";
import { Check, AlertCircle, Loader2 } from "lucide-react";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
  "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const SPORTS_OPTIONS = [
  "Baseball", "Basketball", "Hockey", "Formula 1", "Tennis", "Golf", "Pickleball",
  "Football", "NASCAR", "Softball", "Swimming", "Gymnastics", "Horse Racing",
  "Karate", "Rowing", "Surfing", "Volleyball", "Wrestling", "Water Polo", "Other"
];

const surveySchema = z.object({
  age: z.string()
    .min(1, { message: "Age is required" })
    .regex(/^\d+$/, { message: "Age must be a valid number" })
    .refine((val) => parseInt(val) >= 13 && parseInt(val) <= 120, {
      message: "Please enter a realistic age (13-120)",
    }),
  state: z.string().min(1, { message: "Please select a state" }),
  favorite_sports: z.array(z.string()).min(1, { message: "Please select at least one sport" }),
  other_sport: z.string().optional(),
  teams: z.string().min(1, { message: "Please tell us what teams you cheer for" }),
  attending_event: z.enum(["Yes", "No", "Unsure"], {
    required_error: "Please indicate if you plan to attend an event",
  }),
}).superRefine((data, ctx) => {
  if (data.favorite_sports.includes("Other") && (!data.other_sport || data.other_sport.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify your other favorite sport",
      path: ["other_sport"],
    });
  }
});

type SurveyFormData = z.infer<typeof surveySchema>;

export default function Survey() {
  const [, navigate] = useLocation();
  const { mutateAsync: submitSurvey, isPending, error: submitError } = useSubmitSurvey();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      favorite_sports: [],
    }
  });

  const selectedSports = watch("favorite_sports");
  const isOtherSelected = selectedSports?.includes("Other");

  const onSubmit = async (data: SurveyFormData) => {
    try {
      const payload = {
        ...data,
        other_sport: data.other_sport?.trim() || null,
      };
      await submitSurvey(payload);
      sessionStorage.setItem("survey_submission", JSON.stringify(payload));
      navigate("/thank-you");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Sports Survey</h1>
          <p className="text-muted-foreground">Please fill out the questions below. All fields are required.</p>
        </div>

        {submitError && (
          <div className="mb-8 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Submission Error</h3>
              <p className="text-sm opacity-90">{submitError.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
          
          {/* Q1: Age */}
          <section className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
            <label htmlFor="age" className="block text-lg font-semibold mb-2">
              1. What is your age? <span className="text-destructive">*</span>
            </label>
            <input
              id="age"
              type="text"
              autoFocus
              placeholder="e.g. 22"
              aria-invalid={!!errors.age}
              aria-describedby={errors.age ? "age-error" : undefined}
              className={`w-full max-w-xs px-4 py-3 rounded-xl border ${errors.age ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20'} bg-background text-foreground transition-all outline-none focus:ring-4`}
              {...register("age")}
            />
            {errors.age && (
              <p id="age-error" className="mt-2 text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {errors.age.message}
              </p>
            )}
          </section>

          {/* Q2: State */}
          <section className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
            <label htmlFor="state" className="block text-lg font-semibold mb-2">
              2. Which U.S. state do you represent? <span className="text-destructive">*</span>
            </label>
            <select
              id="state"
              aria-invalid={!!errors.state}
              aria-describedby={errors.state ? "state-error" : undefined}
              className={`w-full max-w-sm px-4 py-3 rounded-xl border ${errors.state ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20'} bg-background text-foreground transition-all outline-none focus:ring-4 appearance-none`}
              {...register("state")}
            >
              <option value="">Select a state...</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p id="state-error" className="mt-2 text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {errors.state.message}
              </p>
            )}
          </section>

          {/* Q3: Favorite Sports */}
          <section className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
            <fieldset>
              <legend className="text-lg font-semibold mb-4">
                3. What are your favorite sports? (Select all that apply) <span className="text-destructive">*</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {SPORTS_OPTIONS.map(sport => (
                  <label 
                    key={sport} 
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-secondary/50 ${selectedSports?.includes(sport) ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <input
                      type="checkbox"
                      value={sport}
                      className="w-5 h-5 rounded text-primary focus:ring-primary focus:ring-offset-background border-border/80"
                      {...register("favorite_sports")}
                    />
                    <span className="font-medium text-sm">{sport}</span>
                  </label>
                ))}
              </div>

              {isOtherSelected && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-border"
                >
                  <label htmlFor="other_sport" className="block text-sm font-semibold mb-2 text-muted-foreground">
                    Please specify your other favorite sport:
                  </label>
                  <input
                    id="other_sport"
                    type="text"
                    autoFocus
                    placeholder="e.g. Badminton"
                    aria-invalid={!!errors.other_sport}
                    aria-describedby={errors.other_sport ? "other-sport-error" : undefined}
                    className={`w-full max-w-sm px-4 py-3 rounded-xl border ${errors.other_sport ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20'} bg-background text-foreground transition-all outline-none focus:ring-4`}
                    {...register("other_sport")}
                  />
                  {errors.other_sport && (
                    <p id="other-sport-error" className="mt-2 text-sm text-destructive flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {errors.other_sport.message}
                    </p>
                  )}
                </motion.div>
              )}

              {errors.favorite_sports && (
                <p className="mt-4 text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {errors.favorite_sports.message}
                </p>
              )}
            </fieldset>
          </section>

          {/* Q4: Teams */}
          <section className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
            <label htmlFor="teams" className="block text-lg font-semibold mb-2">
              4. What sports teams do you cheer for? (separate with commas) <span className="text-destructive">*</span>
            </label>
            <input
              id="teams"
              type="text"
              placeholder="e.g. Chicago Cubs, Green Bay Packers"
              aria-invalid={!!errors.teams}
              aria-describedby={errors.teams ? "teams-error" : undefined}
              className={`w-full px-4 py-3 rounded-xl border ${errors.teams ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20'} bg-background text-foreground transition-all outline-none focus:ring-4`}
              {...register("teams")}
            />
            {errors.teams && (
              <p id="teams-error" className="mt-2 text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {errors.teams.message}
              </p>
            )}
          </section>

          {/* Q5: Attending Event */}
          <section className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
            <fieldset>
              <legend className="text-lg font-semibold mb-4">
                5. Do you plan to attend a sporting event this year? <span className="text-destructive">*</span>
              </legend>
              <Controller
                name="attending_event"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {["Yes", "No", "Unsure"].map((option) => (
                      <label 
                        key={option} 
                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:bg-secondary/50 ${field.value === option ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          value={option}
                          checked={field.value === option}
                          onChange={() => field.onChange(option)}
                        />
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${field.value === option ? 'border-primary' : 'border-muted-foreground/50'}`}>
                          {field.value === option && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <span className="font-semibold text-base">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.attending_event && (
                <p className="mt-4 text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {errors.attending_event.message}
                </p>
              )}
            </fieldset>
          </section>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              data-testid="button-submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Submit Survey
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
