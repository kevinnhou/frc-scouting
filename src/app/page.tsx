"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { toast } from "sonner";

import { site } from "@/config/site";

import { Github } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    dataStoredKB: 0,
    uniqueTeams: 0,
  });

  const noStats = stats.totalSubmissions === 0 && stats.uniqueTeams === 0;

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("formSubmissions");
      if (storedData) {
        const dataSizeBytes = new Blob([storedData]).size;
        const dataSizeKB = Math.round((dataSizeBytes / 1024) * 10) / 10;

        const submissions = JSON.parse(storedData);

        if (Array.isArray(submissions)) {
          const totalSubmissions = submissions.length;

          const uniqueTeamNumbers = new Set();
          submissions.forEach((sub) => {
            if (sub["Team Number"]) {
              uniqueTeamNumbers.add(sub["Team Number"]);
            }
          });

          setStats({
            totalSubmissions,
            dataStoredKB: dataSizeKB,
            uniqueTeams: uniqueTeamNumbers.size,
          });
        }
      }
    } catch (error) {
      toast.error("Error calculating statistics");
      console.error("Error calculating statistics:", error);
    }
  }, []);

  return (
    <div className="h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col py-6">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          <div className="flex flex-col justify-center text-center lg:text-left">
            <h1 className="text-7xl md:text-4xl font-light mb-3 mx-auto lg:mx-0 lg:text-5xl">
              {site.name.short}
            </h1>
            <p className="text-foreground/50 mb-6 max-w-md mx-auto lg:mx-0">
              {site.description}
            </p>
            <div className="flex gap-4 mb-6 justify-center lg:justify-start">
              <Button asChild>
                <Link href="/match">Start Scouting</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href="https://github.com/kevinnhou/frc-scouting"
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </Link>
              </Button>
            </div>

            <div>
              <div className="flex items-center mb-3 justify-center lg:justify-start">
                <p className="text-sm text-foreground/50">Your scouting data</p>
                {noStats && (
                  <div className="ml-2 px-2 py-0.5 bg-primary/5 rounded-full">
                    <p className="text-xs text-primary/70">No data yet</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: stats.totalSubmissions, label: "Submissions" },
                  { value: stats.dataStoredKB, label: "KB stored" },
                  { value: stats.uniqueTeams, label: "Teams scouted" },
                ].map((stat, index) => (
                  <div key={index} className={noStats ? "opacity-50" : ""}>
                    <p className="text-2xl font-light">{stat.value}</p>
                    <p className="text-sm text-foreground/50">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:flex items-center justify-center hidden">
            <div className="relative w-full h-[60vh] max-h-[500px]">
              <Image
                src="/hero-image.svg"
                alt="FIRST Robotics Competition Banner"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="py-4 flex flex-col items-center">
          <p className="text-sm text-foreground/50 mb-2">Powered by</p>
          <div className="flex items-center gap-8">
            <div className="h-6">
              <Image
                src="/vercel-logo.svg"
                alt="Vercel"
                width={90}
                height={18}
                className="dark:invert"
              />
            </div>
            <div className="h-6">
              <Image
                src="/google-logo.svg"
                alt="Google"
                width={90}
                height={18}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
