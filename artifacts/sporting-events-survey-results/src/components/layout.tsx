import React from "react";
import { Link, useLocation } from "wouter";
import { Trophy, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg hidden sm:block">
              University Sports Survey
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4">
            {location !== "/results" && (
              <Link 
                href="/results"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">View Results</span>
              </Link>
            )}
            {location !== "/survey" && location !== "/thank-you" && (
              <Link 
                href="/survey"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Take Survey
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 opacity-50" />
            <p>Survey by [Meghan Cullen], BAIS:3300 - spring 2026.</p>
          </div>
          <div className="text-xs opacity-60">
            For academic purposes only.
          </div>
        </div>
      </footer>
    </div>
  );
}
