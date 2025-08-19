import { useRewardStore } from '@/features/rewards/stores/useRewardStore';
import { renderPetDescriptionText } from '@/features/rewards/utils/reward.util';
import { translateProvince } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { LostPet } from '../types';
import { calculateDistance } from '@/features/pets/utils/locationUtils';

interface RewardsTableProps {
  // Pets should already be sorted by parent logic (e.g., distance/reward/date)
  lostPets: LostPet[];
  userLocation?: { latitude: number; longitude: number } | null;
}

const RewardsTable: React.FC<RewardsTableProps> = ({ lostPets, userLocation }) => {
  const openModal = useRewardStore((state) => state.openModal);

  // Defensive guards
  const petsList = Array.isArray(lostPets) ? lostPets : [];

  const formatReward = (reward: number | null) => {
    if (reward === null) return '-';
    return `฿${reward.toLocaleString()}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full">
      {/* Desktop Table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left">
          <thead className="text-gray-500">
            <tr className="border-b-2">
              <th className="py-4 px-2 font-normal">อันดับ</th>
              <th className="py-4 px-2 font-normal">ชื่อแมว</th>
              <th className="py-4 px-2 font-normal">รายละเอียด</th>
              <th className="py-4 px-2 font-normal">พื้นที่</th>
              <th className="py-4 px-2 font-normal">วันที่หาย</th>
              <th className="py-4 px-2 font-normal">ค่าสินน้ำใจ</th>
              <th className="py-4 px-2 font-normal"></th>
            </tr>
          </thead>
          <tbody>
  {petsList.map((pet, index) => (
              <tr key={pet.id} className="border-b">
                <td className="py-4 px-2">
                  <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-600">
                    {index + 1}
                  </div>
                </td>
                <td className="py-4 px-2 flex items-center">
                  <img
                    src={Array.isArray(pet.images) ? (pet.images[0]?.image_url || '/cat-placeholder.png') : '/cat-placeholder.png'}
                    alt={pet.pet_name}
                    className="w-10 h-10 rounded-full mr-4 object-cover"
                  />
                  <span className="font-semibold text-gray-800">
                    {pet.pet_name}
                  </span>
                </td>
                <td className="py-4 px-2 text-gray-600">
                  {renderPetDescriptionText(pet)}
                </td>
                <td className="py-4 px-2 text-gray-600">
                  {pet.location}, {translateProvince(pet.province)}
                  {userLocation && isFinite(Number(pet.latitude)) && isFinite(Number(pet.longitude)) && (
                    <span className="ml-2 text-xs text-gray-400">
                      • {calculateDistance(Number(userLocation.latitude), Number(userLocation.longitude), Number(pet.latitude), Number(pet.longitude)).toFixed(1)} กม.
                    </span>
                  )}
                </td>
                <td className="py-4 px-2 text-gray-600">
                  {formatDate(pet.lost_date)}
                </td>
                <td className="py-4 px-2 font-bold">
                  <span className="bg-yellow-200 text-yellow-800 rounded-full px-4 py-1">
                    {formatReward(pet.reward)}
                  </span>
                </td>
                <td className="py-4 px-2">
                  <Button
                    variant="primary"
                    className="bg-[#4285F4] hover:bg-[#3578E5] text-white rounded-lg"
                    onClick={() => openModal(pet)}
                  >
                    ดูรายละเอียด
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="block md:hidden space-y-4">
  {petsList.map((pet, index) => (
          <div
            key={pet.id}
            className="rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-600">
                {index + 1}
              </div>
              <img
                src={pet.images[0]?.image_url || '/cat-placeholder.png'}
                alt={pet.pet_name}
                className="w-12 h-12 rounded-full object-cover border"
              />
              <span className="font-semibold text-gray-800 text-lg">
                {pet.pet_name}
              </span>
            </div>
            <div className="text-gray-600 text-sm">
              {renderPetDescriptionText(pet)}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              <span>
                <strong>พื้นที่:</strong> {pet.location}, {translateProvince(pet.province)}
              </span>
              <span>
                <strong>วันที่หาย:</strong> {formatDate(pet.lost_date)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="bg-yellow-200 text-yellow-800 rounded-full px-4 py-1 font-bold">
                {formatReward(pet.reward)}
              </span>
              <Button
                variant="primary"
                className="bg-[#4285F4] hover:bg-[#3578E5] text-white rounded-lg px-4 py-2 text-sm"
                onClick={() => openModal(pet)}
              >
                ดูรายละเอียด
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardsTable;
