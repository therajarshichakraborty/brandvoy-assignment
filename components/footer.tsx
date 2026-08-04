import Link from "next/link";
import { Database, FileText, Sparkles, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/60 bg-card py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600" />
            <span>Made by Rajarshi Chakraborty</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link
              href="/api-docs"
              className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              API Documentation (Swagger UI)
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="/api/openapi.json"
              target="_blank"
              className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              OpenAPI JSON Spec
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
