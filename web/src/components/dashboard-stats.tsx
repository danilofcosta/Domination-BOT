// "use client";

import {
  UsersIcon,
  UserCircleIcon,
  HeartIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";

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
    <div className=" flex flex-wrap gap-6  justify-center p-4">
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

function StatCard({
  icon,
  title,
  description,
    href="#",

}: {
  icon: React.ReactNode;
  title: string;
  description: string | number;
  href?: string;
}) {
  return (
    <a href={href}>
    <div className="flex items-center gap-3  rounded-2xl backdrop-blur-xl shadow-md hover:scale-105 transition">
      <div className="p-2 rounded-full bg-white/20">
        {icon}
      </div>

      <div>
        <h3 className="text-xs opacity-70">{title}</h3>
      </div>
      <p className="text-lg font-bold">{description}</p>
      <div></div>
    </div>
    </a>
  );
}
