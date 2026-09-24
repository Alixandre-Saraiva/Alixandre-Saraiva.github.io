import {
  BrickWall,
  Car,
  Code,
  Droplets,
  Hammer,
  Monitor,
  Paintbrush,
  PaintRoller,
  Palette,
  Scissors,
  Sparkles,
  Sprout,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "brick-wall": BrickWall,
  zap: Zap,
  droplets: Droplets,
  "paint-roller": PaintRoller,
  sparkles: Sparkles,
  sprout: Sprout,
  monitor: Monitor,
  hammer: Hammer,
  palette: Palette,
  code: Code,
  car: Car,
  wrench: Wrench,
  scissors: Scissors,
  truck: Truck,
  paintbrush: Paintbrush,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? Wrench;
  return <Icon className={className} aria-hidden />;
}
