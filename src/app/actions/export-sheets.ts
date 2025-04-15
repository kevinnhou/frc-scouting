"use server";

import { google } from "googleapis";
import { z } from "zod";

const exportRequestSchema = z.object({
  submissions: z.array(z.record(z.any())),
  spreadsheetID: z.string().min(1, { message: "Spreadsheet ID is required" }),
  sheetID: z.string().min(1, { message: "Sheet ID is required" }),
});

type ExportRequest = z.infer<typeof exportRequestSchema>;
type FormDataKeys = string;

export async function exportToGoogleSheets(request: ExportRequest) {
  try {
    const validatedRequest = exportRequestSchema.parse(request);
    const { submissions, spreadsheetID, sheetID } = validatedRequest;

    if (submissions.length === 0) {
      return {
        success: false,
        message: "No submissions to export",
      };
    }

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

    const rows = submissions.map((formData) => {
      const autoCycles = Object.values(
        formData["Autonomous Cycles" as FormDataKeys],
      ).slice(0, -1);

      const autoMissed = Object.values(
        formData["Autonomous Missed" as FormDataKeys],
      );

      const teleopCycles = Object.values(
        formData["Teleop Cycles" as FormDataKeys],
      ).slice(0, -1);

      const teleopMissed = Object.values(
        formData["Teleop Missed" as FormDataKeys],
      );

      const extraNotes = formData["Extra Notes" as FormDataKeys] as {
        tags: string[];
        text: string;
      };

      return [
        formData["Team Number" as FormDataKeys],
        formData["Qualification Number" as FormDataKeys],
        formData["Starting Position" as FormDataKeys],
        formData["Preload" as FormDataKeys],
        formData["Route" as FormDataKeys],
        autoCycles[0],
        autoCycles[1],
        autoCycles[2],
        autoCycles[3],
        autoCycles[4],
        autoCycles[5],
        JSON.stringify(
          formData["Autonomous Cycles" as FormDataKeys]["Cycle Times"],
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
        JSON.stringify(
          formData["Teleop Cycles" as FormDataKeys]["Cycle Times"],
        ),
        teleopMissed[0],
        teleopMissed[1],
        teleopMissed[2],
        formData["Cage Level" as FormDataKeys],
        JSON.stringify(formData["Cage Time" as FormDataKeys]),
        formData["Drive Team Ability" as FormDataKeys],
        formData["Penalties" as FormDataKeys],
        formData["Defense" as FormDataKeys],
        formData["Scoring Behind Reef" as FormDataKeys],
        extraNotes?.text || "",
      ];
    });

    await sheets.spreadsheets.values.append({
      range: sheetID,
      requestBody: {
        values: rows,
      },
      spreadsheetId: spreadsheetID,
      valueInputOption: "RAW",
    });

    return {
      success: true,
      message: `Successfully exported ${submissions.length} submission${submissions.length === 1 ? "" : "s"} to Google Sheets`,
    };
  } catch (error) {
    console.error(
      "Export to Google Sheets failed:",
      error instanceof Error ? error.message : "Unknown error occurred.",
    );

    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return {
        success: false,
        message: `Validation failed: ${errorMessages}`,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Export to Google Sheets failed",
    };
  }
}
