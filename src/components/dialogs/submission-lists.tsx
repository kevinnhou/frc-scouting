"use client";

import { Search } from "lucide-react";

import { Badge } from "~/ui/badge";
import { Button } from "~/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/card";
import { DialogDescription, DialogHeader, DialogTitle } from "~/ui/dialog";
import { Input } from "~/ui/input";

interface SubmissionCardProps {
  handleFormLoad: (index: number) => void;
  handleSelection: (index: number) => void;
  index: number;
  submission: any;
}

interface SubmissionsListProps {
  filteredSubmissions: any[];
  handleFormLoad: (index: number) => void;
  handleSelection: (index: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function SubmissionsList({
  filteredSubmissions,
  handleFormLoad,
  handleSelection,
  searchTerm,
  setSearchTerm,
}: SubmissionsListProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Stored Submissions</DialogTitle>
        <DialogDescription>
          Select a submission to view or edit its details
        </DialogDescription>
      </DialogHeader>

      <div className="my-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            autoComplete="off"
            className="pl-8"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Team Number, Name or Match"
            value={searchTerm}
          />
        </div>
      </div>

      <div className="-mx-6 flex-1 overflow-y-auto px-6">
        {filteredSubmissions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubmissions.map((submission, index) => (
              <SubmissionCard
                handleFormLoad={handleFormLoad}
                handleSelection={handleSelection}
                index={index}
                key={index}
                submission={submission}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            {searchTerm
              ? "No matching submissions found"
              : "No submissions available"}
          </div>
        )}
      </div>
    </>
  );
}

function SubmissionCard({
  handleFormLoad,
  handleSelection,
  index,
  submission,
}: SubmissionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          Team {String(submission["Team Number"]).substring(0, 5)}
          <Badge variant="outline">
            Match {String(submission["Qualification Number"]).substring(0, 3)}
          </Badge>
        </CardTitle>
        <CardDescription className="truncate">
          {submission["Team Name"] || "No team name"}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between pt-2">
        <Button
          onClick={() => handleFormLoad(index)}
          size="sm"
          variant="outline"
        >
          Load
        </Button>
        <Button
          onClick={() => handleSelection(index)}
          size="sm"
          variant="default"
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
}
