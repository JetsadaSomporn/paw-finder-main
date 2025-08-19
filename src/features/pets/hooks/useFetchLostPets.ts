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
      // Fetch lost pets and their images in one relational select using the public client
  const { data: petsWithImages, error: petsError } = await supabase
        .from("lost_pets")
        .select("*, lost_pet_images(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (petsError) throw petsError;

      setLostPets((petsWithImages || []) as any);
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
