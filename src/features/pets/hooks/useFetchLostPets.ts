import { supabase } from "@/lib/supabase";
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

      // Fetch lost pets data
      const { data: pets, error: petsError } = await supabase
        .from("lost_pets")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (petsError) {
        throw petsError;
      }

      // Fetch images for each pet
      const petsWithImages = await Promise.all(
        pets.map(async (pet) => {
          const { data: images, error: imagesError } = await supabase
            .from("lost_pet_images")
            .select("*")
            .eq("lost_pet_id", pet.id);

          if (imagesError) {
            console.warn(
              `Error fetching images for pet ${pet.id}:`,
              imagesError
            );
            // Don't throw error for images, just continue without them
            return {
              ...pet,
              images: [],
            };
          }

          return {
            ...pet,
            images: images || [],
          };
        })
      );

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
