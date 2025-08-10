import React from "react";
import { provinces } from "../../../data/provinces";
import { cn } from "../../../lib/utils";
import { Label } from "../../../shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import { PetFilters } from "../types";
import { petTypes } from "../constants/pet.constant";

interface PetSearchFiltersClassNames {
  container?: string;
  fieldGroup?: string;
  label?: string;
  select?: string;
  input?: string;
  searchButton?: string;
  searchButtonIcon?: string;
  searchButtonText?: string;
}

interface PetSearchFiltersProps {
  filters: PetFilters;
  onFilterChange: (key: keyof PetFilters, value: string) => void;
  onSearch?: () => void;
  loading?: boolean;
  classNames?: PetSearchFiltersClassNames;
}

export const PetSearchFilters: React.FC<PetSearchFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  loading = false,
  classNames = {},
}) => {
  return (
    <div className={cn("space-y-6", classNames.container)}>
      <div className={cn("", classNames.fieldGroup)}>
        <Label className={cn("mb-1 block text-[#2B2B2B] font-medium", classNames.label)}>พื้นที่</Label>
        <Select
          value={filters.province}
          onValueChange={(value) => onFilterChange("province", value)}
        >
          <SelectTrigger className={cn("border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]", classNames.select)}>
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {provinces.map((province) => (
              <SelectItem key={province.value} value={province.value}>
                {province.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn("", classNames.fieldGroup)}>
        <Label className={cn("mb-1 block text-[#2B2B2B] font-medium", classNames.label)}>
          ประเภทสัตว์เลี้ยง
        </Label>
        <Select
          value={filters.petType}
          onValueChange={(value) => onFilterChange("petType", value)}
        >
          <SelectTrigger className={cn("border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]", classNames.select)}>
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {petTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn("", classNames.fieldGroup)}>
        {onSearch && (
          <button
            type="button"
            className={cn(
              "w-full mt-4 bg-[#F4A261] hover:bg-[#E8956A] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed",
              classNames.searchButton
            )}
            disabled={loading}
            onClick={onSearch}
          >
            <svg
              className={cn("h-4 w-4", classNames.searchButtonIcon)}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className={classNames.searchButtonText}>
              ค้นหาและดูแผนที่
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
