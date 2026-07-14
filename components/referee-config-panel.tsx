'use client';

import type { RefereeConfig } from '@/types';

export function RefereeConfigPanel({
  config,
  onChange,
  locked,
}: {
  config: RefereeConfig;
  onChange: (next: RefereeConfig) => void;
  locked: boolean;
}) {
  if (config.kind === 'racket') {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <OptionGroup
          label="Number of sets"
          options={[3, 5]}
          value={config.sets}
          onSelect={(value) => onChange({ ...config, sets: value as 3 | 5 })}
          disabled={locked}
        />
        <NumberInput
          label="Points to win a set"
          value={config.pointsToWin}
          min={1}
          onChange={(value) => onChange({ ...config, pointsToWin: value })}
          disabled={locked}
        />
        <OptionGroup
          label="Win condition"
          options={[
            { value: 'deuce', label: 'Deuce' },
            { value: 'golden_point', label: 'Golden point' },
          ]}
          value={config.winCondition}
          onSelect={(value) =>
            onChange({ ...config, winCondition: value as 'deuce' | 'golden_point' })
          }
          disabled={locked}
        />
        <OptionGroup
          label="Match timer"
          options={[
            { value: 'off', label: 'Optional / off' },
            { value: 'on', label: 'Enabled' },
          ]}
          value={config.timerEnabled ? 'on' : 'off'}
          onSelect={(value) => onChange({ ...config, timerEnabled: value === 'on' })}
          disabled={locked}
        />
      </div>
    );
  }

  if (config.kind === 'tennis') {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <OptionGroup
          label="Sets"
          options={[3, 5]}
          value={config.sets}
          onSelect={(value) => onChange({ ...config, sets: value as 3 | 5 })}
          disabled={locked}
        />
        <OptionGroup
          label="Tie-break"
          options={[
            { value: 'on', label: 'ON' },
            { value: 'off', label: 'OFF' },
          ]}
          value={config.tieBreak ? 'on' : 'off'}
          onSelect={(value) => onChange({ ...config, tieBreak: value === 'on' })}
          disabled={locked}
        />
        <OptionGroup
          label="Match timer"
          options={[
            { value: 'off', label: 'Optional / off' },
            { value: 'on', label: 'Enabled' },
          ]}
          value={config.timerEnabled ? 'on' : 'off'}
          onSelect={(value) => onChange({ ...config, timerEnabled: value === 'on' })}
          disabled={locked}
        />
      </div>
    );
  }

  if (config.kind === 'basketball') {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <OptionGroup
          label="Quarters"
          options={[4]}
          value={config.quarters}
          onSelect={() => {}}
          disabled
        />
        <OptionGroup
          label="Minutes / quarter"
          options={[10, 12]}
          value={config.minutesPerQuarter}
          onSelect={(value) => onChange({ ...config, minutesPerQuarter: value as number })}
          disabled={locked}
        />
        <OptionGroup
          label="Shot clock"
          options={[
            { value: 'off', label: 'OFF' },
            { value: '24', label: '24 sec' },
            { value: '14', label: '14 sec' },
          ]}
          value={config.shotClock}
          onSelect={(value) => onChange({ ...config, shotClock: value as 'off' | '24' | '14' })}
          disabled={locked}
        />
      </div>
    );
  }

  if (config.kind === 'football') {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <OptionGroup
          label="Match duration"
          options={[60, 90, 120]}
          value={config.matchMinutes}
          onSelect={(value) => onChange({ ...config, matchMinutes: value as number })}
          disabled={locked}
        />
        <OptionGroup
          label="Extra time"
          options={[
            { value: 'off', label: 'OFF' },
            { value: 'on', label: 'ON' },
          ]}
          value={config.extraTime ? 'on' : 'off'}
          onSelect={(value) => onChange({ ...config, extraTime: value === 'on' })}
          disabled={locked}
        />
        <OptionGroup
          label="Injury time"
          options={[0, 1, 2, 3, 4, 5, 10]}
          value={config.injuryTime}
          onSelect={(value) => onChange({ ...config, injuryTime: value as number })}
          disabled={locked}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <OptionGroup
        label="Quarters"
        options={[4]}
        value={config.quarters}
        onSelect={() => {}}
        disabled
      />
      <OptionGroup
        label="Minutes / quarter"
        options={[10, 12, 15]}
        value={config.minutesPerQuarter}
        onSelect={(value) => onChange({ ...config, minutesPerQuarter: value as number })}
        disabled={locked}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Math.max(min, Number(event.target.value) || min))}
        disabled={disabled}
      />
    </div>
  );
}

function OptionGroup({
  label,
  options,
  value,
  onSelect,
  disabled = false,
}: {
  label: string;
  options: Array<number | { value: string; label: string }>;
  value: string | number;
  onSelect: (value: string | number) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const optionValue = typeof option === 'number' ? option : option.value;
          const optionLabel = typeof option === 'number' ? option : option.label;
          const active = value === optionValue;
          return (
            <button
              key={String(optionValue)}
              onClick={() => onSelect(optionValue)}
              disabled={disabled}
              className={active ? 'primary-btn' : 'secondary-btn'}
              type="button"
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
