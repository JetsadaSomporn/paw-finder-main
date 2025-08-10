import { X } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';

import { PetType } from '../types';
import {
  getPetBreedOptions,
  getPetColorOptions,
  getPetPatternOptions,
} from '../utils/pet.util';

interface PetCharacteristicsProps {
  breed: string;
  pattern: string;
  colors: string[];
  onBreedChange: (breed: string) => void;
  onPatternChange: (pattern: string) => void;
  onColorsChange: (colors: string[]) => void;
  petType: PetType;
}

export const PetCharacteristics: React.FC<PetCharacteristicsProps> = ({
  breed,
  pattern,
  colors,
  onBreedChange,
  onPatternChange,
  onColorsChange,
  petType,
}) => {
  const [customBreed, setCustomBreed] = useState('');
  const [customPattern, setCustomPattern] = useState('');
  const [customColor, setCustomColor] = useState('');

  const handleBreedChange = (value: string) => {
    if (value === 'custom') {
      onBreedChange(customBreed);
    } else {
      onBreedChange(value);
    }
  };

  const handlePatternChange = (value: string) => {
    if (value === 'custom') {
      onPatternChange(customPattern);
    } else {
      onPatternChange(value);
    }
  };

  const addColor = (color: string) => {
    if (color && !colors.includes(color) && colors.length < 3) {
      onColorsChange([...colors, color]);
    }
  };

  const removeColor = (colorToRemove: string) => {
    onColorsChange(colors.filter((color) => color !== colorToRemove));
  };

  const addCustomColor = () => {
    if (customColor && !colors.includes(customColor) && colors.length < 3) {
      onColorsChange([...colors, customColor]);
      setCustomColor('');
    }
  };

  const colorOptions = getPetColorOptions(petType);
  const breedOptions = getPetBreedOptions(petType);
  const patternOptions = getPetPatternOptions(petType);

  return (
    <div className="space-y-6">
      {/* Breed Selection */}
      <div className="space-y-3">
        <Label>พันธุ์ (Type)</Label>
        <div className="flex flex-wrap gap-2">
          {breedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleBreedChange(option.value)}
              className={cn(
                'px-3 py-1 rounded-full text-sm border transition-colors',
                breed === option.value
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {breed === 'custom' && (
          <div className="flex gap-2">
            <Input
              value={customBreed}
              onChange={(e) => setCustomBreed(e.target.value)}
              placeholder="ระบุพันธุ์"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => handleBreedChange('custom')}
              variant="secondary"
            >
              ยืนยัน
            </Button>
          </div>
        )}
      </div>

      {/* Pattern Selection */}
      <div className="space-y-3">
        <Label>ลาย (Pattern)</Label>
        <div className="flex flex-wrap gap-2">
          {patternOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePatternChange(option.value)}
              className={cn(
                'px-3 py-1 rounded-full text-sm border transition-colors',
                pattern === option.value
                  ? 'bg-green-100 border-green-300 text-green-700'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {pattern === 'custom' && (
          <div className="flex gap-2">
            <Input
              value={customPattern}
              onChange={(e) => setCustomPattern(e.target.value)}
              placeholder="ระบุลาย"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => handlePatternChange('custom')}
              variant="secondary"
            >
              ยืนยัน
            </Button>
          </div>
        )}
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <Label>สี (Color) - เลือกได้สูงสุด 3 สี</Label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((option: { value: string; label: string }) => (
            <button
              key={option.value}
              type="button"
              onClick={() => addColor(option.value)}
              disabled={colors.length >= 3 || colors.includes(option.value)}
              className={cn(
                'px-3 py-1 rounded-full text-sm border transition-colors',
                colors.includes(option.value)
                  ? 'bg-orange-100 border-orange-300 text-orange-700'
                  : colors.length >= 3
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="flex gap-2">
          <Input
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="ระบุสีเพิ่มเติม"
            className="flex-1"
            disabled={colors.length >= 3}
          />
          <Button
            type="button"
            onClick={addCustomColor}
            variant="secondary"
            disabled={!customColor || colors.length >= 3}
          >
            เพิ่ม
          </Button>
        </div>

        {/* Selected Colors Display */}
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <div
                key={color}
                className="flex items-center gap-1 px-3 py-1 bg-orange-100 border border-orange-300 text-orange-700 rounded-full text-sm"
              >
                <span>
                  {colorOptions.find(
                    (c: { value: string; label: string }) => c.value === color
                  )?.label || color}
                </span>
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="ml-1 hover:text-orange-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
