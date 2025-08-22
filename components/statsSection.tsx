import { Clock, Code, Monitor, Zap } from "lucide-react";

export default function StatsSection() {
  const stats = [
    { value: "8+", label: "Programming Languages", icon: Code },
    { value: "100ms", label: "Code Execution Speed", icon: Zap },
    { value: "99.9%", label: "Uptime Guarantee", icon: Monitor },
    { value: "50%", label: "Faster Hiring Process", icon: Clock },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <div key={index} className="text-center group">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
            <stat.icon className="w-8 h-8 text-blue-400 group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="text-4xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
            {stat.value}
          </div>
          <div className="text-gray-400 text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
