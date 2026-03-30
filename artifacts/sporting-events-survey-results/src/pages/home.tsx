import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { ArrowRight, BarChart3, Database, ClipboardList } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [showSql, setShowSql] = useState(false);

  return (
    <Layout>
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-8 md:pt-16 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 ring-1 ring-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Live Data Collection Active
        </div>
        
        <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground leading-tight tracking-tight mb-6">
          Understanding our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sports Culture</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          We're conducting a brief study to understand the sporting preferences and attendance plans of our university community. Your anonymous responses help us paint a picture of our collective sports fandom.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link 
            href="/survey" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            data-testid="button-start-survey"
          >
            <ClipboardList className="w-5 h-5" />
            Take the Survey
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
          
          <Link 
            href="/results" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-card text-foreground border-2 border-border hover:border-primary/50 hover:bg-secondary/50 shadow-sm hover:shadow-md transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            data-testid="button-view-results"
          >
            <BarChart3 className="w-5 h-5" />
            View Results
          </Link>
        </div>
      </div>

      {/* Developer Information Section */}
      <div className="mt-24 max-w-2xl mx-auto">
        <button 
          onClick={() => setShowSql(!showSql)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <Database className="w-4 h-4" />
          {showSql ? "Hide Database Instructions" : "Developer: Show Database Setup"}
        </button>

        <AnimatePresence>
          {showSql && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="p-6 bg-card border border-border rounded-2xl shadow-sm text-left">
                <h3 className="text-lg font-bold mb-2">Supabase Setup Instructions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Run the following SQL in your Supabase SQL Editor to create the necessary table and enable public inserts/selects for the frontend.
                </p>
                <div className="relative rounded-lg bg-zinc-950 p-4 overflow-x-auto">
                  <pre className="text-xs text-zinc-50 font-mono leading-relaxed">
{`CREATE TABLE survey_responses (
  id bigint primary key generated always as identity,
  created_at timestamptz default now(),
  age text not null,
  state text not null,
  favorite_sports text[] not null,
  other_sport text,
  teams text not null,
  attending_event text not null
);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON survey_responses
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous selects" ON survey_responses
  FOR SELECT TO anon USING (true);`}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
