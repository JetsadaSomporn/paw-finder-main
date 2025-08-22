import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Calendar, Phone, Mail, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FoundPet {
  id: string;
  pet_type: string;
  breed: string;
  color: string;
  found_date: string;
  location: string;
  province: string;
  latitude: number;
  longitude: number;
  details: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  created_at: string;
  images: FoundPetImage[];
}

interface FoundPetImage {
  id: string;
  image_url: string;
}

const FoundPetsList: React.FC = () => {
  const [foundPets, setFoundPets] = useState<FoundPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<FoundPet | null>(null);

  useEffect(() => {
    fetchFoundPets();
  }, []);

  const fetchFoundPets = async () => {
    try {
      setLoading(true);
      
      // Fetch found pets with their images
      const { data: pets, error: petsError } = await supabase
        .from('found_pets')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (petsError) throw petsError;

      // Fetch images for each pet
      const petsWithImages = await Promise.all(
        pets.map(async (pet) => {
          const { data: images, error: imagesError } = await supabase
            .from('found_pet_images')
            .select('*')
            .eq('found_pet_id', pet.id);

          if (imagesError) throw imagesError;

          return {
            ...pet,
            images: images || []
          };
        })
      );

      setFoundPets(petsWithImages);
    } catch (error) {
      console.error('Error fetching found pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FFE0] py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4A261]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FFE0] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#F4A261] to-[#E8956A] p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <MapPin className="mr-2 h-6 w-6" />
              รายการสัตว์เลี้ยงที่พบ
            </h2>
            <p className="text-white/90 mt-2">
              ดูรายการสัตว์เลี้ยงที่ผู้คนพบและกำลังหาผู้เป็นเจ้าของ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Map Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#6C4F3D]">แผนที่แสดงตำแหน่ง</h3>
              <div className="h-96 rounded-lg overflow-hidden border border-[#F4A261]/30">
                <MapContainer
                  center={[13.7563, 100.5018]}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {foundPets.map((pet) => (
                    <Marker
                      key={pet.id}
                      position={[pet.latitude, pet.longitude]}
                      eventHandlers={{
                        click: () => setSelectedPet(pet)
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-semibold text-[#6C4F3D]">{pet.breed}</h4>
                          <p className="text-sm text-[#3E3E3E]">{pet.location}</p>
                          <p className="text-sm text-[#3E3E3E]">{formatDate(pet.found_date)}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#6C4F3D]">รายการสัตว์เลี้ยงที่พบ</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {foundPets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-28 h-28 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 11.5C4.5 8 7.5 6 12 6s7.5 2 7.5 5.5-3 6.5-7.5 9c-4.5-2.5-7.5-5.5-7.5-9z"/></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-700 mb-2">🐾 ยังไม่มีรายการสัตว์เลี้ยงที่พบ</h3>
                    <p className="text-sm text-stone-500 mb-4">ลองปรับตัวกรอง หรือคุณสามารถสร้างประกาศใหม่เพื่อช่วยสัตว์เลี้ยงให้กลับบ้าน</p>
                    <div className="flex justify-center">
                      <a href="/found-pets" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full shadow-sm hover:shadow-md transition">สร้างประกาศใหม่</a>
                    </div>
                  </div>
                ) : (
                  foundPets.map((pet) => (
                    <div
                      key={pet.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedPet?.id === pet.id
                          ? 'border-[#F4A261] bg-[#F4A261]/10'
                          : 'border-gray-200 hover:border-[#F4A261] hover:bg-[#F4A261]/5'
                      }`}
                      onClick={() => setSelectedPet(pet)}
                    >
                      <div className="flex items-start space-x-4">
                        {pet.images.length > 0 ? (
                          <img
                            src={pet.images[0].image_url}
                            alt={pet.breed}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-1 bg-[#F4A261]/20 text-[#6C4F3D] text-xs rounded-full font-medium">
                              {pet.pet_type === 'cat' ? 'แมว' : 'สุนัข'}
                            </span>
                            <span className="px-2 py-1 bg-[#F4A261]/10 text-[#6C4F3D] text-xs rounded-full font-medium">
                              {pet.province}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-[#2B2B2B]">{pet.breed}</h4>
                          <p className="text-sm text-[#3E3E3E] mb-2">{pet.color}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-[#3E3E3E]">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-[#F4A261]" />
                              {formatDate(pet.found_date)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-[#F4A261]" />
                              {pet.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Selected Pet Details */}
          {selectedPet && (
            <div className="border-t border-gray-200 p-6 bg-[#F7FFE0]/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#6C4F3D] mb-4">รายละเอียดสัตว์เลี้ยง</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-[#2B2B2B]">ประเภท:</span>
                      <span className="ml-2 text-[#3E3E3E]">{selectedPet.pet_type === 'cat' ? 'แมว' : 'สุนัข'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#2B2B2B]">พันธุ์:</span>
                      <span className="ml-2 text-[#3E3E3E]">{selectedPet.breed}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#2B2B2B]">สี:</span>
                      <span className="ml-2 text-[#3E3E3E]">{selectedPet.color}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#2B2B2B]">วันที่พบ:</span>
                      <span className="ml-2 text-[#3E3E3E]">{formatDate(selectedPet.found_date)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#2B2B2B]">สถานที่:</span>
                      <span className="ml-2 text-[#3E3E3E]">{selectedPet.location}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#2B2B2B]">จังหวัด:</span>
                      <span className="ml-2 text-[#3E3E3E]">{selectedPet.province}</span>
                    </div>
                    {selectedPet.details && (
                      <div>
                        <span className="font-medium text-[#2B2B2B]">รายละเอียดเพิ่มเติม:</span>
                        <p className="mt-1 text-[#3E3E3E]">{selectedPet.details}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#6C4F3D] mb-4">ข้อมูลติดต่อผู้พบ</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="font-medium text-[#2B2B2B]">ชื่อ:</span>
                      <span className="ml-2 text-[#3E3E3E]">{selectedPet.contact_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-[#F4A261] mr-2" />
                      <span className="text-[#3E3E3E]">{selectedPet.contact_phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-[#F4A261] mr-2" />
                      <span className="text-[#3E3E3E]">{selectedPet.contact_email}</span>
                    </div>
                  </div>

                  {selectedPet.images.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-[#2B2B2B] mb-3">รูปภาพ</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedPet.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.image_url}
                            alt={`${selectedPet.breed} ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-[#F4A261]/20"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoundPetsList; 