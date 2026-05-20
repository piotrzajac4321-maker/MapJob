interface Props {
  text: string;
}

interface CheckItem {
  label: string;
  passes: boolean;
  hint?: string;
}

function buildChecks(text: string): CheckItem[] {
  const hasNumber = /\d/.test(text);
  const hasProperNoun = /(?<=[^.!?]\s)[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+/.test(text);
  const hasEmDash = /—/.test(text);
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const hasShortSentence = sentences.some((s) => s.split(/\s+/).length <= 5);
  const hasColloquial = /\b(daj znać|odzywaj|pisz|dm|tagnij|po sąsiedzku|u nas|wjedź|domknąć|rekru|cv-k|lead|spoko|gadamy|krótko mówiąc)\b/i.test(
    text,
  );
  const tooLong = text.length > 900;

  return [
    {
      label: 'Konkretna liczba/kwota/godziny',
      passes: hasNumber,
      hint: 'Dodaj kwotę, dzielnicę, czas. Bez konkretu = generyk.',
    },
    {
      label: 'Nazwa własna (dzielnica, ulica, firma)',
      passes: hasProperNoun,
      hint: 'Lokalność buduje wiarygodność.',
    },
    {
      label: 'Brak em-dashy (—)',
      passes: !hasEmDash,
      hint: 'Em-dashe to typowy ślad AI po polsku — zamień na zwykłe myślniki.',
    },
    {
      label: 'Krótkie zdanie (≤5 słów)',
      passes: hasShortSentence,
      hint: 'Człowiek miesza długości zdań. Dodaj jedno rwane.',
    },
    {
      label: 'Słownictwo branżowe / kolokwialne',
      passes: hasColloquial,
      hint: 'Wpleć "daj znać", "pisz", "u nas", "tagnij" — brzmi jak post od kolegi.',
    },
    {
      label: 'Długość poniżej 900 znaków',
      passes: !tooLong,
      hint: 'Ludzie na grupach FB nie czytają długich. Skróć.',
    },
  ];
}

export function HumanizeChecklist({ text }: Props) {
  const checks = buildChecks(text);
  const passed = checks.filter((c) => c.passes).length;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Humanize checklist</p>
        <span className="text-xs text-muted-foreground">{passed}/{checks.length}</span>
      </div>
      <ul className="space-y-2">
        {checks.map((c, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className={c.passes ? 'text-green-600' : 'text-muted-foreground'}>
              {c.passes ? '✓' : '○'}
            </span>
            <div className="flex-1">
              <p className={c.passes ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</p>
              {!c.passes && c.hint && (
                <p className="mt-0.5 text-xs text-muted-foreground">{c.hint}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
