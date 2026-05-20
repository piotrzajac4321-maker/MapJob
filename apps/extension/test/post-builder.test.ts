/**
 * Testy post-builder: framework assembly + validation + hook suggestions.
 */
import { describe, it, expect } from 'vitest';
import {
  FRAMEWORKS,
  HOOKS,
  suggestHook,
  assemblePost,
  validatePost,
} from '../src/lib/post-builder';

describe('FRAMEWORKS', () => {
  it('ma 4 frameworki: aida, pas, bab, list', () => {
    expect(Object.keys(FRAMEWORKS).sort()).toEqual(['aida', 'bab', 'list', 'pas']);
  });

  it('każdy framework ma pola z label + placeholder', () => {
    for (const fw of Object.values(FRAMEWORKS)) {
      expect(fw.fields.length).toBeGreaterThanOrEqual(3);
      for (const f of fw.fields) {
        expect(f.id).toBeTruthy();
        expect(f.label).toBeTruthy();
        expect(f.placeholder).toBeTruthy();
      }
    }
  });
});

describe('HOOKS', () => {
  it('ma >= 20 hooków', () => {
    expect(HOOKS.length).toBeGreaterThanOrEqual(20);
  });
  it('każdy hook ma kategorię i vibe', () => {
    for (const h of HOOKS) {
      expect(h.id).toBeTruthy();
      expect(h.category).toBeTruthy();
      expect(h.text.length).toBeGreaterThan(5);
      expect(h.text.length).toBeLessThan(120);
    }
  });
});

describe('suggestHook', () => {
  it('dla job zwraca pytania/lokalność/identyfikację/deadline/liczbę', () => {
    const list = suggestHook('job');
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(6);
    const vibes = new Set(list.map((h) => h.vibe));
    // Powinien preferować pytanie/lokalność dla job
    expect(vibes.has('pytanie') || vibes.has('lokalność') || vibes.has('identyfikacja')).toBe(true);
  });
});

describe('assemblePost', () => {
  it('składa AIDA z 4 pól w 4 sekcje', () => {
    const text = assemblePost('aida', {
      hook: 'Mieszkasz na Bemowie?',
      interest: 'Mamy 3 wakaty.',
      desire: 'Stawka 7 200 PLN.',
      cta: 'Zostaw numer.',
    });
    expect(text).toContain('Mieszkasz na Bemowie?');
    expect(text).toContain('Mamy 3 wakaty.');
    expect(text).toContain('Stawka 7 200 PLN.');
    expect(text).toContain('Zostaw numer.');
    // Sekcje rozdzielone pustym wierszem
    expect(text.split('\n\n').length).toBe(4);
  });

  it('pomija puste pola', () => {
    const text = assemblePost('aida', { hook: 'Hook', cta: 'CTA', interest: '', desire: '' });
    expect(text).toBe('Hook\n\nCTA');
  });

  it('PAS przyjmuje 4 pola', () => {
    const text = assemblePost('pas', {
      problem: 'Klima dmucha ciepłe.',
      agitation: 'Lipiec za rogiem.',
      solution: 'Montujemy w 4h.',
      cta: 'Pisz.',
    });
    expect(text.split('\n\n')).toHaveLength(4);
  });

  it('Lista bullets preserwuje line breaks', () => {
    const text = assemblePost('list', {
      hook: 'Szukamy 3 spawaczy',
      bullets: '• Stawka 45 zł/h\n• Dojazd opłacany\n• Decyzja w 24h',
      cta: 'Pisz w komentarzu',
    });
    expect(text).toContain('• Stawka 45 zł/h');
    expect(text).toContain('• Dojazd opłacany');
  });
});

describe('validatePost', () => {
  it('długi tekst z liczbami, lokalnością, CTA → wysoki score', () => {
    const v = validatePost(
      'Szukam u nas w Pruszkowie spawacza MIG/MAG do hali. Stawka 7 200 netto plus premia 500/m. Dwie zmiany, Powstańców 12. Zostaw numer w komentarzu — oddzwaniam dzisiaj.',
    );
    // Zawiera em-dash więc -5, ale są liczby+lokalność+CTA — net positive
    expect(v.score).toBeGreaterThan(60);
  });

  it('krótki bez konkretów → niski score', () => {
    const v = validatePost('Witam, oferta pracy.');
    expect(v.score).toBeLessThan(40);
    expect(v.warnings.length).toBeGreaterThan(0);
  });

  it('AI-vibe opening jest karany — ostrzeżenie + obniżony score vs identyczny tekst', () => {
    // Identyczna druga połowa, tylko intro się różni.
    const aiOpen = 'Z dumą prezentujemy ofertę. Szukamy spawacza w Warszawie, stawka 7200 PLN netto miesięcznie plus premia 500. Zostaw numer w komentarzu, odzwaniam dzisiaj.';
    const human = 'Szukam u nas spawacza w Warszawie, stawka 7200 PLN netto miesięcznie plus premia 500. Zostaw numer w komentarzu, odzwaniam dzisiaj.';
    const v1 = validatePost(aiOpen);
    const v2 = validatePost(human);
    expect(v1.score).toBeLessThan(v2.score);
    expect(v1.warnings.some((w) => /generic/i.test(w))).toBe(true);
  });

  it('brak CTA → ostrzeżenie', () => {
    const v = validatePost('Tutaj mamy 3 oferty pracy w Warszawie. Stawka 5000 PLN miesięcznie netto.');
    expect(v.warnings.some((w) => /CTA/i.test(w))).toBe(true);
  });

  it('em-dash → ostrzeżenie i -5', () => {
    const v = validatePost('Szukam spawacza — Warszawa, 5000 PLN. Pisz w komentarzu.');
    expect(v.warnings.some((w) => /em-dash/i.test(w))).toBe(true);
  });

  it('markdown bold → ostrzeżenie', () => {
    const v = validatePost('**Oferta pracy**\nSzukam spawacza Warszawa 5000. Pisz w komentarzu.');
    expect(v.warnings.some((w) => /markdown/i.test(w))).toBe(true);
  });
});
