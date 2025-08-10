alter table "public"."lost_pets" drop constraint "lost_pets_latitude_check";

alter table "public"."lost_pets" drop constraint "lost_pets_longitude_check";

drop index if exists "public"."idx_lost_pets_coordinates";

create table "public"."found_pet_images" (
    "id" uuid not null default gen_random_uuid(),
    "found_pet_id" uuid,
    "image_url" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."found_pet_images" enable row level security;

create table "public"."found_pets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "pet_type" text not null,
    "breed" text not null,
    "color" text,
    "found_date" date not null,
    "location" text not null,
    "province" text not null,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "details" text,
    "contact_name" text not null,
    "contact_phone" text not null,
    "contact_email" text not null,
    "status" text default 'active'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "pattern" text,
    "colors" text
);


alter table "public"."found_pets" enable row level security;

alter table "public"."lost_pets" add column "colors" text;

alter table "public"."lost_pets" add column "pattern" text;

alter table "public"."lost_pets" alter column "color" drop not null;

alter table "public"."lost_pets" alter column "latitude" set data type real using "latitude"::real;

alter table "public"."lost_pets" alter column "longitude" set data type real using "longitude"::real;

CREATE UNIQUE INDEX found_pet_images_pkey ON public.found_pet_images USING btree (id);

CREATE UNIQUE INDEX found_pets_pkey ON public.found_pets USING btree (id);

CREATE INDEX idx_found_pets_coordinates ON public.found_pets USING btree (latitude, longitude);

CREATE INDEX idx_found_pets_found_date ON public.found_pets USING btree (found_date);

CREATE INDEX idx_found_pets_pet_type ON public.found_pets USING btree (pet_type);

CREATE INDEX idx_found_pets_province ON public.found_pets USING btree (province);

CREATE INDEX idx_found_pets_status ON public.found_pets USING btree (status);

alter table "public"."found_pet_images" add constraint "found_pet_images_pkey" PRIMARY KEY using index "found_pet_images_pkey";

alter table "public"."found_pets" add constraint "found_pets_pkey" PRIMARY KEY using index "found_pets_pkey";

alter table "public"."found_pet_images" add constraint "found_pet_images_found_pet_id_fkey" FOREIGN KEY (found_pet_id) REFERENCES found_pets(id) ON DELETE CASCADE not valid;

alter table "public"."found_pet_images" validate constraint "found_pet_images_found_pet_id_fkey";

alter table "public"."found_pets" add constraint "found_pets_pet_type_check" CHECK ((pet_type = ANY (ARRAY['cat'::text, 'dog'::text]))) not valid;

alter table "public"."found_pets" validate constraint "found_pets_pet_type_check";

alter table "public"."found_pets" add constraint "found_pets_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'claimed'::text, 'closed'::text]))) not valid;

alter table "public"."found_pets" validate constraint "found_pets_status_check";

alter table "public"."found_pets" add constraint "found_pets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."found_pets" validate constraint "found_pets_user_id_fkey";

grant delete on table "public"."found_pet_images" to "anon";

grant insert on table "public"."found_pet_images" to "anon";

grant references on table "public"."found_pet_images" to "anon";

grant select on table "public"."found_pet_images" to "anon";

grant trigger on table "public"."found_pet_images" to "anon";

grant truncate on table "public"."found_pet_images" to "anon";

grant update on table "public"."found_pet_images" to "anon";

grant delete on table "public"."found_pet_images" to "authenticated";

grant insert on table "public"."found_pet_images" to "authenticated";

grant references on table "public"."found_pet_images" to "authenticated";

grant select on table "public"."found_pet_images" to "authenticated";

grant trigger on table "public"."found_pet_images" to "authenticated";

grant truncate on table "public"."found_pet_images" to "authenticated";

grant update on table "public"."found_pet_images" to "authenticated";

grant delete on table "public"."found_pet_images" to "service_role";

grant insert on table "public"."found_pet_images" to "service_role";

grant references on table "public"."found_pet_images" to "service_role";

grant select on table "public"."found_pet_images" to "service_role";

grant trigger on table "public"."found_pet_images" to "service_role";

grant truncate on table "public"."found_pet_images" to "service_role";

grant update on table "public"."found_pet_images" to "service_role";

grant delete on table "public"."found_pets" to "anon";

grant insert on table "public"."found_pets" to "anon";

grant references on table "public"."found_pets" to "anon";

grant select on table "public"."found_pets" to "anon";

grant trigger on table "public"."found_pets" to "anon";

grant truncate on table "public"."found_pets" to "anon";

grant update on table "public"."found_pets" to "anon";

grant delete on table "public"."found_pets" to "authenticated";

grant insert on table "public"."found_pets" to "authenticated";

grant references on table "public"."found_pets" to "authenticated";

grant select on table "public"."found_pets" to "authenticated";

grant trigger on table "public"."found_pets" to "authenticated";

grant truncate on table "public"."found_pets" to "authenticated";

grant update on table "public"."found_pets" to "authenticated";

grant delete on table "public"."found_pets" to "service_role";

grant insert on table "public"."found_pets" to "service_role";

grant references on table "public"."found_pets" to "service_role";

grant select on table "public"."found_pets" to "service_role";

grant trigger on table "public"."found_pets" to "service_role";

grant truncate on table "public"."found_pets" to "service_role";

grant update on table "public"."found_pets" to "service_role";

create policy "Anyone can insert found pet images"
on "public"."found_pet_images"
as permissive
for insert
to public
with check (true);


create policy "Anyone can view found pet images"
on "public"."found_pet_images"
as permissive
for select
to public
using (true);


create policy "Users can delete their own found pet images"
on "public"."found_pet_images"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM found_pets
  WHERE ((found_pets.id = found_pet_images.found_pet_id) AND (found_pets.user_id = auth.uid())))));


create policy "Anyone can create found pet reports"
on "public"."found_pets"
as permissive
for insert
to public
with check (true);


create policy "Anyone can view found pets"
on "public"."found_pets"
as permissive
for select
to public
using (true);


create policy "Users can delete their own found pet reports"
on "public"."found_pets"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update their own found pet reports"
on "public"."found_pets"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


CREATE TRIGGER update_found_pets_updated_at BEFORE UPDATE ON public.found_pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


