import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
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

export const useFetchFoundPets = (requireAuth = false, waitForUserMs = 8000): UseFetchFoundPetsReturn => {
  const [foundPets, setFoundPets] = useState<FoundPet[]>([]);
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

  const fetchFoundPets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch found pets data (timeboxed)
      const petsRes: any = await withTimeout(
        (supabase.from("found_pets").select("*").eq("status", "active").order("created_at", { ascending: false }) as any),
        10000
      );
      const { data: pets, error: petsError } = petsRes as any;

      if (petsError) {
        throw petsError;
      }

      // Fetch images for each found pet (each timeboxed to avoid one slow row blocking the whole list)
      const petsWithImages = await Promise.all(
        pets.map(async (pet: any) => {
          try {
            const imagesRes: any = await withTimeout(
              (supabase.from("found_pet_images").select("*").eq("found_pet_id", pet.id) as any),
              8000
            );
            const { data: images, error: imagesError } = imagesRes as any;
            if (imagesError) {
              console.warn(`Error fetching images for found pet ${pet.id}:`, imagesError);
              return { ...pet, images: [] };
            }
            return { ...pet, images: images || [] };
          } catch (e) {
            console.warn(`Timeout/error fetching images for found pet ${pet.id}:`, e);
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
    let cancelled = false;
    const startWaiting = () => {
      if (waitTimer.current) {
        window.clearTimeout(waitTimer.current);
        waitTimer.current = null;
      }
      waitTimer.current = window.setTimeout(() => {
        waitTimer.current = null;
        if (!cancelled) {
          // fallback to public fetch if user didn't arrive in time
          fetchFoundPets().catch(() => {});
        }
      }, waitForUserMs) as unknown as number;
      setFoundPets([]);
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
        fetchFoundPets().catch(() => {});
      }
    } else {
      fetchFoundPets().catch(() => {});
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
    foundPets,
    loading,
    error,
    refetch,
  };
};
