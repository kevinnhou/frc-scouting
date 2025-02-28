"use server";

import { google } from "googleapis";
import { z } from "zod";

import { autonomous, teleop, misc } from "@/lib/match-scouting";

const formSchema = z.object({
  ...Object.fromEntries(autonomous.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(teleop.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(misc.map((field) => [field.name, field.schema])),
  spreadsheetID: z.string().optional(),
  sheetID: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;
type TFormDataKeys = keyof Omit<FormData, "spreadsheetID" | "sheetID">;

export async function submit(data: FormData) {
  const validatedData = formSchema.parse(data);

  const { spreadsheetID, sheetID, ...formData } = validatedData;

  if (!spreadsheetID || !sheetID) {
    throw new Error("Spreadsheet details are missing.");
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

    const sheets = google.sheets({ version: "v4", auth });

    const autoCycles = Object.values(
      formData["Autonomous Cycles" as TFormDataKeys]
    ).slice(0, -1);

    const teleopCycles = Object.values(
      formData["Teleop Cycles" as TFormDataKeys]
    ).slice(0, -1);

    const notes = Object.values(formData["Extra Notes" as TFormDataKeys]);

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
        formData["Autonomous Cycles" as TFormDataKeys]["Cycle Times"]
      ),
      teleopCycles[0],
      teleopCycles[1],
      teleopCycles[2],
      teleopCycles[3],
      teleopCycles[4],
      teleopCycles[5],
      JSON.stringify(formData["Teleop Cycles" as TFormDataKeys]["Cycle Times"]),
      formData["Cage Level" as TFormDataKeys],
      JSON.stringify(formData["Cage Time" as TFormDataKeys]),
      formData["Drive Team Ability" as TFormDataKeys],
      formData["Penalties" as TFormDataKeys],
      formData["Defense" as TFormDataKeys],
      formData["Scoring Behind Reef" as TFormDataKeys],
      notes[0],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetID,
      range: sheetID,
      valueInputOption: "RAW",
      requestBody: {
        values: [values],
      },
    });

    return { success: true, message: "Form submitted successfully." };
  } catch (error) {
    console.error(
      "Form submission failed:",
      error instanceof Error ? error.message : "Unknown error occurred."
    );
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return { success: false, message: `Validation failed: ${errorMessages}` };
    }
    return { success: false, message: "Form submission failed." };
  }
}
