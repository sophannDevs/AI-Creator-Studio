'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, Copy, Check, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/components/providers/auth-provider';
import { ProtectedRoute } from '@/components/routing/protected-route';
import { generateScript, getScriptByIdeaId, type ScriptResponse } from '@/lib/api/script';
import { listProjects } from '@/lib/api/projects';
import { findVideoIdeaAcrossProjects } from '@/lib/api/ideas';
import { toApiError } from '@/lib/api/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

const TONE_OPTIONS = ['Beginner friendly', 'Professional', 'Casual', 'Educational', 'Entertaining'];
const DURATION_OPTIONS = ['3 minutes', '5 minutes', '8 minutes', '10 minutes', '15 minutes'];
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'Korean', 'Japanese', 'Chinese'];

export default function IdeaScriptPage() {
  const params = useParams<{ id: string }>();
  const ideaId = params.id;

  const { token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [ideaTitle, setIdeaTitle] = useState<string | null>(null);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [duration, setDuration] = useState(DURATION_OPTIONS[1]);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0]);

  const [result, setResult] = useState<ScriptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyScript = () => {
    if (!result) return;
    const text = [
      `HOOK\n${result.hook}`,
      `INTRO\n${result.intro}`,
      `MAIN CONTENT\n${result.mainContent}`,
      `CONCLUSION\n${result.conclusion}`,
      `CTA\n${result.cta}`,
      `Duration: ${result.duration ?? 'Not set'}`,
      `Tone: ${result.tone ?? 'Not set'}`,
    ].join('\n\n');
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const loadData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [projects, existingScript] = await Promise.allSettled([
        listProjects(token).then(async (allProjects) => {
          const match = await findVideoIdeaAcrossProjects(
            token,
            allProjects.map((p) => p.id),
            ideaId,
          );
          return match?.idea.title ?? null;
        }),
        getScriptByIdeaId(token, ideaId).catch((e) => {
          const err = toApiError(e);
          if (err.status === 404) return null;
          throw e;
        }),
      ]);

      if (projects.status === 'fulfilled') setIdeaTitle(projects.value);
      if (existingScript.status === 'fulfilled') setResult(existingScript.value);
      if (existingScript.status === 'rejected') {
        const err = toApiError(existingScript.reason);
        setError(err.message);
      }
    } catch (rawError) {
      setError(toApiError(rawError).message);
    } finally {
      setIsLoading(false);
    }
  }, [token, ideaId]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isAuthLoading, loadData]);

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) { setError('Your session has expired. Please login again.'); return; }

    setError(null);
    setSuccess(null);
    setIsGenerating(true);

    try {
      const data = await generateScript(token, {
        videoIdeaId: ideaId,
        duration,
        tone,
        language,
      });
      setResult(data);
      setSuccess('Script generated and saved.');
    } catch (rawError) {
      setError(toApiError(rawError).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8 py-4">

          {/* Back link */}
          <Link
            href={`/ideas/${ideaId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to idea detail
          </Link>

          {/* Hero */}
          <div className="space-y-3 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3" />
              Script Generator
            </span>
            <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              AI Script Generator
            </h1>
            <p className="mx-auto max-w-md text-base text-muted-foreground">
              Generate a full script for your video idea — hook, intro, main content, and CTA.
            </p>
          </div>

          {/* Input card */}
          <form onSubmit={handleGenerate} className="mx-auto max-w-2xl">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              {/* Idea context */}
              <div className="mb-5 rounded-xl border border-dashed bg-muted/30 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Idea
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {isLoading ? 'Loading idea...' : (ideaTitle ?? 'Your video idea')}
                </p>
              </div>

              {/* Pill chip selectors */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  disabled={isGenerating}
                  className="cursor-pointer appearance-none rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  {TONE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>

                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={isGenerating}
                  className="cursor-pointer appearance-none rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  {DURATION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isGenerating}
                  className="cursor-pointer appearance-none rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  {LANGUAGE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Generate button */}
              <button
                type="submit"
                disabled={isGenerating || isLoading}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500 bg-transparent px-6 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30 disabled:pointer-events-none disabled:opacity-50"
              >
                <Sparkles className="size-4" />
                {isGenerating ? 'Generating script...' : 'Generate Script'}
              </button>
            </div>
          </form>

          {/* Status alerts */}
          <div className="mx-auto max-w-2xl space-y-3">
            {isGenerating && (
              <Alert>
                <AlertDescription>Generating your script...</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Result */}
          {!isLoading && result && (
            <div className="mx-auto max-w-2xl">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Generated Script</h2>
                    <button
                      type="button"
                      onClick={copyScript}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3.5 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <dl className="mt-4 space-y-4 text-sm">
                    {[
                      { label: 'Hook', value: result.hook },
                      { label: 'Intro', value: result.intro },
                      { label: 'Main Content', value: result.mainContent },
                      { label: 'Conclusion', value: result.conclusion },
                      { label: 'CTA', value: result.cta },
                      { label: 'Duration', value: result.duration ?? 'Not set' },
                      { label: 'Tone', value: result.tone ?? 'Not set' },
                    ].map((row) => (
                      <div key={row.label} className="space-y-1">
                        <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {row.label}
                        </dt>
                        <dd className="text-foreground">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !result && !error && (
            <p className="text-center text-sm text-muted-foreground">
              Select your options and click Generate Script to get started.
            </p>
          )}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
