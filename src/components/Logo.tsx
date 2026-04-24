import logo from "@/assets/voxaflow-logo.jpg";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="VoxaFlow logo" className="h-9 w-9 rounded-lg object-cover" />
      <span className="font-display text-xl font-bold tracking-tight">VoxaFlow</span>
    </div>
  );
}
