import { CheckCircle, X } from "lucide-react";

export default function FeatureComparison() {
  const features = [
    {
      feature: "Real-time Code Editor",
      assessly: true,
      zoom: false,
      meet: false,
      description:
        "Collaborative coding with syntax highlighting for 8+ languages",
    },
    {
      feature: "Live Code Execution",
      assessly: true,
      zoom: false,
      meet: false,
      description: "Run and test code instantly during interviews",
    },
    {
      feature: "Technical Assessment Tools",
      assessly: true,
      zoom: false,
      meet: false,
      description: "Built-in evaluation and scoring systems",
    },
    {
      feature: "Interview Templates",
      assessly: true,
      zoom: false,
      meet: false,
      description: "Pre-built coding challenges and workflows",
    },
    {
      feature: "Session Analytics",
      assessly: true,
      zoom: false,
      meet: false,
      description: "Performance tracking and detailed metrics",
    },
    {
      feature: "Video Calling",
      assessly: true,
      zoom: true,
      meet: true,
      description: "HD video conferencing capabilities",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border border-white/10">
      <div className="p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Why Choose Assessly Over Generic Video Tools?
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 text-gray-300 font-medium">
                  Feature
                </th>
                <th className="text-center py-4 px-6 text-blue-400 font-bold">
                  Assessly
                </th>
                <th className="text-center py-4 px-6 text-gray-400 font-medium">
                  Zoom
                </th>
                <th className="text-center py-4 px-6 text-gray-400 font-medium">
                  Google Meet
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-white font-medium">
                        {item.feature}
                      </div>
                      <div className="text-sm text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.description}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.assessly ? (
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.zoom ? (
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {item.meet ? (
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-6 h-6 text-red-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
