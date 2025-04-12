export const site = {
  author: {
    links: "https://github.com/kevinnhou",
    name: "Kevin Hou",
  },
  description:
    "Scouting Application for the 2024/2025 First Robotics Challenge - Reefscape",
  keywords: [
    "FRC",
    "First Robotics Challenge",
    "Reefscape",
    "robotics",
    "scouting app",
    "scouting",
    "strategy",
    "analysis",
    "open source",
  ],
  links: {
    repo: "https://github.com/kevinnhou/frc-scouting",
    url:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://frc-scouting.vercel.app",
  },
  name: {
    default: "rec | First Robotics Scouting Application",
    short: "rec.",
  },
};
