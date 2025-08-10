import { provinces } from '@/data/provinces';
import {
  REWARD_SORT_BY,
  useRewardStore,
} from '@/features/rewards/stores/useRewardStore';
import { HStack, VStack } from '@/shared/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import React, { useEffect } from 'react';

const SORT_OPTIONS: { [key: string]: string } = {
  [REWARD_SORT_BY.REWARD_DESC]: 'ค่าสินน้ำใจ (สูง-ต่ำ)',
  [REWARD_SORT_BY.REWARD_ASC]: 'ค่าสินน้ำใจ (ต่ำ-สูง)',
  [REWARD_SORT_BY.DATE_DESC]: 'วันที่หาย (ล่าสุด)',
  [REWARD_SORT_BY.DATE_ASC]: 'วันที่หาย (เก่าสุด)',
};

interface RewardsToolbarProps {
  activeTab: string;
  selectedProvince: string;
  sortBy: string;
  onTabChange: (tab: string) => void;
  onProvinceChange: (province: string) => void;
  onSortChange: (sort: string) => void;
}

const TabButton: React.FC<{
  tabName: string;
  activeTab: string;
  onClick: (tab: string) => void;
  label: string;
}> = ({ tabName, activeTab, onClick, label }) => (
  <button
    onClick={() => onClick(tabName)}
    className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
      activeTab === tabName
        ? 'border-primary text-primary'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {label}
  </button>
);

export const RewardsToolbar: React.FC<RewardsToolbarProps> = ({
  activeTab,
  selectedProvince,
  onTabChange,
  onProvinceChange,
}) => {
  const sortBy = useRewardStore((state) => state.sortBy);
  const setSortBy = useRewardStore((state) => state.setSortBy);

  useEffect(() => {
    if (activeTab === 'nearby' && sortBy !== REWARD_SORT_BY.DISTANCE) {
      setSortBy(REWARD_SORT_BY.DISTANCE);
    }
  }, [activeTab, setSortBy, sortBy]);

  return (
    <VStack className="w-full gap-4">
      <div className="border-b border-gray-200 w-full">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabButton
            tabName="nearby"
            activeTab={activeTab}
            onClick={onTabChange}
            label="พื้นที่ใกล้เคียง"
          />
          <TabButton
            tabName="province"
            activeTab={activeTab}
            onClick={onTabChange}
            label="จังหวัด"
          />
          <TabButton
            tabName="nationwide"
            activeTab={activeTab}
            onClick={onTabChange}
            label="ทั่วประเทศ"
          />
        </nav>
      </div>

      <HStack className="w-full items-center gap-4">
        <div className="flex-grow">
          {activeTab === 'province' && (
            <Select value={selectedProvince} onValueChange={onProvinceChange}>
              <SelectTrigger className="w-full sm:w-[250px] bg-white">
                <SelectValue placeholder="เลือกจังหวัด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกจังหวัด</SelectItem>
                {[...provinces]
                  .sort((a, b) => a.label.localeCompare(b.label, 'th'))
                  .map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <HStack className="items-center justify-end flex-shrink-0 gap-2">
          <span className="text-sm font-medium text-gray-500">เรียงตาม:</span>
          {activeTab !== 'nearby' ? (
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as REWARD_SORT_BY)}
            >
              <SelectTrigger className="w-full sm:w-[250px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_OPTIONS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-primary font-semibold">ระยะทาง</span>
          )}
        </HStack>
      </HStack>
    </VStack>
  );
};
