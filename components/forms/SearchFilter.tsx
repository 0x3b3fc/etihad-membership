"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { governorates } from "@/lib/data/governorates";
import { entities } from "@/lib/data/entities";

interface SearchFilterProps {
  onSearch: (search: string) => void;
  onFilter: (governorate: string) => void;
  onEntityFilter: (entityName: string) => void;
  onExport: () => void;
  isExporting?: boolean;
}

export default function SearchFilter({
  onSearch,
  onFilter,
  onEntityFilter,
  onExport,
  isExporting = false,
}: SearchFilterProps) {
  const [search, setSearch] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [entityName, setEntityName] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, onSearch]);

  const governorateOptions = [
    { value: "", label: "جميع المحافظات" },
    ...governorates.map((gov) => ({ value: gov, label: gov })),
  ];

  const entityOptions = [
    { value: "", label: "جميع الوحدات" },
    ...entities.map((entity) => ({ value: entity, label: entity })),
  ];

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setGovernorate(value);
    onFilter(value);
  };

  const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEntityName(value);
    onEntityFilter(value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
      <div className="flex-1 w-full md:w-auto">
        <Input
          placeholder="البحث بالاسم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="w-full md:w-48">
        <Select
          options={governorateOptions}
          value={governorate}
          onChange={handleGovernorateChange}
          placeholder="المحافظة"
        />
      </div>

      <div className="w-full md:w-56">
        <Select
          options={entityOptions}
          value={entityName}
          onChange={handleEntityChange}
          placeholder="الوحدة"
        />
      </div>

      <Button
        variant="secondary"
        onClick={onExport}
        isLoading={isExporting}
        className="w-full md:w-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        تصدير Excel
      </Button>
    </div>
  );
}
