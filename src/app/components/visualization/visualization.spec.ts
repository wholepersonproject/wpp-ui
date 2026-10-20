import { TestBed } from '@angular/core/testing';
import embed, { EmbedOptions, Result } from 'vega-embed';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Visualization } from './visualization';

vi.mock('vega-embed', () => ({ default: vi.fn() }));

const url = 'assets/chart.vl.json';

/** Lets pending promise callbacks run before assertions */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

/** Fake dark mode media query whose `change` listeners the tests can fire */
function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches,
    addEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.delete(listener),
    ),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => query),
  );
  const change = (isDark: boolean) =>
    listeners.forEach((listener) => listener({ matches: isDark } as MediaQueryListEvent));
  return { query, listeners, change };
}

/** Creates the component and waits for vega-embed to be called */
async function setup() {
  await TestBed.configureTestingModule({ imports: [Visualization] }).compileComponents();
  const fixture = TestBed.createComponent(Visualization);
  fixture.componentRef.setInput('url', url);
  fixture.detectChanges();
  await vi.waitFor(() => expect(embed).toHaveBeenCalled());
  const [chart, spec, options] = vi.mocked(embed).mock.lastCall as [HTMLElement, string, EmbedOptions];
  return { fixture, chart, spec, options };
}

describe('Visualization', () => {
  const finalize = vi.fn();

  let darkMode: ReturnType<typeof stubMatchMedia>;

  beforeEach(() => {
    darkMode = stubMatchMedia(false);
    finalize.mockReset();
    vi.mocked(embed).mockReset();
    vi.mocked(embed).mockResolvedValue({ finalize } as unknown as Result);
  });

  it('embeds the spec with a canvas renderer', async () => {
    const { chart, spec, options } = await setup();

    expect(chart).toHaveClass('content-page-visualization');
    expect(spec).toBe(url);
    expect(options.renderer).toBe('canvas');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('colors the chart from the theme tokens', async () => {
    const { options } = await setup();

    const config = options.config as { background: string };

    expect(config).toEqual({
      background: expect.any(String),
      title: { color: expect.any(String) },
      axis: {
        titleColor: expect.any(String),
        labelColor: expect.any(String),
        domainColor: expect.any(String),
        tickColor: expect.any(String),
        gridColor: expect.any(String),
      },
      legend: {
        titleColor: expect.any(String),
        labelColor: expect.any(String),
        symbolFillColor: config.background,
      },
    });
  });

  it('removes the elements used to resolve theme colors', async () => {
    const { chart } = await setup();

    expect(chart).toBeEmptyDOMElement();
  });

  it('re-embeds the chart when the color scheme changes', async () => {
    await setup();
    await flushPromises();

    darkMode.change(true);
    TestBed.tick();
    await vi.waitFor(() => expect(embed).toHaveBeenCalledTimes(2));

    expect(finalize).toHaveBeenCalledTimes(1);
  });

  it('stops listening for color scheme changes when destroyed', async () => {
    const { fixture } = await setup();

    fixture.destroy();

    expect(darkMode.listeners.size).toBe(0);
  });

  it('renders input controls outside the aspect-ratio chart box', async () => {
    const { chart, options } = await setup();
    const bindings = options.bind as HTMLElement;

    expect(bindings).toHaveClass('content-page-visualization-bindings');
    expect(chart).not.toContainElement(bindings);
  });

  it('finalizes the view when destroyed', async () => {
    const { fixture } = await setup();
    await flushPromises();

    fixture.destroy();

    expect(finalize).toHaveBeenCalledTimes(1);
  });

  it('finalizes the view when destroyed before embedding completes', async () => {
    let resolveEmbed!: (result: Result) => void;
    vi.mocked(embed).mockReturnValue(new Promise((resolve) => (resolveEmbed = resolve)));
    const { fixture } = await setup();

    fixture.destroy();
    resolveEmbed({ finalize } as unknown as Result);
    await flushPromises();

    expect(finalize).toHaveBeenCalledTimes(1);
  });
});
