import {
  Activity, BadgeCheck, BookOpenCheck, Boxes, Briefcase, Building, Building2, CalendarCheck, Cpu,
  FolderArchive, Globe, GraduationCap, Handshake, HardHat, Headset, HeartHandshake, Landmark, Layers,
  LineChart, Lock, Megaphone, MessagesSquare, Network, Orbit, PenLine, ReceiptText, Repeat, Scale,
  Search, ShieldCheck, ShoppingCart, Stethoscope, Store, Target, Telescope, Truck, Users,
  UtensilsCrossed, Wallet, Wheat, Workflow, Bot, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Activity, BadgeCheck, BookOpenCheck, Boxes, Briefcase, Building, Building2, CalendarCheck, Cpu,
  FolderArchive, Globe, GraduationCap, Handshake, HardHat, Headset, HeartHandshake, Landmark, Layers,
  LineChart, Lock, Megaphone, MessagesSquare, Network, Orbit, PenLine, ReceiptText, Repeat, Scale,
  Search, ShieldCheck, ShoppingCart, Stethoscope, Store, Target, Telescope, Truck, Users,
  UtensilsCrossed, Wallet, Wheat, Workflow,
};

/** Renders a catalog icon by name (catalog data stays serialisable). */
export function Icon({ name, className }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? Bot;
  return <Component className={className} aria-hidden />;
}
