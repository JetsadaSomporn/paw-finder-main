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
      const withTimeout = <T,>(p: Promise<T>, ms = 8000): Promise<T> => {
        return Promise.race([
          p,
          new Promise<T>((_, rej) =>
            setTimeout(() => rej(new Error('timeout')), ms)
          ),
        ] as Promise<T>[]);
      };

      let pets: any[] = [];
      try {
        const res: any = await withTimeout(
          (supabase
            .from('lost_pets')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false }) as any),
          10000
        );
        if (res.error) throw res.error;
        pets = res.data || [];
      } catch (e: any) {
        console.error('Error or timeout fetching lost_pets:', e);
        throw e;
      }

      const petsWithImages = await Promise.all(
        pets.map(async (pet) => {
          try {
            const res: any = await withTimeout(
              (supabase
                .from('lost_pet_images')
                .select('*')
                .eq('lost_pet_id', pet.id) as any),
              8000
            );
            if (res.error) {
              console.warn(`Error fetching images for pet ${pet.id}:`, res.error);
              return { ...pet, images: [] };
            }
            return { ...pet, images: res.data || [] };
          } catch (e: any) {
            console.warn(`Timeout/error fetching images for pet ${pet.id}:`, e?.message || e);
            return { ...pet, images: [] };
          }
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
