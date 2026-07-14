'use client';

import { useMemo, useState } from 'react';
import { StatusPill } from '@/components/ui';

function normalizeCategoryName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function dedupeCategories(values: string[]) {
  const seen = new Set<string>();
  return values
    .filter((value) => {
      const normalized = normalizeCategoryName(value);
      const key = normalized.toLowerCase();
      if (!normalized || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(normalizeCategoryName);
}

export function CategoryManager({
  categories,
  onChange,
  label = 'Categories',
  placeholder = 'Type a category and press Add',
  helperText = 'Examples: U9 Boys, U11 Boys, U9 Girls, U11 Girls',
}: {
  categories: string[];
  onChange: (categories: string[]) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
}) {
  const [draft, setDraft] = useState('');

  const normalizedCategories = useMemo(() => dedupeCategories(categories), [categories]);

  function commit(rawValue: string) {
    const parsed = rawValue.split(/\n|,/).map(normalizeCategoryName).filter(Boolean);

    if (!parsed.length) return;

    onChange(dedupeCategories([...normalizedCategories, ...parsed]));
    setDraft('');
  }

  function removeCategory(categoryToRemove: string) {
    onChange(
      normalizedCategories.filter(
        (category) => category.toLowerCase() !== categoryToRemove.toLowerCase(),
      ),
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                commit(draft);
              }
            }}
            placeholder={placeholder}
            className="flex-1"
          />
          <button type="button" onClick={() => commit(draft)} className="secondary-btn sm:shrink-0">
            Add category
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">{helperText}</p>
      </div>

      {normalizedCategories.length ? (
        <div className="flex flex-wrap gap-2">
          {normalizedCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => removeCategory(category)}
              className="inline-flex"
              title="Remove category"
            >
              <StatusPill tone="accent">
                {category}
                <span aria-hidden>✕</span>
              </StatusPill>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-canvas p-4 text-sm text-muted">
          No categories added yet.
        </div>
      )}
    </div>
  );
}
