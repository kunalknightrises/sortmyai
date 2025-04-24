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
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  placeholder,
  options,
  value,
  onValueChange,
  onOptionSelect,
  selectedOptions
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search input
  useEffect(() => {
    if (value) {
      const filtered = options.filter(option => 
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [value, options]);

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
          className="pl-10 pr-10 bg-sortmy-darker/50 border-sortmy-blue/20"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          onClick={() => setIsOpen(!isOpen)}
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
              className="bg-sortmy-blue hover:bg-sortmy-blue/80 cursor-pointer"
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
        <div className="absolute z-10 w-full mt-1 bg-sortmy-darker border border-sortmy-blue/20 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((option) => (
                <li
                  key={option}
                  className={`px-4 py-2 cursor-pointer hover:bg-sortmy-blue/10 ${
                    selectedOptions.includes(option) ? 'bg-sortmy-blue/20' : ''
                  }`}
                  onClick={() => {
                    onOptionSelect(option);
                    onValueChange('');
                  }}
                >
                  {option}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-gray-400">No matching options</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
