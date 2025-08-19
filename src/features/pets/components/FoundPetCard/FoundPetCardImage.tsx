import { FoundPet } from '@/features/pets/types';
import { formatRelativeDate } from '../../utils/dateUtils';

const PLACEHOLDER_IMAGE = '/cat-placeholder.png';

interface ImageSectionProps {
  pet: FoundPet;
}

const FoundPetCardImage = ({ pet }: ImageSectionProps) => {
  const imageUrl = pet.images?.[0]?.image_url || PLACEHOLDER_IMAGE;

  function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = PLACEHOLDER_IMAGE;
  }
  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt={pet.breed}
        className="w-full h-56 object-contain bg-[#F4A261]"
        onError={handleImgError}
      />
      <div className="absolute top-3 right-3 bg-[#F4A261] text-white text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full shadow">
        พบเมื่อ {formatRelativeDate(pet.found_date)}
      </div>
    </div>
  );
};

export default FoundPetCardImage;
