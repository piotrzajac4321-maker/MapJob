import Link from 'next/link';

export default function Landing() {
  return (
    <main className="container py-16">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
          MapJob FB Poster
        </p>
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Wrzuć jedno ogłoszenie. Trafi do 200 grup.
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Półautomatyczne postowanie na grupy Facebook. Ty piszesz lub generujesz tekst, my
          przygotowujemy treść w każdej grupie, Ty klikasz Publikuj. System pilnuje gdzie już
          poszło, gdzie nie, kiedy znowu można wrzucać.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
          >
            Zacznij za darmo
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-input px-6 py-3 font-medium hover:bg-accent"
          >
            Mam już konto
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-5xl gap-8 md:grid-cols-3">
        <Feature
          title="Generator AI"
          body="Wpisujesz brief - dostajesz 3 warianty posta, każdy brzmi jak od człowieka z branży. Filtr anty-AI blokuje typowe wpadki."
        />
        <Feature
          title="Auto-wklejanie"
          body="Rozszerzenie Chrome otwiera grupę, wkleja treść i obrazy. Ty klikasz Publikuj. Po publikacji - automatyczny tracker."
        />
        <Feature
          title="Tracker + Cooldown"
          body="System pilnuje cooldownu 4h per grupa, dziennego limitu i wykrywa duplikaty. Bez ryzyka flagowania konta FB."
        />
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
