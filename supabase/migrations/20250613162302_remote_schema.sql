drop trigger if exists "update_found_pets_updated_at" on "public"."found_pets";

drop policy "Anyone can insert found pet images" on "public"."found_pet_images";

drop policy "Anyone can view found pet images" on "public"."found_pet_images";

drop policy "Users can delete their own found pet images" on "public"."found_pet_images";

drop policy "Anyone can create found pet reports" on "public"."found_pets";

drop policy "Anyone can view found pets" on "public"."found_pets";

drop policy "Users can delete their own found pet reports" on "public"."found_pets";

drop policy "Users can update their own found pet reports" on "public"."found_pets";

revoke delete on table "public"."found_pet_images" from "anon";

revoke insert on table "public"."found_pet_images" from "anon";

revoke references on table "public"."found_pet_images" from "anon";

revoke select on table "public"."found_pet_images" from "anon";

revoke trigger on table "public"."found_pet_images" from "anon";

revoke truncate on table "public"."found_pet_images" from "anon";

revoke update on table "public"."found_pet_images" from "anon";

revoke delete on table "public"."found_pet_images" from "authenticated";

revoke insert on table "public"."found_pet_images" from "authenticated";

revoke references on table "public"."found_pet_images" from "authenticated";

revoke select on table "public"."found_pet_images" from "authenticated";

revoke trigger on table "public"."found_pet_images" from "authenticated";

revoke truncate on table "public"."found_pet_images" from "authenticated";

revoke update on table "public"."found_pet_images" from "authenticated";

revoke delete on table "public"."found_pet_images" from "service_role";

revoke insert on table "public"."found_pet_images" from "service_role";

revoke references on table "public"."found_pet_images" from "service_role";

revoke select on table "public"."found_pet_images" from "service_role";

revoke trigger on table "public"."found_pet_images" from "service_role";

revoke truncate on table "public"."found_pet_images" from "service_role";

revoke update on table "public"."found_pet_images" from "service_role";

revoke delete on table "public"."found_pets" from "anon";

revoke insert on table "public"."found_pets" from "anon";

revoke references on table "public"."found_pets" from "anon";

revoke select on table "public"."found_pets" from "anon";

revoke trigger on table "public"."found_pets" from "anon";

revoke truncate on table "public"."found_pets" from "anon";

revoke update on table "public"."found_pets" from "anon";

revoke delete on table "public"."found_pets" from "authenticated";

revoke insert on table "public"."found_pets" from "authenticated";

revoke references on table "public"."found_pets" from "authenticated";

revoke select on table "public"."found_pets" from "authenticated";

revoke trigger on table "public"."found_pets" from "authenticated";

revoke truncate on table "public"."found_pets" from "authenticated";

revoke update on table "public"."found_pets" from "authenticated";

revoke delete on table "public"."found_pets" from "service_role";

revoke insert on table "public"."found_pets" from "service_role";

revoke references on table "public"."found_pets" from "service_role";

revoke select on table "public"."found_pets" from "service_role";

revoke trigger on table "public"."found_pets" from "service_role";

revoke truncate on table "public"."found_pets" from "service_role";

revoke update on table "public"."found_pets" from "service_role";

alter table "public"."found_pet_images" drop constraint "found_pet_images_found_pet_id_fkey";

alter table "public"."found_pets" drop constraint "found_pets_pet_type_check";

alter table "public"."found_pets" drop constraint "found_pets_status_check";

alter table "public"."found_pets" drop constraint "found_pets_user_id_fkey";

alter table "public"."found_pet_images" drop constraint "found_pet_images_pkey";

alter table "public"."found_pets" drop constraint "found_pets_pkey";

drop index if exists "public"."found_pet_images_pkey";

drop index if exists "public"."found_pets_pkey";

drop index if exists "public"."idx_found_pets_coordinates";

drop index if exists "public"."idx_found_pets_found_date";

drop index if exists "public"."idx_found_pets_pet_type";

drop index if exists "public"."idx_found_pets_province";

drop index if exists "public"."idx_found_pets_status";

drop table "public"."found_pet_images";

drop table "public"."found_pets";


