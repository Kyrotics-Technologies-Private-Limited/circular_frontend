import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Languages, Copy, Check, Trash2, Loader2, Sparkles } from 'lucide-react';
import DOMPurify from 'dompurify';
import { quickTranslate, getSupportedLanguages } from '../services/translation.service';
import { LanguageOption } from '../types/Translation';

const MAX_QUICK_CHARS = 60000;

const TypewriterResult = ({ content }: { content: string }) => {
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayed('');
    setIsTyping(true);
    if (!content) {
      setIsTyping(false);
      return;
    }
    
    let index = 0;
    const timer = setInterval(() => {
      // Fast-forward through HTML tags so they don't break rendering
      while (index < content.length && content.charAt(index) === '<') {
        const closeIdx = content.indexOf('>', index);
        if (closeIdx !== -1) {
          index = closeIdx + 1;
        } else {
          index++;
        }
      }
      
      if (index < content.length) {
        index++;
        // Skip through HTML entities (e.g. &nbsp;)
        if (content.charAt(index - 1) === '&') {
          const semiIdx = content.indexOf(';', index);
          if (semiIdx !== -1 && semiIdx - index < 10) {
            index = semiIdx + 1;
          }
        }
      }
      
      setDisplayed(content.substring(0, index));
      
      if (index >= content.length) {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 15); // Smooth, classy speed
    
    return () => clearInterval(timer);
  }, [content]);

  // We append a pulsing cursor directly into the HTML string.
  // `content` is already DOMPurify-sanitized upstream; the cursor span is static & safe.
  const finalHtml = displayed + (isTyping ? '<span class="w-1.5 h-4 bg-primary inline-block ml-1 animate-pulse align-middle rounded-sm"></span>' : '');

  return (
    <div 
      className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" 
      dangerouslySetInnerHTML={{ __html: finalHtml }} 
    />
  );
};

