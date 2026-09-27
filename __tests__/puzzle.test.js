'use strict';

/**
 * Test suite for the Monday-level puzzle (monday-level-screen spec).
 *
 * Strategy:
 *  1. Extract the <script> block from index.html.
 *  2. Build a minimal DOM in JSDOM.
 *  3. Set window.__TESTING__ = true before eval()ing the script.
 *  4. Manually fire 'DOMContentLoaded' so initPuzzle() registers its event listeners.
 *  5. Each test that needs a clean PuzzleState resets it directly.
 *
 * Property-based tests use fast-check (fc) with ≥ 100 runs each.
 */

const fs   = require('fs');
const path = require('path');
const fc   = require('fast-check');

// ─── Load & parse the puzzle script from index.html ────────────────────────

const HTML_PATH   = path.resolve(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');

/** Extract the largest non-Tailwind <script> block from the HTML. */
function extractPuzzleScript(html) {
  const regex = /<script>([\s\S]*?)<\/script>/gi;
  let best = '';
  let m;
  while ((m = regex.exec(html)) !== null) {
    const body = m[1];
    if (!body.includes('tailwind.config') && body.trim().length > best.length) {
      best = body;
    }
  }
  return best;
}

const puzzleScript = extractPuzzleScript(htmlContent);

// ─── Minimal DOM markup ─────────────────────────────────────────────────────

const MINIMAL_DOM = `
  <span id="credits-display">000</span>
  <div id="assembly-area" role="list"></div>
  <div id="error-message" class="hidden"></div>
  <button id="validate-btn">Validar Solución</button>
  <div id="modal-exito" class="hidden">
    <div id="modal-exito-backdrop"></div>
    <button id="next-level-btn">Ir al nivel del Martes</button>
  </div>
  <div id="active-day-stripe">
    <span id="active-day-name">LUNES</span>
    <span id="active-day-date">1/1</span>
  </div>
  ${[0,1,2,3,4,5,6].map(i =>
    `<div id="day-bar-${i}" class="day-bar"></div><span id="day-label-${i}"></span>`
  ).join('\n  ')}
  <div id="tuesday-locked"></div>
  <div id="tuesday-unlocked" class="hidden"></div>
  <div id="hook-console"></div>
  <div id="tuesday-error-message" class="hidden"></div>
  <div id="modal-martes" class="hidden">
    <div id="modal-martes-backdrop"></div>
    <button id="summary-btn"></button>
  </div>
  <div id="modal-exito-backdrop"></div>

  <div id="assembly-area-miercoles" role="list"></div>
  <div id="error-message-miercoles" class="hidden"></div>
  <button id="validate-btn-miercoles">Validar Solución</button>
  <div id="modal-miercoles" class="hidden">
    <div id="modal-miercoles-backdrop"></div>
    <button id="next-level-btn-miercoles"></button>
  </div>

  <div id="assembly-area-jueves" role="list"></div>
  <div id="error-message-jueves" class="hidden"></div>
  <button id="validate-btn-jueves">Validar Solución</button>
  <div id="modal-jueves" class="hidden">
    <div id="modal-jueves-backdrop"></div>
    <button id="next-level-btn-jueves"></button>
  </div>

  <div id="assembly-area-viernes" role="list"></div>
  <div id="error-message-viernes" class="hidden"></div>
  <button id="validate-btn-viernes">Validar Solución</button>
  <div id="modal-viernes" class="hidden">
    <div id="modal-viernes-backdrop"></div>
    <button id="next-level-btn-viernes"></button>
  </div>

  <div id="assembly-area-sabado" role="list"></div>
  <div id="error-message-sabado" class="hidden"></div>
  <button id="validate-btn-sabado">Validar Solución</button>
  <div id="modal-sabado" class="hidden">
    <div id="modal-sabado-backdrop"></div>
    <button id="next-level-btn-sabado"></button>
  </div>

  <div id="assembly-area-domingo" role="list"></div>
  <div id="error-message-domingo" class="hidden"></div>
  <button id="validate-btn-domingo">Validar Solución</button>
  <div id="modal-domingo" class="hidden">
    <div id="modal-domingo-backdrop"></div>
    <button id="finish-btn-domingo"></button>
  </div>
`;

// ─── Bootstrap ─────────────────────────────────────────────────────────────

/**
 * Evaluate the puzzle script in the current JSDOM window with __TESTING__ = true.
 * Fires DOMContentLoaded after eval so initPuzzle() and all listeners are set up.
 */
function bootstrapPuzzle() {
  document.body.innerHTML = MINIMAL_DOM;

  // Flag must be set BEFORE the script runs
  window.__TESTING__ = true;

  // Clean up any leftover state
  delete window.PuzzleModule;

  // Reset globalCredits by removing the module-level variable via eval
  // (it will be re-declared when the script re-runs)
  // eval the puzzle script in the global (window) scope
  // eslint-disable-next-line no-eval
  eval.call(window, puzzleScript);

  // Fire DOMContentLoaded manually so initPuzzle() runs and registers listeners
  const evt = document.createEvent('Event');
  evt.initEvent('DOMContentLoaded', true, true);
  document.dispatchEvent(evt);
}

// Run once before all tests
beforeAll(() => {
  bootstrapPuzzle();
});

/** Shortcut that always returns the live PuzzleModule reference. */
const pm = () => window.PuzzleModule;

/** Reset puzzle state to a known baseline. */
function resetState() {
  const { PuzzleState, CORRECT_SEQUENCE } = pm();
  PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
  PuzzleState.selectedIndex = null;

  // Hide error / modal
  const errorEl = document.getElementById('error-message');
  if (errorEl) errorEl.classList.add('hidden');
  const modal = document.getElementById('modal-exito');
  if (modal) modal.classList.add('hidden');
}

// ══════════════════════════════════════════════════════════════════════════
// UNIT TESTS — smoke / example-based
// ══════════════════════════════════════════════════════════════════════════

describe('PuzzleModule availability', () => {
  test('window.PuzzleModule is exposed under __TESTING__', () => {
    expect(window.PuzzleModule).toBeDefined();
  });

  test('exports all expected members', () => {
    const {
      shuffleBlocks, validateSolution, swapBlocks, handleBlockClick,
      PuzzleState, CORRECT_SEQUENCE, CREDITS_REWARD, getDayName, formatDate,
    } = pm();
    expect(typeof shuffleBlocks).toBe('function');
    expect(typeof validateSolution).toBe('function');
    expect(typeof swapBlocks).toBe('function');
    expect(typeof handleBlockClick).toBe('function');
    expect(typeof getDayName).toBe('function');
    expect(typeof formatDate).toBe('function');
    expect(Array.isArray(CORRECT_SEQUENCE)).toBe(true);
    expect(typeof CREDITS_REWARD).toBe('number');
    expect(PuzzleState).toBeDefined();
  });
});

describe('CORRECT_SEQUENCE', () => {
  test('has exactly 4 blocks with the expected ids', () => {
    const { CORRECT_SEQUENCE } = pm();
    expect(CORRECT_SEQUENCE).toHaveLength(4);
    expect(CORRECT_SEQUENCE.map(b => b.id)).toEqual(['block-1', 'block-2', 'block-3', 'block-4']);
  });

  test('has the expected labels', () => {
    const labels = pm().CORRECT_SEQUENCE.map(b => b.label);
    expect(labels).toContain('Definición de Requisitos');
    expect(labels).toContain('Diseño Técnico');
    expect(labels).toContain('Planificación de Implementación');
    expect(labels).toContain('Despliegue');
  });

  test('CREDITS_REWARD is 250', () => {
    expect(pm().CREDITS_REWARD).toBe(250);
  });
});

describe('shuffleBlocks — unit tests', () => {
  test('returns an array of length 4', () => {
    expect(pm().shuffleBlocks(pm().CORRECT_SEQUENCE)).toHaveLength(4);
  });

  test('does not mutate the input array', () => {
    const snap = pm().CORRECT_SEQUENCE.map(b => b.id);
    pm().shuffleBlocks(pm().CORRECT_SEQUENCE);
    expect(pm().CORRECT_SEQUENCE.map(b => b.id)).toEqual(snap);
  });

  test('result contains the same ids (permutation)', () => {
    const result = pm().shuffleBlocks(pm().CORRECT_SEQUENCE);
    expect(result.map(b => b.id).sort()).toEqual(pm().CORRECT_SEQUENCE.map(b => b.id).sort());
  });

  test('handles empty array', () => {
    expect(pm().shuffleBlocks([])).toEqual([]);
  });
});

describe('validateSolution — unit tests', () => {
  afterEach(resetState);

  test('returns true when blocks match CORRECT_SEQUENCE', () => {
    pm().PuzzleState.blocks = pm().CORRECT_SEQUENCE.map(b => ({ ...b }));
    expect(pm().validateSolution()).toBe(true);
  });

  test('returns false when blocks are in reversed order', () => {
    pm().PuzzleState.blocks = [...pm().CORRECT_SEQUENCE].reverse().map(b => ({ ...b }));
    expect(pm().validateSolution()).toBe(false);
  });

  test('returns false for a single swap', () => {
    const seq = pm().CORRECT_SEQUENCE.map(b => ({ ...b }));
    [seq[0], seq[1]] = [seq[1], seq[0]];
    pm().PuzzleState.blocks = seq;
    expect(pm().validateSolution()).toBe(false);
  });
});

describe('swapBlocks — unit tests', () => {
  beforeEach(resetState);

  test('swaps two positions correctly', () => {
    const b0 = pm().PuzzleState.blocks[0].id;
    const b2 = pm().PuzzleState.blocks[2].id;
    pm().swapBlocks(0, 2);
    expect(pm().PuzzleState.blocks[0].id).toBe(b2);
    expect(pm().PuzzleState.blocks[2].id).toBe(b0);
  });

  test('leaves other positions unchanged after swap', () => {
    const b1 = pm().PuzzleState.blocks[1].id;
    const b3 = pm().PuzzleState.blocks[3].id;
    pm().swapBlocks(0, 2);
    expect(pm().PuzzleState.blocks[1].id).toBe(b1);
    expect(pm().PuzzleState.blocks[3].id).toBe(b3);
  });

  test('no-op and console.error on out-of-range index', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const before = pm().PuzzleState.blocks.map(b => b.id);
    pm().swapBlocks(0, 10);
    expect(pm().PuzzleState.blocks.map(b => b.id)).toEqual(before);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('handleBlockClick — unit tests', () => {
  beforeEach(resetState);

  test('selects a block when nothing is selected', () => {
    pm().handleBlockClick(1);
    expect(pm().PuzzleState.selectedIndex).toBe(1);
  });

  test('deselects a block when the same block is clicked again', () => {
    pm().PuzzleState.selectedIndex = 2;
    pm().handleBlockClick(2);
    expect(pm().PuzzleState.selectedIndex).toBeNull();
  });

  test('blocks are unchanged after toggle-deselect', () => {
    const before = pm().PuzzleState.blocks.map(b => b.id);
    pm().PuzzleState.selectedIndex = 0;
    pm().handleBlockClick(0);
    expect(pm().PuzzleState.blocks.map(b => b.id)).toEqual(before);
  });

  test('swaps blocks and deselects when a different block is clicked', () => {
    const b0 = pm().PuzzleState.blocks[0].id;
    const b3 = pm().PuzzleState.blocks[3].id;
    pm().PuzzleState.selectedIndex = 0;
    pm().handleBlockClick(3);
    expect(pm().PuzzleState.blocks[0].id).toBe(b3);
    expect(pm().PuzzleState.blocks[3].id).toBe(b0);
    expect(pm().PuzzleState.selectedIndex).toBeNull();
  });
});

describe('showError / hideError — unit tests', () => {
  beforeEach(resetState);

  test('#error-message becomes visible and contains ERROR:: after wrong validation', () => {
    pm().PuzzleState.blocks = [...pm().CORRECT_SEQUENCE].reverse().map(b => ({ ...b }));
    pm().PuzzleState.selectedIndex = null;
    document.getElementById('validate-btn').click();
    const el = document.getElementById('error-message');
    expect(el.classList.contains('hidden')).toBe(false);
    expect(el.textContent).toContain('ERROR::');
  });

  test('#error-message is hidden after a swap', () => {
    // First cause an error
    pm().PuzzleState.blocks = [...pm().CORRECT_SEQUENCE].reverse().map(b => ({ ...b }));
    pm().PuzzleState.selectedIndex = null;
    document.getElementById('validate-btn').click();
    const el = document.getElementById('error-message');
    expect(el.classList.contains('hidden')).toBe(false); // precondition

    // Now swap — select block 0 then click block 1
    pm().PuzzleState.selectedIndex = 0;
    pm().handleBlockClick(1);
    expect(el.classList.contains('hidden')).toBe(true);
  });
});

describe('showSuccess — unit tests', () => {
  beforeEach(resetState);

  test('#modal-exito becomes visible after correct validation', () => {
    pm().PuzzleState.blocks = pm().CORRECT_SEQUENCE.map(b => ({ ...b }));
    pm().PuzzleState.selectedIndex = null;
    document.getElementById('validate-btn').click();
    expect(document.getElementById('modal-exito').classList.contains('hidden')).toBe(false);
    // Reset modal for next tests
    document.getElementById('modal-exito').classList.add('hidden');
  });

  test('#credits-display updates after success', () => {
    window.gameCredits.set(0);
    pm().PuzzleState.blocks = pm().CORRECT_SEQUENCE.map(b => ({ ...b }));
    pm().PuzzleState.selectedIndex = null;
    document.getElementById('validate-btn').click();
    expect(window.gameCredits.get()).toBeGreaterThanOrEqual(250);
    document.getElementById('modal-exito').classList.add('hidden');
  });
});

describe('getDayName — unit tests', () => {
  // Use local date constructor to avoid UTC off-by-one in JSDOM
  test('returns "Lunes" for a Monday (2024-06-03)', () => {
    expect(pm().getDayName(new Date(2024, 5, 3))).toBe('Lunes'); // June 3 2024 — Monday
  });

  test('returns "Domingo" for a Sunday (2024-06-02)', () => {
    expect(pm().getDayName(new Date(2024, 5, 2))).toBe('Domingo'); // June 2 2024 — Sunday
  });

  test('returns "Viernes" for a Friday (2024-06-07)', () => {
    expect(pm().getDayName(new Date(2024, 5, 7))).toBe('Viernes'); // June 7 2024 — Friday
  });

  test('returns all 7 day names correctly', () => {
    const names = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    // Week starting Sun 2024-06-02
    for (let d = 0; d < 7; d++) {
      expect(pm().getDayName(new Date(2024, 5, 2 + d))).toBe(names[d]);
    }
  });
});

describe('formatDate — unit tests', () => {
  // Use local date constructors: new Date(year, month0based, day)
  test('returns "03/6" for June 3rd', () => {
    expect(pm().formatDate(new Date(2024, 5, 3))).toBe('03/6');
  });

  test('returns "15/12" for December 15th', () => {
    expect(pm().formatDate(new Date(2024, 11, 15))).toBe('15/12');
  });

  test('returns "01/1" for January 1st', () => {
    expect(pm().formatDate(new Date(2024, 0, 1))).toBe('01/1');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// PROPERTY-BASED TESTS
// ══════════════════════════════════════════════════════════════════════════

describe('Property 4 — shuffleBlocks produces a valid permutation', () => {
  // Feature: monday-level-screen, Property 4: El shuffle produce siempre una permutación válida
  // Validates: Requirements 7.2
  test('Validates: Requirements 7.2', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { shuffleBlocks, CORRECT_SEQUENCE } = pm();
        const result = shuffleBlocks(CORRECT_SEQUENCE);

        expect(result).toHaveLength(CORRECT_SEQUENCE.length);
        expect(result.map(b => b.id).sort()).toEqual(CORRECT_SEQUENCE.map(b => b.id).sort());
        expect(new Set(result.map(b => b.id)).size).toBe(result.length);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 5 — handleBlockClick implements selection / deselection correctly', () => {
  // Feature: monday-level-screen, Property 5: El click en un bloque implementa la selección y deselección correctamente
  // Validates: Requirements 8.1, 8.3
  test('Validates: Requirements 8.1, 8.3', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 3 }), (i) => {
        const { PuzzleState, CORRECT_SEQUENCE, handleBlockClick } = pm();

        PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
        PuzzleState.selectedIndex = null;

        // Select block i
        handleBlockClick(i);
        expect(PuzzleState.selectedIndex).toBe(i);
        const snapshot = PuzzleState.blocks.map(b => b.id);

        // Deselect same block
        handleBlockClick(i);
        expect(PuzzleState.selectedIndex).toBeNull();
        expect(PuzzleState.blocks.map(b => b.id)).toEqual(snapshot);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 6 — swapBlocks swaps exactly the two indicated positions and deselects', () => {
  // Feature: monday-level-screen, Property 6: El swap intercambia exactamente las posiciones indicadas y deselecciona
  // Validates: Requirements 8.2
  test('Validates: Requirements 8.2', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: 0, max: 3 })
        ).filter(([i, j]) => i !== j),
        ([i, j]) => {
          const { PuzzleState, CORRECT_SEQUENCE, handleBlockClick } = pm();

          PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
          PuzzleState.selectedIndex = i;

          const beforeI = PuzzleState.blocks[i].id;
          const beforeJ = PuzzleState.blocks[j].id;
          const allBefore = PuzzleState.blocks.map(b => b.id);

          handleBlockClick(j);

          expect(PuzzleState.blocks[i].id).toBe(beforeJ);
          expect(PuzzleState.blocks[j].id).toBe(beforeI);

          for (let k = 0; k < 4; k++) {
            if (k !== i && k !== j) {
              expect(PuzzleState.blocks[k].id).toBe(allBefore[k]);
            }
          }
          expect(PuzzleState.selectedIndex).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 7 — blocks are always a valid permutation after any sequence of clicks', () => {
  // Feature: monday-level-screen, Property 7: Los bloques son siempre una permutación válida del conjunto original
  // Validates: Requirements 8.4, 11.2
  test('Validates: Requirements 8.4, 11.2', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 3 }), { minLength: 0, maxLength: 20 }),
        (clicks) => {
          const { PuzzleState, CORRECT_SEQUENCE, handleBlockClick } = pm();

          PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
          PuzzleState.selectedIndex = null;

          for (const idx of clicks) handleBlockClick(idx);

          const ids = PuzzleState.blocks.map(b => b.id).sort();
          expect(ids).toEqual(CORRECT_SEQUENCE.map(b => b.id).sort());
          expect(new Set(ids).size).toBe(4);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 8 — validateSolution is correct for all permutations', () => {
  // Feature: monday-level-screen, Property 8: validateSolution es correcta para toda permutación posible
  // Validates: Requirements 9.3
  test('Validates: Requirements 9.3', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray([0, 1, 2, 3], { minLength: 4, maxLength: 4 }),
        (perm) => {
          const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pm();
          PuzzleState.blocks = perm.map(idx => ({ ...CORRECT_SEQUENCE[idx] }));
          PuzzleState.selectedIndex = null;

          const isCorrect = perm.every((idx, pos) => idx === pos);
          expect(validateSolution()).toBe(isCorrect);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 9 — success increments credits by exactly 250', () => {
  // Feature: monday-level-screen, Property 9: El éxito incrementa los créditos en exactamente 250
  // Validates: Requirements 10.2
  test('Validates: Requirements 10.2', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), (initial) => {
        const { PuzzleState, CORRECT_SEQUENCE } = pm();

        window.gameCredits.set(initial);
        const before = window.gameCredits.get();

        PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
        PuzzleState.selectedIndex = null;

        document.getElementById('validate-btn').click();

        expect(window.gameCredits.get()).toBe(before + 250);

        // Clean up for next iteration
        document.getElementById('modal-exito').classList.add('hidden');
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 3 — credits display reflects exact value assigned', () => {
  // Feature: monday-level-screen, Property 3: El crédito mostrado refleja exactamente el valor asignado
  // Validates: Requirements 4.6
  test('Validates: Requirements 4.6', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000 }), (c) => {
        window.gameCredits.set(c);
        const el = document.getElementById('credits-display');
        // Display pads to ≥3 chars; compare as integer
        expect(parseInt(el.textContent, 10)).toBe(c);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 10 — error is shown for every incorrect permutation', () => {
  // Feature: monday-level-screen, Property 10: El error se muestra para toda permutación incorrecta
  // Validates: Requirements 11.1
  test('Validates: Requirements 11.1', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray([0, 1, 2, 3], { minLength: 4, maxLength: 4 })
          .filter(perm => !perm.every((idx, pos) => idx === pos)),
        (perm) => {
          const { PuzzleState, CORRECT_SEQUENCE } = pm();

          const errorEl = document.getElementById('error-message');
          errorEl.classList.add('hidden');

          PuzzleState.blocks = perm.map(idx => ({ ...CORRECT_SEQUENCE[idx] }));
          PuzzleState.selectedIndex = null;

          document.getElementById('validate-btn').click();

          expect(errorEl.classList.contains('hidden')).toBe(false);
          expect(errorEl.textContent).toContain('ERROR::');
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 11 — error message hides after any swap', () => {
  // Feature: monday-level-screen, Property 11: El mensaje de error se oculta al realizar cualquier swap
  // Validates: Requirements 11.3
  test('Validates: Requirements 11.3', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 0, max: 3 }),
          fc.integer({ min: 0, max: 3 })
        ).filter(([i, j]) => i !== j),
        ([i, j]) => {
          const { PuzzleState, CORRECT_SEQUENCE } = pm();

          // Start from an incorrect order
          PuzzleState.blocks = [...CORRECT_SEQUENCE].reverse().map(b => ({ ...b }));
          PuzzleState.selectedIndex = null;

          // Show the error
          document.getElementById('validate-btn').click();
          const errorEl = document.getElementById('error-message');
          // Precondition: error must be visible (reversed != correct)
          expect(errorEl.classList.contains('hidden')).toBe(false);

          // Perform swap
          PuzzleState.selectedIndex = i;
          pm().handleBlockClick(j);

          expect(errorEl.classList.contains('hidden')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 1 — date display matches device date', () => {
  // Feature: monday-level-screen, Property 1: La visualización de fecha coincide con la fecha del dispositivo
  // Validates: Requirements 2.2, 2.3
  test('Validates: Requirements 2.2, 2.3', () => {
    const DAY_NAMES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

    fc.assert(
      fc.property(
        // Use local-date construction to avoid UTC shift issues in JSDOM
        fc.record({
          year:  fc.integer({ min: 2020, max: 2030 }),
          month: fc.integer({ min: 0, max: 11 }),   // 0-based
          day:   fc.integer({ min: 1, max: 28 }),    // safe for all months
        }),
        ({ year, month, day }) => {
          const d = new Date(year, month, day);
          const { getDayName, formatDate } = pm();

          // getDayName
          expect(getDayName(d)).toBe(DAY_NAMES[d.getDay()]);

          // formatDate: DD/M
          const expectedDay   = String(d.getDate()).padStart(2, '0');
          const expectedMonth = String(d.getMonth() + 1);
          expect(formatDate(d)).toBe(`${expectedDay}/${expectedMonth}`);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// HELPERS FOR NEW DAYS
// ══════════════════════════════════════════════════════════════════════════

const pmMiercoles = () => window.PuzzleModule_miercoles;
const pmJueves    = () => window.PuzzleModule_jueves;
const pmViernes   = () => window.PuzzleModule_viernes;
const pmSabado    = () => window.PuzzleModule_sabado;
const pmDomingo   = () => window.PuzzleModule_domingo;

function resetState_miercoles() {
  const { PuzzleState, CORRECT_SEQUENCE } = pmMiercoles();
  PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
  PuzzleState.selectedIndex = null;
  const errorEl = document.getElementById('error-message-miercoles');
  if (errorEl) errorEl.classList.add('hidden');
  const modal = document.getElementById('modal-miercoles');
  if (modal) modal.classList.add('hidden');
}

function resetState_jueves() {
  const { PuzzleState, CORRECT_SEQUENCE } = pmJueves();
  PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
  PuzzleState.selectedIndex = null;
  const errorEl = document.getElementById('error-message-jueves');
  if (errorEl) errorEl.classList.add('hidden');
  const modal = document.getElementById('modal-jueves');
  if (modal) modal.classList.add('hidden');
}

function resetState_viernes() {
  const { PuzzleState, CORRECT_SEQUENCE } = pmViernes();
  PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
  PuzzleState.selectedIndex = null;
  const errorEl = document.getElementById('error-message-viernes');
  if (errorEl) errorEl.classList.add('hidden');
  const modal = document.getElementById('modal-viernes');
  if (modal) modal.classList.add('hidden');
}

function resetState_sabado() {
  const { PuzzleState, CORRECT_SEQUENCE } = pmSabado();
  PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
  PuzzleState.selectedIndex = null;
  const errorEl = document.getElementById('error-message-sabado');
  if (errorEl) errorEl.classList.add('hidden');
  const modal = document.getElementById('modal-sabado');
  if (modal) modal.classList.add('hidden');
}

function resetState_domingo() {
  const { PuzzleState, CORRECT_SEQUENCE } = pmDomingo();
  PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
  PuzzleState.selectedIndex = null;
  const errorEl = document.getElementById('error-message-domingo');
  if (errorEl) errorEl.classList.add('hidden');
  const modal = document.getElementById('modal-domingo');
  if (modal) modal.classList.add('hidden');
}

// ══════════════════════════════════════════════════════════════════════════
// MIÉRCOLES
// ══════════════════════════════════════════════════════════════════════════

describe('Miércoles — PuzzleModule availability', () => {
  test('window.PuzzleModule_miercoles is exposed under __TESTING__', () => {
    expect(window.PuzzleModule_miercoles).toBeDefined();
  });

  test('exports all expected members', () => {
    const {
      shuffleBlocks, validateSolution, swapBlocks, handleBlockClick,
      PuzzleState, CORRECT_SEQUENCE, CREDITS_REWARD,
    } = pmMiercoles();
    expect(typeof shuffleBlocks).toBe('function');
    expect(typeof validateSolution).toBe('function');
    expect(typeof swapBlocks).toBe('function');
    expect(typeof handleBlockClick).toBe('function');
    expect(Array.isArray(CORRECT_SEQUENCE)).toBe(true);
    expect(typeof CREDITS_REWARD).toBe('number');
    expect(PuzzleState).toBeDefined();
  });
});

describe('Miércoles — CORRECT_SEQUENCE', () => {
  test('has exactly 4 blocks with the expected ids', () => {
    const { CORRECT_SEQUENCE } = pmMiercoles();
    expect(CORRECT_SEQUENCE).toHaveLength(4);
    expect(CORRECT_SEQUENCE.map(b => b.id)).toEqual([
      'mie-block-1', 'mie-block-2', 'mie-block-3', 'mie-block-4',
    ]);
  });

  test('has the expected labels', () => {
    const labels = pmMiercoles().CORRECT_SEQUENCE.map(b => b.label);
    expect(labels).toContain('Análisis');
    expect(labels).toContain('Desarrollo');
    expect(labels).toContain('Pruebas');
    expect(labels).toContain('Mantenimiento');
  });

  test('CREDITS_REWARD is 250', () => {
    expect(pmMiercoles().CREDITS_REWARD).toBe(250);
  });
});

describe('Miércoles — validateSolution', () => {
  afterEach(resetState_miercoles);

  test('returns true when blocks match CORRECT_SEQUENCE', () => {
    const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pmMiercoles();
    PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
    expect(validateSolution()).toBe(true);
  });

  test('returns false for reversed order', () => {
    const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pmMiercoles();
    PuzzleState.blocks = [...CORRECT_SEQUENCE].reverse().map(b => ({ ...b }));
    expect(validateSolution()).toBe(false);
  });
});

describe('Miércoles — swapBlocks', () => {
  beforeEach(resetState_miercoles);

  test('swaps two positions correctly', () => {
    const { PuzzleState, swapBlocks } = pmMiercoles();
    const b0 = PuzzleState.blocks[0].id;
    const b2 = PuzzleState.blocks[2].id;
    swapBlocks(0, 2);
    expect(PuzzleState.blocks[0].id).toBe(b2);
    expect(PuzzleState.blocks[2].id).toBe(b0);
  });

  test('no-op and console.error on out-of-range index', () => {
    const { PuzzleState, swapBlocks } = pmMiercoles();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const before = PuzzleState.blocks.map(b => b.id);
    swapBlocks(0, 10);
    expect(PuzzleState.blocks.map(b => b.id)).toEqual(before);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('Property — Miércoles validateSolution is correct for all permutations', () => {
  test('validates all permutations correctly', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray([0, 1, 2, 3], { minLength: 4, maxLength: 4 }),
        (perm) => {
          const mod = pmMiercoles();
          mod.PuzzleState.blocks = perm.map(idx => ({ ...mod.CORRECT_SEQUENCE[idx] }));
          mod.PuzzleState.selectedIndex = null;
          const isCorrect = perm.every((idx, pos) => idx === pos);
          expect(mod.validateSolution()).toBe(isCorrect);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// JUEVES
// ══════════════════════════════════════════════════════════════════════════

describe('Jueves — PuzzleModule availability', () => {
  test('window.PuzzleModule_jueves is exposed under __TESTING__', () => {
    expect(window.PuzzleModule_jueves).toBeDefined();
  });

  test('exports all expected members', () => {
    const {
      shuffleBlocks, validateSolution, swapBlocks, handleBlockClick,
      PuzzleState, CORRECT_SEQUENCE, CREDITS_REWARD,
    } = pmJueves();
    expect(typeof shuffleBlocks).toBe('function');
    expect(typeof validateSolution).toBe('function');
    expect(typeof swapBlocks).toBe('function');
    expect(typeof handleBlockClick).toBe('function');
    expect(Array.isArray(CORRECT_SEQUENCE)).toBe(true);
    expect(typeof CREDITS_REWARD).toBe('number');
    expect(PuzzleState).toBeDefined();
  });
});

describe('Jueves — CORRECT_SEQUENCE', () => {
  test('has exactly 4 blocks with the expected ids', () => {
    const { CORRECT_SEQUENCE } = pmJueves();
    expect(CORRECT_SEQUENCE).toHaveLength(4);
    expect(CORRECT_SEQUENCE.map(b => b.id)).toEqual([
      'jue-block-1', 'jue-block-2', 'jue-block-3', 'jue-block-4',
    ]);
  });

  test('has the expected labels', () => {
    const labels = pmJueves().CORRECT_SEQUENCE.map(b => b.label);
    expect(labels).toContain('Commit');
    expect(labels).toContain('Build');
    expect(labels).toContain('Test');
    expect(labels).toContain('Deploy');
  });

  test('CREDITS_REWARD is 250', () => {
    expect(pmJueves().CREDITS_REWARD).toBe(250);
  });
});

describe('Jueves — validateSolution', () => {
  afterEach(resetState_jueves);

  test('returns true when blocks match CORRECT_SEQUENCE', () => {
    const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pmJueves();
    PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
    expect(validateSolution()).toBe(true);
  });

  test('returns false for reversed order', () => {
    const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pmJueves();
    PuzzleState.blocks = [...CORRECT_SEQUENCE].reverse().map(b => ({ ...b }));
    expect(validateSolution()).toBe(false);
  });
});

describe('Jueves — swapBlocks', () => {
  beforeEach(resetState_jueves);

  test('swaps two positions correctly', () => {
    const { PuzzleState, swapBlocks } = pmJueves();
    const b0 = PuzzleState.blocks[0].id;
    const b3 = PuzzleState.blocks[3].id;
    swapBlocks(0, 3);
    expect(PuzzleState.blocks[0].id).toBe(b3);
    expect(PuzzleState.blocks[3].id).toBe(b0);
  });

  test('no-op and console.error on out-of-range index', () => {
    const { PuzzleState, swapBlocks } = pmJueves();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const before = PuzzleState.blocks.map(b => b.id);
    swapBlocks(1, 99);
    expect(PuzzleState.blocks.map(b => b.id)).toEqual(before);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('Property — Jueves validateSolution is correct for all permutations', () => {
  test('validates all permutations correctly', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray([0, 1, 2, 3], { minLength: 4, maxLength: 4 }),
        (perm) => {
          const mod = pmJueves();
          mod.PuzzleState.blocks = perm.map(idx => ({ ...mod.CORRECT_SEQUENCE[idx] }));
          mod.PuzzleState.selectedIndex = null;
          const isCorrect = perm.every((idx, pos) => idx === pos);
          expect(mod.validateSolution()).toBe(isCorrect);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// VIERNES
// ══════════════════════════════════════════════════════════════════════════

describe('Viernes — PuzzleModule availability', () => {
  test('window.PuzzleModule_viernes is exposed under __TESTING__', () => {
    expect(window.PuzzleModule_viernes).toBeDefined();
  });

  test('exports all expected members', () => {
    const {
      shuffleBlocks, validateSolution, swapBlocks, handleBlockClick,
      PuzzleState, CORRECT_SEQUENCE, CREDITS_REWARD,
    } = pmViernes();
    expect(typeof shuffleBlocks).toBe('function');
    expect(typeof validateSolution).toBe('function');
    expect(typeof swapBlocks).toBe('function');
    expect(typeof handleBlockClick).toBe('function');
    expect(Array.isArray(CORRECT_SEQUENCE)).toBe(true);
    expect(typeof CREDITS_REWARD).toBe('number');
    expect(PuzzleState).toBeDefined();
  });
});

describe('Viernes — CORRECT_SEQUENCE', () => {
  test('has exactly 4 blocks with the expected ids', () => {
    const { CORRECT_SEQUENCE } = pmViernes();
    expect(CORRECT_SEQUENCE).toHaveLength(4);
    expect(CORRECT_SEQUENCE.map(b => b.id)).toEqual([
      'vie-block-1', 'vie-block-2', 'vie-block-3', 'vie-block-4',
    ]);
  });

  test('has the expected labels', () => {
    const labels = pmViernes().CORRECT_SEQUENCE.map(b => b.label);
    expect(labels).toContain('Cliente');
    expect(labels).toContain('Controlador');
    expect(labels).toContain('Servicio');
    expect(labels).toContain('Repositorio');
  });

  test('CREDITS_REWARD is 250', () => {
    expect(pmViernes().CREDITS_REWARD).toBe(250);
  });
});

describe('Viernes — validateSolution', () => {
  afterEach(resetState_viernes);

  test('returns true when blocks match CORRECT_SEQUENCE', () => {
    const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pmViernes();
    PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
    expect(validateSolution()).toBe(true);
  });

  test('returns false for reversed order', () => {
    const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pmViernes();
    PuzzleState.blocks = [...CORRECT_SEQUENCE].reverse().map(b => ({ ...b }));
    expect(validateSolution()).toBe(false);
  });
});

describe('Viernes — swapBlocks', () => {
  beforeEach(resetState_viernes);

  test('swaps two positions correctly', () => {
    const { PuzzleState, swapBlocks } = pmViernes();
    const b1 = PuzzleState.blocks[1].id;
    const b3 = PuzzleState.blocks[3].id;
    swapBlocks(1, 3);
    expect(PuzzleState.blocks[1].id).toBe(b3);
    expect(PuzzleState.blocks[3].id).toBe(b1);
  });

  test('no-op and console.error on out-of-range index', () => {
    const { PuzzleState, swapBlocks } = pmViernes();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const before = PuzzleState.blocks.map(b => b.id);
    swapBlocks(0, -1);
    expect(PuzzleState.blocks.map(b => b.id)).toEqual(before);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('Property — Viernes validateSolution is correct for all permutations', () => {
  test('validates all permutations correctly', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray([0, 1, 2, 3], { minLength: 4, maxLength: 4 }),
        (perm) => {
          const mod = pmViernes();
          mod.PuzzleState.blocks = perm.map(idx => ({ ...mod.CORRECT_SEQUENCE[idx] }));
          mod.PuzzleState.selectedIndex = null;
          const isCorrect = perm.every((idx, pos) => idx === pos);
          expect(mod.validateSolution()).toBe(isCorrect);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// SÁBADO
// ══════════════════════════════════════════════════════════════════════════

describe('Sábado — PuzzleModule availability', () => {
  test('window.PuzzleModule_sabado is exposed under __TESTING__', () => {
    expect(window.PuzzleModule_sabado).toBeDefined();
  });

  test('exports all expected members', () => {
    const {
      shuffleBlocks, validateSolution, swapBlocks, handleBlockClick,
      PuzzleState, CORRECT_SEQUENCE, CREDITS_REWARD,
    } = pmSabado();
    expect(typeof shuffleBlocks).toBe('function');
    expect(typeof validateSolution).toBe('function');
    expect(typeof swapBlocks).toBe('function');
    expect(typeof handleBlockClick).toBe('function');
    expect(Array.isArray(CORRECT_SEQUENCE)).toBe(true);
    expect(typeof CREDITS_REWARD).toBe('number');
    expect(PuzzleState).toBeDefined();
  });
});

describe('Sábado — CORRECT_SEQUENCE', () => {
  test('has exactly 4 blocks with the expected ids', () => {
    const { CORRECT_SEQUENCE } = pmSabado();
    expect(CORRECT_SEQUENCE).toHaveLength(4);
    expect(CORRECT_SEQUENCE.map(b => b.id)).toEqual([
      'sab-block-1', 'sab-block-2', 'sab-block-3', 'sab-block-4',
    ]);
  });

  test('has the expected labels', () => {
    const labels = pmSabado().CORRECT_SEQUENCE.map(b => b.label);
    expect(labels).toContain('Login');
    expect(labels).toContain('Verificación');
    expect(labels).toContain('Emisión');
    expect(labels).toContain('Autorización');
  });

  test('CREDITS_REWARD is 250', () => {
    expect(pmSabado().CREDITS_REWARD).toBe(250);
  });
});

describe('Sábado — validateSolution', () => {
  afterEach(resetState_sabado);

  test('returns true when blocks match CORRECT_SEQUENCE', () => {
    const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pmSabado();
    PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
    expect(validateSolution()).toBe(true);
  });

  test('returns false for reversed order', () => {
    const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pmSabado();
    PuzzleState.blocks = [...CORRECT_SEQUENCE].reverse().map(b => ({ ...b }));
    expect(validateSolution()).toBe(false);
  });
});

describe('Sábado — swapBlocks', () => {
  beforeEach(resetState_sabado);

  test('swaps two positions correctly', () => {
    const { PuzzleState, swapBlocks } = pmSabado();
    const b0 = PuzzleState.blocks[0].id;
    const b1 = PuzzleState.blocks[1].id;
    swapBlocks(0, 1);
    expect(PuzzleState.blocks[0].id).toBe(b1);
    expect(PuzzleState.blocks[1].id).toBe(b0);
  });

  test('no-op and console.error on out-of-range index', () => {
    const { PuzzleState, swapBlocks } = pmSabado();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const before = PuzzleState.blocks.map(b => b.id);
    swapBlocks(2, 10);
    expect(PuzzleState.blocks.map(b => b.id)).toEqual(before);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('Property — Sábado validateSolution is correct for all permutations', () => {
  test('validates all permutations correctly', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray([0, 1, 2, 3], { minLength: 4, maxLength: 4 }),
        (perm) => {
          const mod = pmSabado();
          mod.PuzzleState.blocks = perm.map(idx => ({ ...mod.CORRECT_SEQUENCE[idx] }));
          mod.PuzzleState.selectedIndex = null;
          const isCorrect = perm.every((idx, pos) => idx === pos);
          expect(mod.validateSolution()).toBe(isCorrect);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// DOMINGO
// ══════════════════════════════════════════════════════════════════════════

describe('Domingo — PuzzleModule availability', () => {
  test('window.PuzzleModule_domingo is exposed under __TESTING__', () => {
    expect(window.PuzzleModule_domingo).toBeDefined();
  });

  test('exports all expected members', () => {
    const {
      shuffleBlocks, validateSolution, swapBlocks, handleBlockClick,
      PuzzleState, CORRECT_SEQUENCE, CREDITS_REWARD,
    } = pmDomingo();
    expect(typeof shuffleBlocks).toBe('function');
    expect(typeof validateSolution).toBe('function');
    expect(typeof swapBlocks).toBe('function');
    expect(typeof handleBlockClick).toBe('function');
    expect(Array.isArray(CORRECT_SEQUENCE)).toBe(true);
    expect(typeof CREDITS_REWARD).toBe('number');
    expect(PuzzleState).toBeDefined();
  });
});

describe('Domingo — CORRECT_SEQUENCE', () => {
  test('has exactly 4 blocks with the expected ids', () => {
    const { CORRECT_SEQUENCE } = pmDomingo();
    expect(CORRECT_SEQUENCE).toHaveLength(4);
    expect(CORRECT_SEQUENCE.map(b => b.id)).toEqual([
      'dom-block-1', 'dom-block-2', 'dom-block-3', 'dom-block-4',
    ]);
  });

  test('has the expected labels', () => {
    const labels = pmDomingo().CORRECT_SEQUENCE.map(b => b.label);
    expect(labels).toContain('Reproducción');
    expect(labels).toContain('Diagnóstico');
    expect(labels).toContain('Corrección');
    expect(labels).toContain('Verificación');
  });

  test('CREDITS_REWARD is 250', () => {
    expect(pmDomingo().CREDITS_REWARD).toBe(250);
  });
});

describe('Domingo — validateSolution', () => {
  afterEach(resetState_domingo);

  test('returns true when blocks match CORRECT_SEQUENCE', () => {
    const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pmDomingo();
    PuzzleState.blocks = CORRECT_SEQUENCE.map(b => ({ ...b }));
    expect(validateSolution()).toBe(true);
  });

  test('returns false for reversed order', () => {
    const { PuzzleState, CORRECT_SEQUENCE, validateSolution } = pmDomingo();
    PuzzleState.blocks = [...CORRECT_SEQUENCE].reverse().map(b => ({ ...b }));
    expect(validateSolution()).toBe(false);
  });
});

describe('Domingo — swapBlocks', () => {
  beforeEach(resetState_domingo);

  test('swaps two positions correctly', () => {
    const { PuzzleState, swapBlocks } = pmDomingo();
    const b2 = PuzzleState.blocks[2].id;
    const b3 = PuzzleState.blocks[3].id;
    swapBlocks(2, 3);
    expect(PuzzleState.blocks[2].id).toBe(b3);
    expect(PuzzleState.blocks[3].id).toBe(b2);
  });

  test('no-op and console.error on out-of-range index', () => {
    const { PuzzleState, swapBlocks } = pmDomingo();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const before = PuzzleState.blocks.map(b => b.id);
    swapBlocks(0, 5);
    expect(PuzzleState.blocks.map(b => b.id)).toEqual(before);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('Property — Domingo validateSolution is correct for all permutations', () => {
  test('validates all permutations correctly', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray([0, 1, 2, 3], { minLength: 4, maxLength: 4 }),
        (perm) => {
          const mod = pmDomingo();
          mod.PuzzleState.blocks = perm.map(idx => ({ ...mod.CORRECT_SEQUENCE[idx] }));
          mod.PuzzleState.selectedIndex = null;
          const isCorrect = perm.every((idx, pos) => idx === pos);
          expect(mod.validateSolution()).toBe(isCorrect);
        }
      ),
      { numRuns: 100 }
    );
  });
});
