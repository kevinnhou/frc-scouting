export const baseColours = [
  {
    name: "kodama-grove",
    label: "Kodama Grove",
    activeColour: {
      light: "oklch(0.67 0.11 118.91)",
      dark: "oklch(0.68 0.06 132.45)",
    },
  },
  {
    name: "claude",
    label: "Claude",
    activeColour: {
      light: "oklch(0.56 0.13 43.00)",
      dark: "oklch(0.56 0.13 43.00)",
    },
  },
  {
    name: "claymorphism",
    label: "Claymorphism",
    activeColour: {
      light: "oklch(0.59 0.2 277.12)",
      dark: "oklch(0.68 0.16 276.93)",
    },
  },
  {
    name: "vintage-paper",
    label: "Vintage Paper",
    activeColour: {
      light: "oklch(0.62 0.08 65.54)",
      dark: "oklch(0.73 0.06 66.7)",
    },
  },
] as const;

export type BaseColor = (typeof baseColours)[number];
