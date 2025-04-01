"use server";

import { google } from "googleapis";
import { z } from "zod";

import { autonomous, misc, teleop } from "@/lib/match-scouting";

const formSchema = z.object({
  ...Object.fromEntries(autonomous.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(teleop.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(misc.map((field) => [field.name, field.schema])),
  sheetID: z.string().optional(),
  spreadsheetID: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;
type TFormDataKeys = keyof Omit<FormData, "sheetID" | "spreadsheetID">;

export async function submit(data: FormData) {
  const validatedData = formSchema.parse(data);

  const { sheetID, spreadsheetID, ...formData } = validatedData;

  if (!spreadsheetID || !sheetID) {
    return {
      localSuccess: true,
      message:
        "Spreadsheet details are missing. Please configure your spreadsheet ID and sheet ID in settings.",
      success: false,
    };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({ auth, version: "v4" });

    const autoCycles = Object.values(
      formData["Autonomous Cycles" as TFormDataKeys],
    ).slice(0, -1);

    const autoMissed = Object.values(
      formData["Autonomous Missed" as TFormDataKeys],
    );

    const teleopCycles = Object.values(
      formData["Teleop Cycles" as TFormDataKeys],
    ).slice(0, -1);

    const teleopMissed = Object.values(
      formData["Teleop Missed" as TFormDataKeys],
    );

    // Type-safe access to Extra Notes
    const extraNotes = formData["Extra Notes" as TFormDataKeys] as {
      tags: string[];
      text: string;
    };

    const values = [
      formData["Team Number" as TFormDataKeys],
      formData["Qualification Number" as TFormDataKeys],
      formData["Starting Position" as TFormDataKeys],
      formData["Preload" as TFormDataKeys],
      formData["Route" as TFormDataKeys],
      autoCycles[0],
      autoCycles[1],
      autoCycles[2],
      autoCycles[3],
      autoCycles[4],
      autoCycles[5],
      JSON.stringify(
        formData["Autonomous Cycles" as TFormDataKeys]["Cycle Times"],
      ),
      autoMissed[0],
      autoMissed[1],
      autoMissed[2],
      teleopCycles[0],
      teleopCycles[1],
      teleopCycles[2],
      teleopCycles[3],
      teleopCycles[4],
      teleopCycles[5],
      JSON.stringify(formData["Teleop Cycles" as TFormDataKeys]["Cycle Times"]),
      teleopMissed[0],
      teleopMissed[1],
      teleopMissed[2],
      formData["Cage Level" as TFormDataKeys],
      JSON.stringify(formData["Cage Time" as TFormDataKeys]),
      formData["Drive Team Ability" as TFormDataKeys],
      formData["Penalties" as TFormDataKeys],
      formData["Defense" as TFormDataKeys],
      formData["Scoring Behind Reef" as TFormDataKeys],
      extraNotes.text,
    ];

    await sheets.spreadsheets.values.append({
      range: sheetID,
      requestBody: {
        values: [values],
      },
      spreadsheetId: spreadsheetID,
      valueInputOption: "RAW",
    });

    return { message: "Form submitted successfully.", success: true };
  } catch (error) {
    console.error(
      "Form submission failed:",
      error instanceof Error ? error.message : "Unknown error occurred.",
    );
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return { message: `Validation failed: ${errorMessages}`, success: false };
    }
    return { message: "Form submission failed.", success: false };
  }
}
