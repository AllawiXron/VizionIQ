import React from "react";
import {
  BarChart3, CalendarDays, Calculator, Clapperboard, Coins, CreditCard, Gift, LayoutTemplate,
  Megaphone, MessageCircle, PackageX, Scale, Search, Ship, Store, Target, TrendingUp, Truck, UserX, Users,
  type LucideIcon,
} from "lucide-react";

/** Line icons for chapters, solutions and Iraq-guide modules (in place of emoji). */
const ICONS: Record<"chapter" | "playbook" | "guide", Record<string, LucideIcon>> = {
  chapter: {
    chapter1: Users,
    chapter2: Gift,
    chapter3: Calculator,
    chapter4: Megaphone,
    chapter5: Clapperboard,
    chapter6: LayoutTemplate,
    chapter7: MessageCircle,
    chapter8: Truck,
    chapter9: PackageX,
    chapter10: BarChart3,
    chapter11: TrendingUp,
  },
  playbook: {
    "message-cost": Coins,
    ghosting: UserX,
    "more-sales": TrendingUp,
    returns: PackageX,
    scale: Target,
    product: Search,
  },
  guide: {
    market: Store,
    payments: CreditCard,
    delivery: Truck,
    importing: Ship,
    seasons: CalendarDays,
    law: Scale,
    "ads-iraq": Megaphone,
  },
};

type Kind = keyof typeof ICONS;

export function TopicGlyph({ kind, id, className = "w-4 h-4" }: { kind: Kind; id: string; className?: string }) {
  const Icon = ICONS[kind][id] ?? Target;
  return <Icon className={className} aria-hidden="true" />;
}

const SIZES = {
  sm: "w-9 h-9 rounded-xl [&>svg]:w-4 [&>svg]:h-4",
  md: "w-11 h-11 rounded-2xl [&>svg]:w-5 [&>svg]:h-5",
  lg: "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl [&>svg]:w-6 [&>svg]:h-6",
};

/** The icon on a quiet tile, sized for list rows, cards or page titles. */
export function TopicIcon({ kind, id, size = "md", className = "" }: { kind: Kind; id: string; size?: keyof typeof SIZES; className?: string }) {
  const Icon = ICONS[kind][id] ?? Target;
  return (
    <span className={`shrink-0 inline-flex items-center justify-center bg-white/[0.06] border border-white/10 text-vz-accent ${SIZES[size]} ${className}`} aria-hidden="true">
      <Icon />
    </span>
  );
}
