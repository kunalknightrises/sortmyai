import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchableDropdownProps {
  placeholder: string;
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  onOptionSelect: (option: string) => void;
  selectedOptions: string[];
  toolNames?: string[]; // Optional array of tool names for search suggestions
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  placeholder,
  options,
  value,
  onValueChange,
  onOptionSelect,
  selectedOptions,
  toolNames = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [filteredTools, setFilteredTools] = useState<string[]>([]);
  const [showCategories, setShowCategories] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options and tools based on search input
  useEffect(() => {
    if (value) {
      // Filter categories
      const filteredCategories = options.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filteredCategories);

      // Filter tool names
      const filteredToolNames = toolNames.filter(tool =>
        tool.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTools(filteredToolNames);

      // Open the dropdown when typing
      setIsOpen(true);
    } else {
      // If no search input, show all categories
      setFilteredOptions(options);
      setFilteredTools([]);
    }
    // Always show categories
    setShowCategories(true);
  }, [value, options, toolNames]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={placeholder}
          className="pl-10 pr-10 bg-sortmy-darker/50 border-[#01AAE9]/20 focus:border-[#01AAE9]/40 focus:ring-[#01AAE9]/10"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          onClick={() => {
            setIsOpen(!isOpen);
            // If we're opening the dropdown, make sure we show all categories
            if (!isOpen) {
              setFilteredOptions(options);
              setShowCategories(true);
            }
          }}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Selected options */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedOptions.map(option => (
            <Badge
              key={option}
              variant="default"
              className="bg-[#01AAE9] hover:bg-[#01AAE9]/80 cursor-pointer"
              onClick={() => onOptionSelect(option)}
            >
              {option}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-sortmy-darker border border-[#01AAE9]/20 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Show categories section */}
          {showCategories && filteredOptions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-[#01AAE9] font-medium border-b border-[#01AAE9]/10">
                Categories
              </div>
              <ul className="py-1">
                {filteredOptions.map((option) => (
                  <li
                    key={`category-${option}`}
                    className={`px-4 py-2 cursor-pointer hover:bg-[#01AAE9]/10 ${
                      selectedOptions.includes(option) ? 'bg-[#01AAE9]/20' : ''
                    }`}
                    onClick={() => {
                      onOptionSelect(option);
                      onValueChange('');
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-[#01AAE9]">#</span>
                      {option}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Show tools section if we have filtered tools */}
          {filteredTools.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-[#01AAE9] font-medium border-b border-[#01AAE9]/10">
                Tools
              </div>
              <ul className="py-1">
                {filteredTools.map((tool) => (
                  <li
                    key={`tool-${tool}`}
                    className="px-4 py-2 cursor-pointer hover:bg-[#01AAE9]/10"
                    onClick={() => {
                      onValueChange(tool); // Set the search value to the tool name
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-400">🔍</span>
                      {tool}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Show empty state if no results */}
          {filteredOptions.length === 0 && filteredTools.length === 0 && (
            <div className="px-4 py-2 text-gray-400">No matching options</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
