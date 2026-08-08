import Link from "next/link";
import {
  BotMessageSquare,
  MessageSquareText,
  UsersRound,
  Info,
  Shield,
  Rocket,
} from "lucide-react";

type Section = {
  label: string;
  items: { href: string; title: string; description: string; icon: React.ComponentType<{ className?: string }> }[];
};

const SECTIONS: Section[] = [
  {
    label: "Configurações",
    items: [
      {
        href: "/setup/textos",
        title: "Textos",
        description: "Edite todas as mensagens do bot.",
        icon: MessageSquareText,
      },
      {
        href: "/setup/dados-bot",
        title: "Dados do Bot",
        description: "Constantes do bot, drop e status do Redis.",
        icon: BotMessageSquare,
      },
    ],
  },
  {
    label: "Gerência",
    items: [
      {
        href: "/setup/grupos",
        title: "Grupos Cadastrados",
        description: "Gerencie os grupos do bot.",
        icon: UsersRound,
      },
      {
        href: "/setup/info",
        title: "Info",
        description: "Informações e descrição dos bots.",
        icon: Info,
      },
      {
        href: "/setup/limites",
        title: "Limites e Bloqueios",
        description: "Controle de limites e bloqueios.",
        icon: Shield,
      },
      {
        href: "/setup/drop",
        title: "Dropar Personagem",
        description: "Configure os pesos das raridades.",
        icon: Rocket,
      },
    ],
  },
];

export default function SetupPage() {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Configuração do Bot
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Configurações</h1>
          </div>
          <Link
            href="/home"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Voltar
          </Link>
        </div>
      </header>

      {SECTIONS.map((section) => (
        <section key={section.label} className="space-y-3">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            {section.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-3 text-sm">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
