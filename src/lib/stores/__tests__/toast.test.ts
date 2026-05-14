import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('toast store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('enqueues a toast item', async () => {
    const { toast } = await import('../toast.svelte.js');
    toast.show({ kind: 'success', message: 'Hello world' });
    expect(toast.items).toHaveLength(1);
    expect(toast.items[0]!.kind).toBe('success');
    expect(toast.items[0]!.message).toBe('Hello world');
  });

  it('dequeues after 5 seconds', async () => {
    const { toast } = await import('../toast.svelte.js');
    const initialLength = toast.items.length;
    toast.show({ kind: 'error', message: 'Error occurred' });
    expect(toast.items).toHaveLength(initialLength + 1);

    vi.advanceTimersByTime(5000);
    expect(toast.items).toHaveLength(initialLength);
  });

  it('dismiss removes by id', async () => {
    const { toast } = await import('../toast.svelte.js');
    const initialLength = toast.items.length;
    toast.show({ kind: 'success', message: 'Dismiss me' });
    const id = toast.items[initialLength]!.id;
    toast.dismiss(id);
    expect(toast.items.find((t) => t.id === id)).toBeUndefined();
  });

  it('supports multiple simultaneous toasts', async () => {
    const { toast } = await import('../toast.svelte.js');
    const initialLength = toast.items.length;
    toast.show({ kind: 'success', message: 'First' });
    toast.show({ kind: 'error', message: 'Second' });
    expect(toast.items).toHaveLength(initialLength + 2);
  });
});
