import { z } from "zod";

import {
  requiredString,
  requiredNumber,
  cycleSchema,
  cageTime,
  notes,
} from "./schema";

export const autonomous = [
  {
    name: "Team Name",
    type: "input",
    schema: requiredString,
  },
  {
    name: "Team Number",
    type: "input",
    schema: requiredNumber,
  },
  {
    name: "Qualification Number",
    type: "input",
    schema: requiredNumber,
  },
  {
    name: "Starting Position",
    type: ["Processor", "Middle", "Non-Processor"],
    schema: z.enum(["Processor", "Middle", "Non-Processor"]),
  },
  {
    name: "Preload",
    type: ["Yes", "No"],
    schema: z.enum(["Yes", "No"]),
  },
  {
    name: "Route",
    type: "input",
    schema: requiredString,
  },
  {
    name: "Autonomous Cycles",
    type: "cycles",
    schema: cycleSchema,
  },
];

export const teleop = [
  {
    name: "Teleop Cycles",
    type: "cycles",
    schema: cycleSchema,
  },
];

export const misc = [
  {
    name: "Cage Level",
    type: ["Deep", "Shallow", "None"],
    schema: z.enum(["Deep", "Shallow", "None"]),
  },
  {
    name: "Cage Time",
    type: "stopwatch",
    schema: cageTime,
  },
  {
    name: "Drive Team Ability",
    type: "input",
    schema: requiredString,
  },
  {
    name: "Penalties",
    type: ["Yes", "No"],
    schema: z.enum(["Yes", "No"]),
  },
  {
    name: "Defense",
    type: ["Yes", "No"],
    schema: z.enum(["Yes", "No"]),
  },
  {
    name: "Scoring Behind Reef",
    type: ["Yes", "No"],
    schema: z.enum(["Yes", "No"]),
  },
  {
    name: "Extra Notes",
    type: "notes",
    schema: notes,
  },
];
