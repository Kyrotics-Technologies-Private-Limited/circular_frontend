// src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Languages,
  FolderOpen,
  Users,
  Columns2,
  FileText,
  Download,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: FolderOpen,
      name: 'Nested Folder Structure',
      description: 'Organize your files with an intuitive folder hierarchy similar to Google Drive.',
      accent: 'from-primary/15 to-primary/5 text-primary',
    },
    {
      icon: Languages,
      name: 'Multiple Language Support',
      description: 'Translate your documents into numerous languages with high accuracy.',
      accent: 'from-amber-500/15 to-amber-500/5 text-amber-600',
    },
    {
      icon: Users,
      name: 'Team Collaboration',
      description: 'Work together with your team by sharing access to organizations and files.',
      accent: 'from-primary/15 to-primary/5 text-primary',
    },
    {
      icon: Columns2,
      name: 'Split-View Editing',
      description: 'Edit translations with original and translated content side by side.',
      accent: 'from-amber-500/15 to-amber-500/5 text-amber-600',
    },
    {
      icon: FileText,
      name: 'PDF and Word Support',
      description: 'Upload and translate documents in popular formats like PDF and Word.',
      accent: 'from-primary/15 to-primary/5 text-primary',
    },
    {
      icon: Download,
      name: 'Download Translated Documents',
      description: 'Export your translated documents in multiple formats for sharing.',
      accent: 'from-amber-500/15 to-amber-500/5 text-amber-600',
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" aria-hidden="true" />
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" aria-hidden="true" />

        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 shadow-sm">
                <Languages className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">Bhasantar</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              Translation &amp; file management, together
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground text-balance">
              Document Translation{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
                Made Simple
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Upload, organize, and translate your documents with ease. Our platform supports
              multiple languages and document formats with a simple, intuitive interface.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-xl border border-border bg-card text-foreground hover:bg-accent transition-all duration-200"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { value: '30+', label: 'Languages' },
                { value: '100%', label: 'Secure' },
                { value: '24/7', label: 'Access' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border bg-card/60 backdrop-blur px-4 py-5">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-card border-y border-border">
        <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Key Features</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Everything you need to translate &amp; manage
            </h2>
            <p className="mt-4 text-base text-muted-foreground text-balance">
              Everything you need to manage and translate your documents efficiently.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, name, description, accent }) => (
              <div
                key={name}
                className="group relative rounded-2xl border border-border bg-background p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${accent}`}>
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA band */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/80" aria-hidden="true" />
        <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-amber-400/25 blur-3xl" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 border border-white/20 mb-6">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
            Ready to translate your documents?
          </h2>
          <p className="mt-4 text-base text-white/80 max-w-xl mx-auto text-balance">
            Join Bhasantar today and start managing and translating your files effortlessly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-white text-primary hover:bg-white/90 transition-all duration-200 shadow-lg hover:-translate-y-0.5"
            >
              Sign Up Today
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/70">
              <Languages className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Bhasantar</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bhasantar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
