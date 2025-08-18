import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
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

export const useFetchLostPets = (requireAuth = false, waitForUserMs = 8000): UseFetchLostPetsReturn => {
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const waitTimer = useRef<number | null>(null);

  const withTimeout = async <T,>(p: Promise<T>, ms = 8000): Promise<T> => {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('timeout')), ms) as unknown as number;
      p.then((v) => {
        clearTimeout(t);
        resolve(v);
      }).catch((e) => {
        clearTimeout(t);
        reject(e);
      });
    });
  };

  const fetchLostPets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lost pets data (timeboxed)
      const petsRes: any = await withTimeout(
        (supabase.from("lost_pets").select("*").eq("status", "active").order("created_at", { ascending: false }) as any),
        10000
      );
      const { data: pets, error: petsError } = petsRes as any;

      if (petsError) {
        throw petsError;
      }

      // Fetch images for each pet (timeboxed per row)
      const petsWithImages = await Promise.all(
        pets.map(async (pet: any) => {
          try {
            const imagesRes: any = await withTimeout(
              (supabase.from("lost_pet_images").select("*").eq("lost_pet_id", pet.id) as any),
              8000
            );
            const { data: images, error: imagesError } = imagesRes as any;
            if (imagesError) {
              console.warn(`Error fetching images for pet ${pet.id}:`, imagesError);
              return { ...pet, images: [] };
            }
            return { ...pet, images: images || [] };
          } catch (e) {
            console.warn(`Timeout/error fetching images for pet ${pet.id}:`, e);
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
    let cancelled = false;
    const startWaiting = () => {
      if (waitTimer.current) {
        window.clearTimeout(waitTimer.current);
        waitTimer.current = null;
      }
      waitTimer.current = window.setTimeout(() => {
        waitTimer.current = null;
        if (!cancelled) {
          fetchLostPets().catch(() => {});
        }
      }, waitForUserMs) as unknown as number;
      setLostPets([]);
      setLoading(true);
    };

    if (requireAuth) {
      if (!user?.id) {
        startWaiting();
      } else {
        if (waitTimer.current) {
          window.clearTimeout(waitTimer.current);
          waitTimer.current = null;
        }
        fetchLostPets().catch(() => {});
      }
    } else {
      fetchLostPets().catch(() => {});
    }

    return () => {
      cancelled = true;
      if (waitTimer.current) {
        window.clearTimeout(waitTimer.current);
        waitTimer.current = null;
      }
    };
  }, [requireAuth, user?.id, waitForUserMs]);

  return {
    lostPets,
    loading,
    error,
    refetch,
  };
};
