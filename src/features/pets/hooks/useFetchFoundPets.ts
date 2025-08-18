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
      // Helper: wrap a promise with a timeout so a stuck request doesn't hang Promise.all
      const withTimeout = <T,>(p: Promise<T>, ms = 8000): Promise<T> => {
        return Promise.race([
          p,
          new Promise<T>((_, rej) =>
            setTimeout(() => rej(new Error('timeout')), ms)
          ),
        ] as Promise<T>[]);
      };

      // Fetch found pets data (with timeout)
      let pets: any[] = [];
      try {
        const res: any = await withTimeout(
          (supabase
            .from('found_pets')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false }) as any),
          10000
        );
        if (res.error) throw res.error;
        pets = res.data || [];
      } catch (e: any) {
        console.error('Error or timeout fetching found_pets:', e);
        throw e;
      }

      // Fetch images for each found pet with per-request timeout to avoid Promise.all blocking
      const petsWithImages = await Promise.all(
        pets.map(async (pet) => {
          try {
            const res: any = await withTimeout(
              (supabase
                .from('found_pet_images')
                .select('*')
                .eq('found_pet_id', pet.id) as any),
              8000
            );
            if (res.error) {
              console.warn(`Error fetching images for found pet ${pet.id}:`, res.error);
              return { ...pet, images: [] };
            }
            return { ...pet, images: res.data || [] };
          } catch (e: any) {
            // timeout or other error — treat as no images for this pet
            console.warn(`Timeout/error fetching images for found pet ${pet.id}:`, e?.message || e);
            return { ...pet, images: [] };
          }
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
