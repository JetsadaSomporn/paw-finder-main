import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { MapPin, Calendar, Phone, Mail, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.36 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#6C4F3D] flex items-center"><MapPin className="mr-2 h-6 w-6" />รายการสัตว์เลี้ยงที่พบ</h2>
                <p className="text-stone-600 mt-1">ดูรายการสัตว์เลี้ยงที่ผู้คนพบและกำลังหาผู้เป็นเจ้าของ</p>
              </div>
            </div>

            <div className="h-96 rounded-xl overflow-hidden border border-stone-200 shadow-sm">
              <MapContainer center={[13.7563, 100.5018]} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {foundPets.map((pet) => (
                  <Marker key={pet.id} position={[pet.latitude, pet.longitude]} eventHandlers={{ click: () => setSelectedPet(pet) }} />
                ))}
              </MapContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.36 }} className="space-y-4">
            <h3 className="text-lg font-semibold text-[#6C4F3D]">รายการสัตว์เลี้ยงที่พบ</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {foundPets.length === 0 ? (
                <div className="text-center py-12 text-stone-700">
                  ยังไม่มีรายการสัตว์เลี้ยงที่พบ
                </div>
              ) : (
                foundPets.map((pet) => (
                  <motion.div key={pet.id} layout whileHover={{ y: -4 }} className={`p-4 rounded-xl cursor-pointer transition-shadow shadow-sm ${selectedPet?.id === pet.id ? 'ring-2 ring-amber-200 bg-white' : 'bg-white'}`} onClick={() => setSelectedPet(pet)}>
                    <div className="flex items-start gap-4">
                      {pet.images.length > 0 ? (
                        <img src={pet.images[0].image_url} alt={pet.breed} className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-stone-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-[#F4A261]/20 text-[#6C4F3D] text-xs rounded-full font-medium">{pet.pet_type === 'cat' ? 'แมว' : 'สุนัข'}</span>
                          <span className="px-2 py-1 bg-[#F4A261]/10 text-[#6C4F3D] text-xs rounded-full font-medium">{pet.province}</span>
                        </div>

                        <h4 className="font-semibold text-stone-800">{pet.breed}</h4>
                        <p className="text-sm text-stone-600 mb-2">{pet.color}</p>

                        <div className="flex items-center gap-4 text-xs text-stone-600">
                          <div className="flex items-center"><Calendar className="h-3 w-3 mr-1 text-[#F4A261]" />{formatDate(pet.found_date)}</div>
                          <div className="flex items-center"><MapPin className="h-3 w-3 mr-1 text-[#F4A261]" />{pet.location}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Selected Pet Details */}
        {selectedPet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }} className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-stone-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[#6C4F3D] mb-4">รายละเอียดสัตว์เลี้ยง</h3>
                <div className="space-y-3 text-stone-700">
                  <div><span className="font-medium text-stone-800">ประเภท:</span><span className="ml-2">{selectedPet.pet_type === 'cat' ? 'แมว' : 'สุนัข'}</span></div>
                  <div><span className="font-medium text-stone-800">พันธุ์:</span><span className="ml-2">{selectedPet.breed}</span></div>
                  <div><span className="font-medium text-stone-800">สี:</span><span className="ml-2">{selectedPet.color}</span></div>
                  <div><span className="font-medium text-stone-800">วันที่พบ:</span><span className="ml-2">{formatDate(selectedPet.found_date)}</span></div>
                  <div><span className="font-medium text-stone-800">สถานที่:</span><span className="ml-2">{selectedPet.location}</span></div>
                  <div><span className="font-medium text-stone-800">จังหวัด:</span><span className="ml-2">{selectedPet.province}</span></div>
                  {selectedPet.details && (<div><span className="font-medium text-stone-800">รายละเอียดเพิ่มเติม:</span><p className="mt-1 text-stone-700">{selectedPet.details}</p></div>)}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#6C4F3D] mb-4">ข้อมูลติดต่อผู้พบ</h3>
                <div className="space-y-3 text-stone-700">
                  <div className="flex items-center"><span className="font-medium text-stone-800">ชื่อ:</span><span className="ml-2">{selectedPet.contact_name}</span></div>
                  <div className="flex items-center"><Phone className="h-4 w-4 text-[#F4A261] mr-2" /><span>{selectedPet.contact_phone}</span></div>
                  <div className="flex items-center"><Mail className="h-4 w-4 text-[#F4A261] mr-2" /><span>{selectedPet.contact_email}</span></div>
                </div>

                {selectedPet.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-stone-800 mb-3">รูปภาพ</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedPet.images.map((image, index) => (
                        <img key={index} src={image.image_url} alt={`${selectedPet.breed} ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-stone-100" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FoundPetsList;