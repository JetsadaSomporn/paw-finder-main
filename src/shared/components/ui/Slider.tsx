import React, { useState, Children, ReactNode, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SliderProps {
  children: ReactNode;
  className?: string;
  itemsPerPage?: number;
}

export const Slider: React.FC<SliderProps> = ({
  children,
  className,
  itemsPerPage = 1,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const childrenArray = Children.toArray(children);
  const totalItems = childrenArray.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goToPrevious = () => {
    setCurrentPage((prevPage) => Math.max(0, prevPage - 1));
  };

  const goToNext = () => {
    setCurrentPage((prevPage) => Math.min(totalPages - 1, prevPage + 1));
  };

  const pages = useMemo(() => {
    const p = [];
    for (let i = 0; i < totalItems; i += itemsPerPage) {
      p.push(childrenArray.slice(i, i + itemsPerPage));
    }
    return p;
  }, [childrenArray, itemsPerPage, totalItems]);

  if (totalItems === 0) {
    return null;
  }

  const itemWidth = 100 / itemsPerPage;

  return (
    <div className={cn('relative w-full', className)}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform ease-out duration-300"
          style={{ transform: `translateX(-${currentPage * 100}%)`, touchAction: 'pan-y' }}
        >
          {pages.map((page, pageIndex) => (
            <div
              key={pageIndex}
              className="w-full flex-shrink-0 flex justify-start"
            >
              {page.map((child, childIndex) => (
                <div
                  key={childIndex}
                  style={{ width: `${itemWidth}%` }}
                  className="flex-shrink-0"
                >
                  {child}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </>
      )}
    </div>
  );
};

export default Slider; 