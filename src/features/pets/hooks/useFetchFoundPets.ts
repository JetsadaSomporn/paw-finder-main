import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FoundPet } from "../types";

export interface FoundPetImage {
  id: string;
  image_url: string;
}

interface UseFetchFoundPetsReturn {
  foundPets: FoundPet[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFetchFoundPets = (): UseFetchFoundPetsReturn => {
  const [foundPets, setFoundPets] = useState<FoundPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFoundPets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch found pets data
      const { data: pets, error: petsError } = await supabase
        .from("found_pets")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (petsError) {
        throw petsError;
      }

      // Fetch images for each found pet
      const petsWithImages = await Promise.all(
        pets.map(async (pet) => {
          const { data: images, error: imagesError } = await supabase
            .from("found_pet_images")
            .select("*")
            .eq("found_pet_id", pet.id);

          if (imagesError) {
            console.warn(
              `Error fetching images for found pet ${pet.id}:`,
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

      setFoundPets(petsWithImages);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล";
      setError(errorMessage);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสัตว์เลี้ยงที่พบ");
      console.error("Error fetching found pets:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchFoundPets();
  };

  useEffect(() => {
    fetchFoundPets();
  }, []);

  return {
    foundPets,
    loading,
    error,
    refetch,
  };
};
