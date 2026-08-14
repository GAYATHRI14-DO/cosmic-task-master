import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Flame, Plus, Shield, Skull, Sword, Trash2, Trophy, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuestLog — Gamified Dark To-Do Command Center" },
      {
        name: "description",
        content:
          "Turn your tasks into quests. Earn XP, level up, keep streaks alive in a neon dark command center built for focus.",
      },
      { property: "og:title", content: "QuestLog — Gamified Dark To-Do" },
      {
        property: "og:description",
        content: "Turn tasks into quests, earn XP and level up in a neon dark command center.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Difficulty = "easy" | "normal" | "boss";

type Quest = {
  id: string;
  title: string;
  difficulty: Difficulty;
  done: boolean;
};

const XP: Record<Difficulty, number> = { easy: 20, normal: 50, boss: 150 };

const DIFFS: { key: Difficulty; label: string; icon: typeof Sword }[] = [
  { key: "easy", label: "Scout", icon: Shield },
  { key: "normal", label: "Raid", icon: Sword },
  { key: "boss", label: "Boss", icon: Skull },
];

const STORAGE_KEY = "questlog.quests.v1";

const seed: Quest[] = [
  { id: "1", title: "Clear the inbox dungeon", difficulty: "normal", done: false },
  { id: "2", title: "30 min cardio grind", difficulty: "easy", done: true },
  { id: "3", title: "Ship the final boss feature", difficulty: "boss", done: false },
];

function Index() {
  const [quests, setQuests] = useState<Quest[]>(seed);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setQuests(JSON.parse(raw));
      } catch {
        /* keep seed */
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
  }, [quests, loaded]);

  const xp = useMemo(
    () => quests.filter((q) => q.done).reduce((sum, q) => sum + XP[q.difficulty], 0),
    [quests],
  );
  const level = Math.floor(xp / 300) + 1;
  const levelXp = xp % 300;
  const pct = Math.round((levelXp / 300) * 100);
  const active = quests.filter((q) => !q.done).length;
  const cleared = quests.length - active;

  const visible = quests.filter((q) =>
    filter === "all" ? true : filter === "active" ? !q.done : q.done,
  );

  function addQuest(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setQuests((q) => [{ id: crypto.randomUUID(), title: t, difficulty, done: false }, ...q]);
    setTitle("");
  }

  return (
    <main className="min-h-screen px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <header className="hud-panel scanlines rounded-xl p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.35em] text-neon">
                Quest Log
              </p>
              <h1 className="font-display text-glow mt-2 text-3xl font-black uppercase md:text-4xl">
                Command Center
              </h1>
            </div>
            <div className="animate-pulse-glow flex size-16 shrink-0 items-center justify-center rounded-lg border border-primary/50 bg-primary/10 md:size-20">
              <div className="text-center">
                <div className="font-display text-xl font-black text-primary md:text-2xl">
                  {level}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  lvl
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between text-xs uppercase tracking-widest text-muted-foreground">
              <span>XP {levelXp} / 300</span>
              <span>{pct}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border border-border bg-background/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-neon to-neon-2 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat icon={Zap} label="Total XP" value={xp} />
            <Stat icon={Flame} label="Active" value={active} />
            <Stat icon={Trophy} label="Cleared" value={cleared} />
          </div>
        </header>

        <form onSubmit={addQuest} className="hud-panel mt-6 rounded-xl p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Log a new quest..."
              className="h-12 w-full rounded-lg border border-input bg-background/60 px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-ring/40"
            />
            <button
              type="submit"
              className="glow-primary inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-display text-sm font-bold uppercase text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
            >
              <Plus className="size-4" /> Deploy
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {DIFFS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setDifficulty(key)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  difficulty === key
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" /> {label} · {XP[key]} xp
              </button>
            ))}
          </div>
        </form>

        <div className="mt-6 flex gap-2">
          {(["all", "active", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 font-display text-xs uppercase tracking-widest transition ${
                filter === f
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <ul className="mt-3 space-y-3">
          {visible.map((q) => {
            const Icon = DIFFS.find((d) => d.key === q.difficulty)!.icon;
            return (
              <li
                key={q.id}
                className={`hud-panel group flex items-center gap-4 rounded-xl p-4 transition ${
                  q.done ? "opacity-55" : "hover:-translate-y-0.5"
                }`}
              >
                <button
                  onClick={() =>
                    setQuests((all) =>
                      all.map((x) => (x.id === q.id ? { ...x, done: !x.done } : x)),
                    )
                  }
                  aria-label={q.done ? "Mark incomplete" : "Complete quest"}
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md border transition ${
                    q.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background/60 text-muted-foreground hover:border-primary/70 hover:text-primary"
                  }`}
                >
                  <Icon className="size-4" />
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-base font-semibold ${
                      q.done ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {q.title}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">
                    {DIFFS.find((d) => d.key === q.difficulty)!.label} · +{XP[q.difficulty]} xp
                  </p>
                </div>

                <button
                  onClick={() => setQuests((all) => all.filter((x) => x.id !== q.id))}
                  aria-label="Abandon quest"
                  className="rounded-md p-2 text-muted-foreground opacity-0 transition hover:bg-destructive/15 hover:text-destructive focus:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="hud-panel rounded-xl p-10 text-center text-sm uppercase tracking-widest text-muted-foreground">
              No quests in this sector
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <Icon className="size-4 text-neon" />
      <div className="font-display mt-2 text-xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