const QuickTranslatePage: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('bn');
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestSeq = useRef(0);
  const activeController = useRef<AbortController | null>(null);

  // Sanitize once per result as defense-in-depth for dangerouslySetInnerHTML
  const sanitizedTranslated = useMemo(
    () => (translatedText ? DOMPurify.sanitize(translatedText) : ''),
    [translatedText]
  );

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const langs = await getSupportedLanguages();
        if (langs && langs.length > 0) {
          setLanguages(langs);
          const hasBn = langs.find((l) => l.code === 'bn');
          if (hasBn) setTargetLanguage('bn');
          else setTargetLanguage(langs[0].code);
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };
    fetchLanguages();

    // Abort any in-flight request on unmount
    return () => {
      if (activeController.current) {
        activeController.current.abort();
      }
    };
  }, []);

  const performTranslate = async (text: string, lang: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      requestSeq.current += 1;
      setTranslatedText('');
      setError(null);
      setIsLoading(false);
      return;
    }

    if (trimmed.length > MAX_QUICK_CHARS) {
      requestSeq.current += 1;
      setError(`Text exceeds the ${MAX_QUICK_CHARS.toLocaleString()} character limit for quick translation.`);
      setTranslatedText('');
      setIsLoading(false);
      return;
    }

    const seq = requestSeq.current + 1;
    requestSeq.current = seq;

    // Cancel any in-flight request so a stale response can't overwrite a newer one
    if (activeController.current) {
      activeController.current.abort();
    }
    const controller = new AbortController();
    activeController.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await quickTranslate(trimmed, lang, controller.signal);
      if (seq !== requestSeq.current) return; // stale response — ignore
      setTranslatedText(response.translatedContent || '');
    } catch (err) {
      const error = err as { code?: string; response?: { data?: { message?: string } } };
      if (error?.code === 'ERR_CANCELED') return; // superseded by a newer request
      if (seq !== requestSeq.current) return;
      setTranslatedText('');
      setError(error?.response?.data?.message || 'Failed to translate. Please try again.');
    } finally {
      if (seq === requestSeq.current) {
        setIsLoading(false);
        activeController.current = null;
      }
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setSourceText(newText);

    // Cancel any in-flight request for the previous text
    requestSeq.current += 1;
    if (activeController.current) {
      activeController.current.abort();
    }
    setIsLoading(false);

    if (!newText.trim()) {
      setTranslatedText('');
      setError(null);
      return;
    }

    // Source changed — clear the old translation so it can't be mistaken for a fresh one
    setTranslatedText('');
    setError(null);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setTargetLanguage(newLang);

    // Cancel any in-flight request for the old language
    requestSeq.current += 1;
    if (activeController.current) {
      activeController.current.abort();
    }
    setIsLoading(false);
    setTranslatedText('');
    setError(null);
  };

  const handleTranslateClick = () => {
    if (sourceText.trim()) {
      performTranslate(sourceText, targetLanguage);
    }
  };

  const handleCopy = () => {
    if (!sanitizedTranslated) return;
    // Decode HTML entities and strip tags for a clean clipboard payload
    const plainText = new DOMParser()
      .parseFromString(sanitizedTranslated, 'text/html')
      .body.textContent?.trim() || '';
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    requestSeq.current += 1;
    if (activeController.current) {
      activeController.current.abort();
    }
    setSourceText('');
    setTranslatedText('');
    setError(null);
    setIsLoading(false);
  };

  const overLimit = sourceText.trim().length > MAX_QUICK_CHARS;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/70 shadow-md">
            <Languages className="h-6 w-6 text-primary-foreground" />
          </div>
          Quick Translate
        </h1>
        <p className="text-muted-foreground mt-2 ml-[60px]">
          Instantly translate text snippets using our lightweight model.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span className="leading-relaxed">{error}</span>
          <button
            onClick={() => performTranslate(sourceText, targetLanguage)}
            className="shrink-0 rounded-lg border border-destructive/40 px-3 py-1 font-medium hover:bg-destructive/10 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        {/* Source Text Pane */}
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-foreground">Source Text (Auto-detect)</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleTranslateClick}
                disabled={!sourceText.trim() || isLoading || overLimit}
                className="p-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isLoading ? 'Translating…' : 'Translate'}
              </button>
              <button 
                onClick={handleClear}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                disabled={!sourceText}
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={sourceText}
            onChange={handleSourceChange}
            placeholder="Type or paste your text here to translate..."
            className="flex-1 w-full p-6 text-lg bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-foreground placeholder:text-muted-foreground/60"
            spellCheck="false"
          />
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <span className={overLimit ? 'font-semibold text-destructive' : ''}>
              {sourceText.length.toLocaleString()} / {MAX_QUICK_CHARS.toLocaleString()} chars
            </span>
            {overLimit && <span>Text too long — use document translation instead.</span>}
          </div>
        </div>

        {/* Translation Pane */}
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md relative">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
            <div className="flex items-center gap-3">
              <select
                value={targetLanguage}
                onChange={handleLanguageChange}
                className="font-semibold text-foreground bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer appearance-none outline-none py-1 pr-6"
              >
                {languages.length > 0 ? (
                  languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-background text-foreground font-normal">
                      {lang.name}
                    </option>
                  ))
                ) : (
                  <option value="bn" className="bg-background text-foreground font-normal">Bengali</option>
                )}
              </select>
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>
            <button 
              onClick={handleCopy}
              disabled={!sanitizedTranslated}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? <span className="text-emerald-500">Copied!</span> : <span>Copy</span>}
            </button>
          </div>
          
          <div className="flex-1 w-full p-6 text-lg text-foreground bg-transparent overflow-y-auto relative">
            {isLoading && !sanitizedTranslated ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/70">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm italic">Translating…</span>
              </div>
            ) : sanitizedTranslated ? (
              <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
                <TypewriterResult content={sanitizedTranslated} />
              </div>
            ) : (
              <p className="text-muted-foreground/50 italic">Translation will appear here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTranslatePage;