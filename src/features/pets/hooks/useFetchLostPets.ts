import restGet from "@/lib/restPublic";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { LostPet } from "../types";

export interface LostPetImage {
  id: string;
  image_url: string;
}

interface UseFetchLostPetsReturn {
  lostPets: LostPet[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFetchLostPets = (): UseFetchLostPetsReturn => {
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLostPets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lost pets and their images via anonymous REST (no Authorization header)
      const rows = await restGet(
        "lost_pets",
        "?select=*,lost_pet_images(*)&status=eq.active&order=created_at.desc"
      );

      const petsWithImages = (rows || []).map((pet: any) => ({
        ...pet,
        images: (pet.lost_pet_images as any[]) || [],
      }));

      setLostPets(petsWithImages);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล";
      setError(errorMessage);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสัตว์เลี้ยงหาย");
      console.error("Error fetching lost pets:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchLostPets();
  };

  useEffect(() => {
    fetchLostPets();
  }, []);

  return {
    lostPets,
    loading,
    error,
    refetch,
  };
};
