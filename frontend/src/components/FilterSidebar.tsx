"use client";

"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { FilterParams } from "../types";

interface FilterSidebarProps {
  onApplyFilters: (filters: FilterParams) => void;
}

export default function FilterSidebar({ onApplyFilters }: FilterSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activity, setActivity] = useState("");
  const [reversibility, setReversibility] = useState("");
  const [quantityByRange, setQuantityByRange] = useState([0.0, 10.0]);
  const [quantityType, setQuantityType] = useState("");
  const [ic50Range, setIc50Range] = useState([0.0, 20.0]);

  const [molweightMin, setMolweightMin] = useState("");
  const [molweightMax, setMolweightMax] = useState("");
  const [additionalOptions, setAdditionalOptions] = useState<string[]>([]);

  const activityOptions = ["+", "-"];
  const reversibilityOptions = ["+", "-", "not tested"];
  const quantityOptions = ["available", "not available", "numeric range"];
  const additionalOptionsList = [
    "Compound",
    "Origin",
    "Reference",
    "Smiles",
    "Synonyms",
    "Subclass",
    "Molecular Formula",
  ];

  const handleAdditionalOptionChange = (option: string, checked: boolean) => {
    if (checked) {
      setAdditionalOptions([...additionalOptions, option]);
    } else {
      setAdditionalOptions(additionalOptions.filter((o) => o !== option));
    }
  };

  const handleApplyFilters = () => {
    const filters: FilterParams = {
      query: searchQuery || undefined,
      activity: activity === "not tested" ? "" : activity || undefined,
      reversibility: reversibility || undefined,

      quantity_type:
        quantityType === "numeric range"
          ? "numeric"
          : quantityType || undefined,

      // Only set min/max quantity when using numeric range
      min_quantity:
        quantityType === "numeric range" ? quantityByRange[0] : undefined,
      max_quantity:
        quantityType === "numeric range" ? quantityByRange[1] : undefined,
      min_molweight: molweightMin ? parseFloat(molweightMin) : undefined,
      max_molweight: molweightMax ? parseFloat(molweightMax) : undefined,
      selected_fields:
        additionalOptions.length > 0 ? additionalOptions : undefined,
    };

    console.log("Applying filters:", filters);
    onApplyFilters(filters);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setActivity("");
    setReversibility("");
    setQuantityByRange([0.0, 10.0]);
    setMolweightMin("");
    setMolweightMax("");
    setAdditionalOptions([]);

    // Clear filters in parent component too
    onApplyFilters({});
  };
  return (
    <div className="w-64 bg-white rounded-xl shadow-lg p-6 space-y-6 font-['Inter',_system-ui,_sans-serif]">
      {/* activity*/}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Actin Disruption Activity
        </h3>
        <div className="space-y-2">
          <Select value={activity} onValueChange={setActivity}>
            <SelectTrigger>
              <SelectValue placeholder="Select activity " />
            </SelectTrigger>
            <SelectContent>
              {activityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reversibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Reversibility</h3>
        <div className="space-y-2">
          <Select value={reversibility} onValueChange={setReversibility}>
            <SelectTrigger>
              <SelectValue placeholder="Select reversibility" />
            </SelectTrigger>
            <SelectContent>
              {reversibilityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Quantity</h3>
        <div className="space-y-2">
          <Select value={quantityType} onValueChange={setQuantityType}>
            <SelectTrigger>
              <SelectValue placeholder="Select quantity type" />
            </SelectTrigger>
            <SelectContent>
              {quantityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {quantityType === "numeric range" && (
          <div className="space-y-3">
            <Slider
              value={quantityByRange}
              onValueChange={setQuantityByRange}
              max={10}
              min={0}
              step={0.1}
              className="w-full [&_[role=slider]]:bg-[#2563EB] [&_[role=slider]]:border-[#2563EB]"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{quantityByRange[0].toFixed(1)} mg</span>
              <span>{quantityByRange[1].toFixed(1)} mg</span>
            </div>
          </div>
        )}
      </div>

      {/* Total Molweight */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Total Molweight</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700">Min</Label>
              <Input
                type="number"
                placeholder="Min value"
                value={molweightMin}
                onChange={(e) => setMolweightMin(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700">Max</Label>
              <Input
                type="number"
                placeholder="Max value"
                value={molweightMax}
                onChange={(e) => setMolweightMax(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search for ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Additional Options 
        </h3>
        <div className="space-y-3">
          {additionalOptionsList.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={additionalOptions.includes(option)}
                onCheckedChange={(checked) =>
                  handleAdditionalOptionChange(option, checked as boolean)
                }
                className="data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
              />
              <Label htmlFor={option} className="text-sm text-gray-700">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>


      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <Button
          className="w-full bg-[#2563EB] hover:bg-[#1e40af] text-white rounded-lg h-12 font-medium"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
        <div className="text-center">
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
