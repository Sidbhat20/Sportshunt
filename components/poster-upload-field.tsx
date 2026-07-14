'use client';

import { ChangeEvent } from 'react';

export function PosterUploadField({
  value,
  onChange,
  label = 'Tournament poster',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <p className="mt-1 text-xs text-muted">
          Upload an image and preview it before submitting. PNG, JPG, WEBP all work.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Or paste poster URL
        </label>
        <input
          value={value.startsWith('data:image/') ? '' : value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
        />
      </div>

      {value ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-canvas">
          <img src={value} alt="Tournament poster preview" className="h-64 w-full object-cover" />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-canvas p-4 text-sm text-muted">
          Poster preview will appear here.
        </div>
      )}

      {value ? (
        <button type="button" onClick={() => onChange('')} className="secondary-btn">
          Remove poster
        </button>
      ) : null}
    </div>
  );
}
