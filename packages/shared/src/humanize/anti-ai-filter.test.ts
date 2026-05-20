import { describe, it, expect } from 'vitest';
import { runAntiAiFilter } from './anti-ai-filter.js';
import { computeHumanScore } from './human-score.js';
import { variateForGroup, contentHash } from './variator.js';

describe('runAntiAiFilter', () => {
  it('blokuje zakazane frazy AI', () => {
    const ai = 'W dzisiejszym dynamicznie zmieniającym się świecie warto pamiętać o rozwoju.';
    const r = runAntiAiFilter(ai);
    expect(r.blocked).toBe(true);
    expect(r.findings.some((f) => f.code === 'cliche_modern_world')).toBe(true);
    expect(r.findings.some((f) => f.code === 'cliche_worth_remembering')).toBe(true);
  });

  it('zamienia em-dashy na zwykłe myślniki', () => {
    const input = 'Mamy nową ofertę — spawacz, Pruszków — stawka 7000.';
    const r = runAntiAiFilter(input);
    expect(r.cleanedText).not.toContain('—');
    expect(r.findings.some((f) => f.code === 'em_dash')).toBe(true);
  });

  it('flaguje brak konkretu', () => {
    const generic = 'szukamy pracownika do firmy. dobre warunki. odzywajcie się chętni.';
    const r = runAntiAiFilter(generic);
    expect(r.findings.some((f) => f.code === 'too_generic')).toBe(true);
  });

  it('przepuszcza dobrze napisany ludzki post', () => {
    const ok = 'Hej grupa Bemowo! Szukam u nas spawacza MIG/MAG, hala B na Powstańców 12. Stawka od 7 200 netto + premia. Dwie zmiany. Pisz, oddzwaniam dzisiaj.';
    const r = runAntiAiFilter(ok);
    expect(r.blocked).toBe(false);
  });
});

describe('computeHumanScore', () => {
  it('AI-słownik dostaje niski score', () => {
    const ai = 'W dzisiejszym dynamicznie zmieniającym się świecie warto pamiętać że nasza firma to lider rynku oferujący innowacyjne rozwiązania.';
    const { score } = computeHumanScore(ai);
    expect(score).toBeLessThan(40);
  });

  it('ludzki post dostaje wysoki score', () => {
    const human = 'Hej! Szukam u nas spawacza, hala na Bemowie. Stawka 7 200 netto. Dwie zmiany, dojazd autobusem 197 lub 109. Daj znać, oddzwaniam dziś.';
    const { score } = computeHumanScore(human);
    expect(score).toBeGreaterThanOrEqual(60);
  });
});

describe('variateForGroup', () => {
  it('jest deterministyczny dla tego samego seeda', () => {
    const text = 'Hej! Szukam u nas spawacza. Napisz w wiadomości, oddzwaniam.';
    const a = variateForGroup(text, { seed: 'campaign-1:group-A' });
    const b = variateForGroup(text, { seed: 'campaign-1:group-A' });
    expect(a.text).toBe(b.text);
  });

  it('różne seedy generują różne wyniki', () => {
    const text = 'Hej! Szukam u nas spawacza. Napisz w wiadomości, oddzwaniam.';
    const a = variateForGroup(text, { seed: 'campaign-1:group-A' });
    const b = variateForGroup(text, { seed: 'campaign-1:group-B' });
    expect(a.text === b.text && a.changes.length === b.changes.length).toBe(false);
  });
});

describe('contentHash', () => {
  it('różne teksty mają różne hashe', async () => {
    const h1 = await contentHash('Hej, szukam spawacza.');
    const h2 = await contentHash('Witam, szukam spawacza.');
    expect(h1).not.toBe(h2);
  });

  it('whitespace i case nie liczą się', async () => {
    const h1 = await contentHash('Hej szukam spawacza.');
    const h2 = await contentHash('  HEJ SZUKAM SPAWACZA.  ');
    expect(h1).toBe(h2);
  });
});
