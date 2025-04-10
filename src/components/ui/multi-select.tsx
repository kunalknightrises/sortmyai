
import * as React from "react";
import { X, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholderText?: string;
  loading?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholderText = "Search...",
  loading = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selected = options.filter((option) => value.includes(option.value));

  return (
    <div className="relative">
      <div
        className="relative w-full border border-input rounded-md flex flex-wrap gap-1 p-1 min-h-[38px] cursor-text"
        onClick={() => setOpen(true)}
      >
        {selected.map((option) => (
          <Badge
            key={option.value}
            variant="secondary"
            className="max-w-[calc(100%-8px)] truncate"
          >
            {option.label}
            <button
              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(value.filter((v) => v !== option.value));
              }}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
      </div>
      {open && (
        <div className="absolute w-full z-10 top-[calc(100%+4px)] rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
          <Command className="w-full">
            <CommandInput 
              placeholder={loading ? "Loading..." : placeholderText}
              value={search}
              onValueChange={setSearch}
              disabled={loading}
            />
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(
                      value.includes(option.value)
                        ? value.filter((v) => v !== option.value)
                        : [...value, option.value]
                    );
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>
      )}
    </div>
  );
}
