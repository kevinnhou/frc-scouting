import { Helper } from "~/form/help";
import { MatchScoutingForm } from "~/form/match-scouting";

export default function MatchScouting() {
  return (
    <>
      <Helper />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <MatchScoutingForm />
      </div>
    </>
  );
}
