'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Corp } from '@/types';

interface Props {
  onSelect: (corp: Corp) => void;
}

export default function SearchCompany({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Corp[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Corp | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults(json.results ?? []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (corp: Corp) => {
    setSelected(corp);
    setQuery(corp.corpName);
    setOpen(false);
    onSelect(corp);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="flex items-center gap-2 bg-white border-2 border-blue-200 rounded-2xl px-4 py-3 shadow-md focus-within:border-blue-500 transition-colors">
        <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="회사명, 종목코드로 검색하세요"
          className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-base bg-transparent"
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        )}
        {(query || selected) && !loading && (
          <button onClick={handleClear} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {selected && (
        <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
          <span className="text-sm text-blue-700 font-medium">선택됨:</span>
          <span className="text-sm text-gray-800 font-semibold">{selected.corpName}</span>
          {selected.stockCode && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {selected.stockCode}
            </span>
          )}
          <span className="ml-auto text-xs text-gray-400 font-mono">corp_code: {selected.corpCode}</span>
        </div>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {results.map((corp) => (
            <li
              key={corp.corpCode}
              onMouseDown={() => handleSelect(corp)}
              className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">{corp.corpName}</p>
                <p className="text-xs text-gray-400">{corp.corpEngName}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {corp.stockCode && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">
                    {corp.stockCode}
                  </span>
                )}
                <span className="text-xs text-gray-300 font-mono">{corp.corpCode}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && results.length === 0 && query.trim().length > 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 text-center text-sm text-gray-400">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
