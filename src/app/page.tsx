/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
"use client";

import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export default function Home() {
  const [stats, setStats] = useState({
    dataStoredKB: 0,
    totalSubmissions: 0,
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
            dataStoredKB: dataSizeKB,
            totalSubmissions,
            uniqueTeams: uniqueTeamNumbers.size,
          });
        }
      }
    }
    catch (error) {
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
              <Button asChild variant="outline">
                <Link
                  className="flex items-center gap-2"
                  href="https://github.com/kevinnhou/frc-scouting"
                  target="_blank"
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
                  { label: "Submissions", value: stats.totalSubmissions },
                  { label: "KB stored", value: stats.dataStoredKB },
                  { label: "Teams scouted", value: stats.uniqueTeams },
                ].map((stat, index) => (
                  <div className={noStats ? "opacity-50" : ""} key={index}>
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
                alt="FIRST Robotics Competition Banner"
                className="object-contain"
                fill
                priority
                src="/hero-image.svg"
              />
            </div>
          </div>
        </div>

        <div className="py-4 flex flex-col items-center">
          <p className="text-sm text-foreground/50 mb-2">Powered by</p>
          <div className="flex items-center gap-8">
            <div className="h-6">
              <Link href="https://vercel.com" target="_blank">
                <Image
                  alt="Vercel"
                  className="dark:invert"
                  height={18}
                  src="/logos/vercel.svg"
                  width={90}
                />
              </Link>
            </div>
            <div className="h-6">
              <Link href="https://about.google" target="_blank">
                <Image
                  alt="Google"
                  height={18}
                  src="/logos/google.svg"
                  width={90}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
