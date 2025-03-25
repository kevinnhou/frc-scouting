/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Search } from "lucide-react";

import { Badge } from "~/badge";
import { Button } from "~/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/card";
import { DialogDescription, DialogHeader, DialogTitle } from "~/dialog";
import { Input } from "~/input";

type SubmissionsListProps = {
  filteredSubmissions: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSelection: (index: number) => void;
  handleFormLoad: (index: number) => void;
};

export function SubmissionsList({
  filteredSubmissions,
  searchTerm,
  setSearchTerm,
  handleSelection,
  handleFormLoad,
}: SubmissionsListProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Stored Submissions</DialogTitle>
        <DialogDescription>
          Select a submission to view or edit its details
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-4 my-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Team Number, Name or Match"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1 -mx-6 px-6">
        {filteredSubmissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubmissions.map((submission, index) => (
              <SubmissionCard
                key={index}
                submission={submission}
                index={index}
                handleSelection={handleSelection}
                handleFormLoad={handleFormLoad}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm
              ? "No matching submissions found"
              : "No submissions available"}
          </div>
        )}
      </div>
    </>
  );
}

type SubmissionCardProps = {
  submission: any;
  index: number;
  handleSelection: (index: number) => void;
  handleFormLoad: (index: number) => void;
};

function SubmissionCard({
  submission,
  index,
  handleSelection,
  handleFormLoad,
}: SubmissionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
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
          variant="outline"
          size="sm"
          onClick={() => handleFormLoad(index)}
        >
          Load Form
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => handleSelection(index)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
