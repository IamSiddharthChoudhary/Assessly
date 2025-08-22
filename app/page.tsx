"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ShaderBg from "@/components/shaderBg";
import Navbar from "@/components/navbar";
import FeatureComparison from "@/components/featureComparison";
import StatsSection from "@/components/statsSection";
import {
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Twitter,
} from "lucide-react";
import FeatureCards from "@/components/featureCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [shaderIndex, setShaderIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;

      const numSections = 5;
      const section = Math.min(
        numSections - 1,
        Math.floor((scrollY / maxScroll) * numSections)
      );

      setShaderIndex(section);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black sensation-regular w-full">
      <ShaderBg index={shaderIndex} />
      <div className="relative overflow-hidden flex flex-col justify-center">
        <Navbar />
        <div className="relative container mx-auto py-24 w-screen sansation-bold">
          <div className="text-center w-full mx-auto">
            <h1 className="text-7xl font-bold text-white mb-6 leading-tight">
              Conduct{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-500">
                Technical Interviews
              </span>{" "}
              <span className="major-mono-display-regular">fluidly</span>,
              without friction.
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Conduct seamless coding interviews with real-time collaboration,
              HD video calls, and comprehensive assessment tools. Make better
              hiring decisions faster.
            </p>
            <div className="inline-block rounded-3xl m-6 mt-0 p-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              <Button
                className="rounded-3xl bg-black text-white text-lg font-semibold px-8 py-3
               hover:bg-gradient-to-r hover:from-pink-500 via-purple-500 to-blue-500
               duration-300 ease-in-out hover:scale-110 transition-transform"
              >
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>

            <div className="flex flex-col justify-center z-10 rounded-2xl overflow-hidden">
              <img
                src="/pv.png"
                className="rounded-3xl mx-auto w-[70vw]"
                alt=""
              />
            </div>
          </div>
          <div className="container mx-auto px-6 py-20">
            <div
              className={`transition-all duration-1000 delay-300 ${
                true ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <StatsSection />
            </div>
          </div>
          <div className="container mx-auto px-6 py-20">
            <div
              className={`transition-all duration-1000 delay-500 ${
                true ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Why Assessly Beats Generic Video Tools
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  While Zoom and Google Meet are great for meetings, technical
                  interviews need specialized tools. Assessly provides
                  everything you need in one seamless platform.
                </p>
              </div>
              <FeatureComparison />
            </div>
          </div>
          <div className="container mx-auto px-6 py-20">
            <div
              className={`transition-all duration-1000 delay-700 ${
                true ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-green-100">
                  Complete Technical Interview{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                    Ecosystem
                  </span>
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Every feature purpose-built for evaluating programming skills
                  and making better hiring decisions.
                </p>
              </div>
              <FeatureCards />
            </div>
          </div>
          <div className="container mx-auto px-6 py-20 mb-0 pb-0">
            <div
              className={`transition-all duration-1000 delay-900 ${
                true ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="text-center bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-12 border border-white/10 backdrop-blur-sm">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-50">
                  Ready to Transform Your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    Technical Hiring?
                  </span>
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join companies that have moved beyond generic video tools to
                  purpose-built technical interview solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    size="lg"
                    className="text-lg px-10 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 text-black font-bold"
                  >
                    <Link href="/auth/sign-up">Start Free</Link>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative bg-black/50 backdrop-blur-sm border-t border-white/10 flex justify-center">
          <div className="container mx-auto px-6 py-16">
            <div className="flex justify-center">
              <div className="lg:col-span-1">
                <h3 className="text-2xl font-bold text-white mb-4 major-mono-display-regular">
                  Assessly
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  The future of technical interviews. Streamlined, powerful, and
                  purpose-built for engineering teams.
                </p>
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-white/10 transition-colors"
                    onClick={() =>
                      router.push("https://github.com/IamSiddharthChoudhary")
                    }
                  >
                    <Github className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-white/10 transition-colors"
                    onClick={() =>
                      router.push(
                        "hhttps://www.linkedin.com/in/siddharth-choudhary-a5a0a8229/"
                      )
                    }
                  >
                    <Linkedin className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 hover:bg-white/10 transition-colors"
                    onClick={() => router.push("https://x.com/csiddharth380")}
                  >
                    <Twitter className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
