interface Props {
  score: number;
}

export function HumanScoreBadge({ score }: Props) {
  const color =
    score >= 75 ? 'bg-green-100 text-green-900' : score >= 60 ? 'bg-yellow-100 text-yellow-900' : 'bg-red-100 text-red-900';
  const label =
    score >= 75 ? 'Brzmi jak człowiek' : score >= 60 ? 'Akceptowalny — sprawdź checklist' : 'Pachnie AI — edytuj';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${color}`}>
      <span className="font-bold">{score}/100</span>
      <span>{label}</span>
    </span>
  );
}
