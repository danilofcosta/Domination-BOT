// "use client";

import {
  UsersIcon,
  UserCircleIcon,
  HeartIcon,
  SparklesIcon,
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalCharacters: number;
    totalCollections: number;
    totalWaifus: number;
    totalHusbandos: number;
  };
}

const statConfig = {
  totalUsers: {
    label: "Usuários",
    icon: <UsersIcon size={20} />,
    tab: "/admin?tab=users",
  },
  totalCharacters: {
    label: "Personagens",
    icon: <UserCircleIcon size={20} />,
    tab: "/admin?tab=characters",
  },
  totalCollections: {
    label: "Coleções",
    icon: <SparklesIcon size={20} />,
    tab: "/admin?tab=collections",
  },
  totalWaifus: {
    label: "Waifus",
    icon: <HeartIcon size={20} />,
    tab: "/admin?tab=waifus",
  },
  totalHusbandos: {
    label: "Husbandos",
    icon: <HeartIcon />,
    tab: "/admin?tab=husbandos",
  },
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 px-4 max-w-7xl mx-auto w-full">
      {Object.entries(stats).map(([key, value]) => {
        const config = statConfig[key as keyof typeof statConfig];
        if (!config) return null;

        return (
          <StatCard
            key={key}
            title={config.label}
            description={value}
            icon={config.icon}
            href={config.tab}
          />
        );
      })}
    </div>
  );
}

export function StatCard({
  icon,
  title,
  description,
  href = "#",
}: {
  icon: React.ReactNode;
  title: string;
  description: string | number;
  href?: string;
}) {
  return (
    <a href={href} className="block group">
      <div className="flex items-center gap-3 md:gap-4 p-4 rounded-2xl bg-card/45 hover:bg-card/65 border border-primary/10 hover:border-primary/35 backdrop-blur-md shadow-lg hover:shadow-primary/5 hover:scale-[1.03] transition-all duration-300">
        <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 text-primary transition-colors duration-300">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground/75 truncate">{title}</p>
          <p className="text-base md:text-xl font-black text-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </a>
  );
}
