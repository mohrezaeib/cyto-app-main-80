"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Compound } from "../types";
import { useState } from "react";

interface DetailPageProps {
  compound: Compound;
  onBack: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export default function DetailPage({
  compound,
  onBack,
  onNext,
  onPrevious,
  currentIndex,
  totalCount,
}: DetailPageProps) {
  const [imageError, setImageError] = useState(false);
  const compoundName = compound.fields["Compound"];

  // Simple function to get image path
  const getImagePath = (name: string) => {
    if (!name) return "";
    const cleanName = name.replace(/[<>:"/\\|?*]/g, "").trim();
    return `/assets/${encodeURIComponent(cleanName)}.png`;
  };

  const imagePath = getImagePath(compoundName);
  //  const imagePath = compound.fields["Image File "]
  console.log("Compound Name:", compoundName);
  console.log("Image Path:", imagePath);

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
       <div className="p-8">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 hover:bg-white rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1e40af] text-white p-8 rounded-xl shadow-lg mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl mb-2">{compound.fields["Compound"]}</h1>
              <p className="text-blue-100">
                Box ID:{compound.fields["Box ID"]}{" "}
              </p>
              {currentIndex !== undefined && totalCount !== undefined && (
                <p className="text-blue-200 text-sm mt-1">
                  Compound {currentIndex + 1} of {totalCount}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onPrevious}
                disabled={!onPrevious || currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                className="bg-white text-[#2563EB] hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onNext}
                disabled={
                  !onNext ||
                  (currentIndex !== undefined &&
                    totalCount !== undefined &&
                    currentIndex >= totalCount - 1)
                }
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Compound Overview */}
            <Card className="rounded-xl shadow-sm border-gray-200">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="text-lg text-[#2563EB]">
                  Compound Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField
                    label="Compound Name"
                    value={compound.fields["Compound"]}
                  />
                  <DetailField
                    label="Subclass"
                    value={compound.fields["Subclass"] || "-"}
                  />
                </div>
                <Separator className="my-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField
                    label="Origin"
                    value={compound.fields["Origin"]}
                  />
                  <DetailField
                    label="Synonyms"
                    value={compound.fields["Synonyms"] || "-"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Molecular Details */}
            <Card className="rounded-xl shadow-sm border-gray-200">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="text-lg text-[#2563EB]">
                  Molecular Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField
                      label="Formula"
                      value={compound.fields["Molecular Formula"] || "-"}
                    />
                    <DetailField
                      label="Mass"
                      value={
                        compound.fields["Total Molweight"]?.toString() || "-"
                      }
                    />
                  </div>
                  <Separator />
                  <DetailField
                    label="SMILES"
                    value={compound.fields["Smiles"] || "-"}
                    valueClassName="font-mono text-sm break-all bg-gray-50 p-3 rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Biological Activity */}
            <Card className="rounded-xl shadow-sm border-gray-200">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="text-lg text-[#2563EB]">
                  Biological Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailField
                    label="Actin Disruption Activity"
                    value={compound.fields["Actin Disruption Activity"] || "-"}
                  />
                  <DetailField
                    label="IC50"
                    value={compound.fields["IC50"] || "-"}
                  />
                  <DetailField
                    label="Reversibility"
                    value={compound.fields["Reversibilty"] || "-"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* References */}
            <Card className="rounded-xl shadow-sm border-gray-200">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="text-lg text-[#2563EB]">
                  References
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <DetailField
                  label="Reference"
                  value={
                    compound.fields["Reference"] ||
                    "No reference information available"
                  }
                />
              </CardContent>
            </Card>

            {/* Microscopy Images / Experimental Results */}
            <Card className="rounded-xl shadow-sm border-gray-200">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="text-lg text-[#2563EB]">
                  Microscopy Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                    <img
                       src={`/assets/${compound.fields["Image File"]}`}
                      alt={`Microscopy analysis of ${compound.fields["Compound"]}`}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Molecular Structure */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl shadow-sm border-gray-200 sticky top-8">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="text-lg text-[#2563EB]">
                  Molecular Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="aspect-square bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={`data:image/png;base64,${compound.base64_png}`}
                    alt="Molecular Structure"
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">2D Chemical Structure</p>
                </div>

                {/* Quick Info */}
                <div className="mt-6 space-y-3">
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Formula:</div>
                      <div className="text-gray-900">
                        {compound.fields["Molecular Formula"] || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Mass:</div>
                      <div className="text-gray-900">
                        {compound.fields["Total Molweight"] || "-"}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Quantity:</div>
                      <div className="text-gray-900">
                        {compound.fields["Quantity"]}{" "}
                      </div>
                    </div>
                    {/* <div>
                      <div className="text-gray-600">mol_idx</div>
                      <div className="text-gray-900">{compound.fields["Total Molweight"] || '-'}</div>
                    </div> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailFieldProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function DetailField({ label, value, valueClassName = "" }: DetailFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-600 block">{label}:</label>
      <div className={`text-gray-900 ${valueClassName}`}>{value}</div>
    </div>
  );
}
