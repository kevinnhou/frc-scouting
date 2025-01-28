"use server";

import { google } from "googleapis";
import { z } from "zod";

import { autonomous, teleop, misc } from "@/lib/match-scouting";

const formSchema = z.object({
  ...Object.fromEntries(autonomous.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(teleop.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(misc.map((field) => [field.name, field.schema])),
});

export async function submit(data: z.infer<typeof formSchema>) {
  const validatedData = formSchema.parse(data);

  const spreadsheetID = "";
  const sheetID = "";

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

    const values = [
      validatedData["Team Number"],
      validatedData["Team Name"],
      validatedData["Qualification Number"],
      validatedData["Starting Position"],
      validatedData["Preload"],
      JSON.stringify(validatedData["Autonomous Cycles"]),
      JSON.stringify(validatedData["Teleop Cycles"]),
      validatedData["Cage Level"],
      JSON.stringify(validatedData["Cage Time"]),
      validatedData["Drive Team Ability"],
      validatedData["Penalties"],
      validatedData["Defense"],
      validatedData["Scoring Behind Reef"],
      JSON.stringify(validatedData["Extra Notes"]),
    ];

    console.log(values);

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
