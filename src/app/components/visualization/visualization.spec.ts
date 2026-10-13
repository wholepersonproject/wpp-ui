import { TestBed } from '@angular/core/testing';
import embed, { EmbedOptions, Result } from 'vega-embed';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Visualization } from './visualization';

vi.mock('vega-embed', () => ({ default: vi.fn() }));

const url = 'assets/chart.vl.json';

/** Lets pending promise callbacks run before assertions */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
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

  beforeEach(() => {
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
