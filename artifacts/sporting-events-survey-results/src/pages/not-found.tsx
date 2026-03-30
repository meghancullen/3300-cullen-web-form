import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          We couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link 
          href="/" 
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </Layout>
  );
}
