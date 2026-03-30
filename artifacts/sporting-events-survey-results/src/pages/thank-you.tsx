import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { CheckCircle2, BarChart3, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

interface SurveySubmission {
  age: string;
  state: string;
  favorite_sports: string[];
  other_sport?: string;
  teams: string;
  attending_event: string;
}

export default function ThankYou() {
  const [, navigate] = useLocation();
  const [submission, setSubmission] = useState<SurveySubmission | null>(null);

  useEffect(() => {
    // Fire confetti on load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);

    // Retrieve data
    const dataStr = sessionStorage.getItem("survey_submission");
    if (dataStr) {
      try {
        setSubmission(JSON.parse(dataStr));
      } catch {
        // ignore
      }
    } else {
      // If no data, redirect to survey after short delay to prevent confusion
      setTimeout(() => navigate("/survey"), 3000);
    }

    return () => clearInterval(interval);
  }, [navigate]);

  if (!submission) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-pulse bg-card w-full max-w-md h-64 rounded-2xl"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-card p-8 md:p-12 rounded-3xl border border-border shadow-xl shadow-black/5 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
          
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Thank You!</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your response has been successfully recorded. We appreciate your contribution to our sports culture study.
          </p>

          <div className="bg-secondary/50 rounded-2xl p-6 text-left mb-8 border border-border/50">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Your Answers Summary</h3>
            <dl className="space-y-4 text-sm md:text-base">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-border/50 pb-4">
                <dt className="text-muted-foreground font-medium">Age</dt>
                <dd className="sm:col-span-2 font-semibold">{submission.age}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-border/50 pb-4">
                <dt className="text-muted-foreground font-medium">State</dt>
                <dd className="sm:col-span-2 font-semibold">{submission.state}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-border/50 pb-4">
                <dt className="text-muted-foreground font-medium">Favorite Sports</dt>
                <dd className="sm:col-span-2 font-semibold">
                  {submission.favorite_sports.map((s: string) => s === "Other" ? submission.other_sport : s).join(", ")}
                </dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-border/50 pb-4">
                <dt className="text-muted-foreground font-medium">Teams</dt>
                <dd className="sm:col-span-2 font-semibold">{submission.teams}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="text-muted-foreground font-medium">Attending Event</dt>
                <dd className="sm:col-span-2 font-semibold">{submission.attending_event}</dd>
              </div>
            </dl>
          </div>

          <Link 
            href="/results" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary/30 w-full sm:w-auto"
            data-testid="button-view-results-success"
          >
            <BarChart3 className="w-5 h-5" />
            View Community Results
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
