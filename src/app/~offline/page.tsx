import { Helper } from "@/components/form/help";
import { MatchScoutingForm } from "@/components/form/match-scouting";

export default function OfflineScouting() {
  return (
    <>
      <Helper />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-center text-3xl font-bold">Scouting Form</h1>
        <p className="pb-6 text-center font-sans text-xl tracking-wide">
          Record and Export Data via QR Codes
        </p>
        <MatchScoutingForm />
      </div>
    </>
  );
}
