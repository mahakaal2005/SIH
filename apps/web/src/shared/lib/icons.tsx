import {
  Briefcase, Camera, Car, CircleHelp, Egg, Factory, GraduationCap, Hammer, HardHat, House, Landmark, Laptop, Milk,
  PawPrint, Scissors, ShoppingBag, Sparkles, Store, Sun, Truck, Wrench, type LucideIcon,
} from 'lucide-react'

/** Activity icons are named in seed data so the backend can add activities without a frontend release. */
const ICONS: Record<string, LucideIcon> = {
  scissors: Scissors, sparkles: Sparkles, sun: Sun, truck: Truck, store: Store, camera: Camera, car: Car, egg: Egg,
  milk: Milk, 'paw-print': PawPrint, 'hard-hat': HardHat, home: House, wrench: Wrench, laptop: Laptop, hammer: Hammer,
  landmark: Landmark, factory: Factory, briefcase: Briefcase, 'shopping-bag': ShoppingBag, 'graduation-cap': GraduationCap,
}

export function ActivityIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? CircleHelp
  return <Icon aria-hidden className={className} />
}
