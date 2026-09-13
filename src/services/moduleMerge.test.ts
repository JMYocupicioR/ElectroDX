import { describe, it, expect } from 'vitest';
import { resolveModuleId, getMergedModuleById } from './moduleMerge';

describe('resolveModuleId', () => {
  it('resolves exact canonical module IDs', () => {
    expect(resolveModuleId('fundamentals')).toBe('fundamentals');
    expect(resolveModuleId('nerve-conduction')).toBe('nerve-conduction');
    expect(resolveModuleId('diagnostic-criteria')).toBe('diagnostic-criteria');
    expect(resolveModuleId('safety-qc')).toBe('safety-qc');
  });

  it('resolves filename-style and hyphenated slugs', () => {
    expect(resolveModuleId('modulo-01-fundamentals')).toBe('fundamentals');
    expect(resolveModuleId('module-01-fundamentals')).toBe('fundamentals');
    expect(resolveModuleId('modulo-1-fundamentals')).toBe('fundamentals');
    expect(resolveModuleId('modulo-10-diagnostic-criteria')).toBe('diagnostic-criteria');
    expect(resolveModuleId('module-10-diagnostic-criteria')).toBe('diagnostic-criteria');
    expect(resolveModuleId('modulo-08-topographic-anatomy')).toBe('topographic-anatomy');
  });

  it('resolves Spanish slug aliases', () => {
    expect(resolveModuleId('01-fundamentos')).toBe('fundamentals');
    expect(resolveModuleId('fundamentos')).toBe('fundamentals');
    expect(resolveModuleId('fundamentos-biofisicos')).toBe('fundamentals');
    expect(resolveModuleId('criterios-diagnosticos')).toBe('diagnostic-criteria');
    expect(resolveModuleId('conduccion-nerviosa')).toBe('nerve-conduction');
    expect(resolveModuleId('potenciales-evocados')).toBe('evoked-potentials');
  });

  it('resolves numbers as string or prefixed numbers', () => {
    expect(resolveModuleId('1')).toBe('fundamentals');
    expect(resolveModuleId('01')).toBe('fundamentals');
    expect(resolveModuleId('modulo-1')).toBe('fundamentals');
    expect(resolveModuleId('modulo-01')).toBe('fundamentals');
    expect(resolveModuleId('10')).toBe('diagnostic-criteria');
    expect(resolveModuleId('modulo-10')).toBe('diagnostic-criteria');
    expect(resolveModuleId('13')).toBe('safety-qc');
  });

  it('resolves legacy cross-referenced IDs', () => {
    expect(resolveModuleId('modulo-07-brachial-plexus')).toBe('topographic-anatomy');
    expect(resolveModuleId('brachial-plexus')).toBe('topographic-anatomy');
  });

  it('returns undefined for invalid or empty inputs', () => {
    expect(resolveModuleId('')).toBeUndefined();
    expect(resolveModuleId(null)).toBeUndefined();
    expect(resolveModuleId(undefined)).toBeUndefined();
    expect(resolveModuleId('non-existent-module-xyz-999')).toBeUndefined();
  });
});

describe('getMergedModuleById', () => {
  it('retrieves module using alias input like modulo-01-fundamentals', () => {
    const mod = getMergedModuleById('modulo-01-fundamentals');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('fundamentals');
    expect(mod?.number).toBe(1);
    expect(mod?.title).toContain('Fundamentos');
  });

  it('retrieves module using numeric ID 1', () => {
    const mod = getMergedModuleById('1');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('fundamentals');
  });

  it('retrieves module 10 using alias modulo-10-diagnostic-criteria', () => {
    const mod = getMergedModuleById('modulo-10-diagnostic-criteria');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('diagnostic-criteria');
    expect(mod?.number).toBe(10);
  });
});
