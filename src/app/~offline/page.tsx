import { Helper } from "@/components/form/help"
import { MatchScoutingForm } from "@/components/form/match-scouting"

export default function OfflineScouting() {
  return (
    <>
      <Helper />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center">Scouting Form</h1>
        <p className="text-xl text-center pb-6 tracking-wide font-sans">
          Record and Export Data via QR Codes
        </p>
        <MatchScoutingForm />
      </div>
    </>
  )
}
