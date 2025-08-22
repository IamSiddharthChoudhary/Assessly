import {
  BarChart3,
  Calendar,
  Code,
  FileText,
  Play,
  Target,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function FeatureCards() {
  const features = [
    {
      icon: Code,
      title: "Real-time Collaborative Editor",
      description:
        "Write, edit, and review code together with syntax highlighting for 8+ programming languages",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Play,
      title: "Live Code Execution",
      description:
        "Run and test code instantly during interviews with our built-in execution engine",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Target,
      title: "Structured Interview Flow",
      description:
        "Pre-defined workflows, coding challenges, and assessment templates ready to use",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Track performance, analyze solutions, and get detailed insights on candidate skills",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Calendar,
      title: "Interview Management",
      description:
        "Schedule, organize, and manage technical interviews with role-based access control",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: FileText,
      title: "Comprehensive Recording",
      description:
        "Capture code changes, execution results, and discussion history for thorough review",
      gradient: "from-teal-500 to-green-500",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <Card
          key={index}
          className="bg-gradient-to-br from-gray-900/90 to-black/90 border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 group"
        >
          <CardHeader className="space-y-4">
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
              {feature.title}
            </CardTitle>
            <CardDescription className="text-gray-300 leading-relaxed">
              {feature.description}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
