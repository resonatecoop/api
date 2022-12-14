
// FIXME: original seeder duplicates user inserts. 'user' inserts are removed from this seeder

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `
        INSERT INTO public.user_groups (id, owner_id, type_id, display_name, description, short_bio, email, address_id, avatar, banner, tags, updated_at, created_at, deleted_at) 
            VALUES ('49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', '1c88dea6-0519-4b61-a279-4006954c5d4c', 1, 'matrix', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2022-09-28 17:31:59.495+00', '2022-09-28 17:31:59.495+00', NULL);

        INSERT INTO public.track_groups (id, cover, title, type, about, private, display_artist, creator_id, composers, performers, tags, slug, release_date, download, featured, enabled, updated_at, created_at, deleted_at) 
            VALUES ('84322e4f-0247-427f-8bed-e7617c3df5ad', NULL, 'Best album ever', 'lp', 'this is the best album', false, 'Jack', '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', NULL, NULL, NULL, 'best-album-ever', '2019-01-01', false, false, true, '2022-09-29 13:07:07.237+00', '2022-09-28 17:31:59.513+00', NULL);
        INSERT INTO public.track_groups (id, cover, title, type, about, private, display_artist, creator_id, composers, performers, tags, slug, release_date, download, featured, enabled, updated_at, created_at, deleted_at) 
            VALUES ('8e9c188c-0f1f-4c99-ac89-0709970345bd', NULL, 'Best album ever 2', 'lp', 'this is the best album2', false, 'Jill', '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', NULL, NULL, NULL, 'best-album-ever-2', '2019-01-02', false, false, true, '2022-09-29 13:07:07.239+00', '2022-09-28 17:31:59.513+00', NULL);
        INSERT INTO public.track_groups (id, cover, title, type, about, private, display_artist, creator_id, composers, performers, tags, slug, release_date, download, featured, enabled, updated_at, created_at, deleted_at) 
            VALUES ('58991f22-b172-48e4-8b27-e0a4c946f9b2', NULL, 'Best album ever 3', 'lp', 'this is the best album3', false, '@auggod', '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', NULL, '{auggod}', NULL, 'best-album-ever-3', '2019-01-03', false, false, true, '2022-09-29 13:07:07.239+00', '2022-09-28 17:31:59.513+00', NULL);

        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('b6d160d1-be16-48a4-8c4f-0c0574c4c6aa', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Sharable maximized utilisation', 'Antonia Yost IV', 'hard drive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.549+00', '2022-09-28 17:31:59.549+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('706cff12-ba44-49f7-8982-98b3996a2919', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Customer-focused fresh-thinking groupware', 'Miss Lewis Ondricka', 'card', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.549+00', '2022-09-28 17:31:59.549+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('56ea16b1-f732-4e46-a9a2-4a6bb3e64ecc', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Configurable bandwidth-monitored definition', 'Roberto Romaguera', 'panel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.55+00', '2022-09-28 17:31:59.55+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('39565f69-cb1c-4e96-89d4-dc02b8fa6b16', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Managed tangible instruction set', 'Glenn Schmeler', 'matrix', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.55+00', '2022-09-28 17:31:59.55+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('556c6f38-9cfa-4b83-b379-1f663f8901e4', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Down-sized regional alliance', 'Edgar Erdman', 'sensor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.55+00', '2022-09-28 17:31:59.55+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('0ba2f958-ab3a-4807-8247-567995d3ff47', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Exclusive directional complexity', 'Dr. Elvira Sauer', 'card', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.55+00', '2022-09-28 17:31:59.55+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('aa67b1ed-3d86-419e-9d51-0a3cb91f4218', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Vision-oriented didactic circuit', 'Phyllis Luettgen', 'hard drive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.551+00', '2022-09-28 17:31:59.551+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('0bd6bdcb-ee99-4c30-b637-668c4ac0fee2', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Ameliorated systemic infrastructure', 'Nora Kiehn', 'monitor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.551+00', '2022-09-28 17:31:59.551+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('e5387217-6ab7-48be-909a-2925609a1024', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Devolved explicit installation', 'Chester Harber', 'alarm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.551+00', '2022-09-28 17:31:59.551+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('0a103865-0c47-4c60-af3d-6d5c62203531', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Seamless impactful ability', 'Rafael Runolfsson', 'bus', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.551+00', '2022-09-28 17:31:59.551+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('2d1f5012-dff5-401d-8503-628439ca8ef2', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Phased fresh-thinking service-desk', 'Johnnie Gorczany', 'pixel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.552+00', '2022-09-28 17:31:59.552+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('7c5864c6-634d-476d-a8b0-ca7ed5900345', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Exclusive methodical success', 'Doreen Cronin', 'array', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.552+00', '2022-09-28 17:31:59.552+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('92e91e90-e1cd-4bc7-b470-67421bc2f147', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Synchronised composite emulation', 'Clinton Reynolds', 'firewall', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.552+00', '2022-09-28 17:31:59.552+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('1e14bc37-c5a8-4667-bc78-01a633a23520', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Up-sized stable array', 'Allison Hirthe V', 'sensor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.552+00', '2022-09-28 17:31:59.552+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('51cfa034-9e56-4564-9ed7-e3b4bceda731', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Polarised motivating internet solution', 'Janet Koelpin', 'pixel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.553+00', '2022-09-28 17:31:59.553+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('78f6da45-91e4-40c9-8447-b99581528139', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Face to face transitional project', 'Charlie Blick', 'protocol', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.553+00', '2022-09-28 17:31:59.553+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('c62d1c4c-0c5a-4b6a-91c4-217cff092082', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Integrated radical encoding', 'Dustin White', 'interface', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.553+00', '2022-09-28 17:31:59.553+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('7effd259-f531-42f7-bd06-f1182673ecd6', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Synergized high-level collaboration', 'Della Block', 'system', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.553+00', '2022-09-28 17:31:59.553+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('c8bbe191-823c-430f-86d2-d8c2b2ee7a6c', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Face to face local pricing structure', 'Brent Morissette', 'transmitter', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.553+00', '2022-09-28 17:31:59.553+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('ede3c192-4ebe-48a8-b9f0-320e2bd4da8b', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Reactive client-server model', 'Roxanne Beahan', 'protocol', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.554+00', '2022-09-28 17:31:59.554+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('e2a99f8e-0d81-4fe8-9a85-5b6ca115ab44', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Future-proofed methodical conglomeration', 'Calvin Larson', 'monitor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.554+00', '2022-09-28 17:31:59.554+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('3dc37b61-31ef-4070-b9eb-73e869e8e0ab', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Self-enabling reciprocal system engine', 'Orville Toy', 'program', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.554+00', '2022-09-28 17:31:59.554+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('fcf41302-e549-4ab9-9937-f0bfead5a44f', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Virtual clear-thinking standardization', 'Edith Harber', 'driver', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.554+00', '2022-09-28 17:31:59.554+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('4f27cebc-1afb-4e2c-a7e7-a7e1002e1244', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Digitized demand-driven ability', 'Maureen Welch', 'bus', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.554+00', '2022-09-28 17:31:59.554+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('ccb9b344-c26b-4efa-a595-beacdc7d163c', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Assimilated actuating hierarchy', 'Alberto Kerluke', 'alarm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.554+00', '2022-09-28 17:31:59.554+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('96b5e86a-76b0-40ee-94ab-5226da627b62', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Multi-tiered 3rd generation circuit', 'Nicole Rogahn PhD', 'program', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.555+00', '2022-09-28 17:31:59.555+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('2684ca14-9864-4377-aab9-7a471b1f8d14', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Virtual 6th generation knowledge base', 'Evelyn Jacobson', 'protocol', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.555+00', '2022-09-28 17:31:59.555+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('8221ddea-2cf7-457d-989f-a69df823ba09', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Up-sized executive task-force', 'Maryann Farrell', 'bandwidth', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.555+00', '2022-09-28 17:31:59.555+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('374d19fc-18af-474d-8c19-debc993db991', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Secured 24 hour website', 'Inez Collins MD', 'alarm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.555+00', '2022-09-28 17:31:59.555+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('6bb1b466-82a7-4e6b-a173-16c3a8829d3d', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Upgradable context-sensitive implementation', 'Marjorie Beahan', 'panel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.555+00', '2022-09-28 17:31:59.555+00', NULL);
        INSERT INTO public.tracks (id, legacy_id, creator_id, track_name, track_artist, track_album, track_duration, track_album_artist, track_composer, track_year, track_url, track_cover_art, track_number, tags, status, created_at, updated_at, deleted_at) 
          VALUES ('44a28752-1101-4e0d-8c40-2c36dc82d035', NULL, '49d2ac44-7f20-4a47-9cf5-3ea5d6ef78f6', 'Ergonomic interactive concept', 'Laurie Yost', 'firewall', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2022-09-28 17:31:59.879+00', '2022-09-28 17:31:59.879+00', NULL);

        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('753eccd9-01b2-4bfb-8acc-8d0e44b998cc', 0, '84322e4f-0247-427f-8bed-e7617c3df5ad', '44a28752-1101-4e0d-8c40-2c36dc82d035', NULL, NULL, '2022-09-28 17:31:59.66+00', '2022-09-28 17:31:59.66+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('cf74210a-51b3-46a9-ac0e-21350e4d7104', 7, '84322e4f-0247-427f-8bed-e7617c3df5ad', 'aa67b1ed-3d86-419e-9d51-0a3cb91f4218', NULL, NULL, '2022-09-28 17:31:59.759+00', '2022-09-28 17:31:59.759+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('419bb7ac-33cf-46af-94d4-7c502727b51a', 4, '84322e4f-0247-427f-8bed-e7617c3df5ad', '0ba2f958-ab3a-4807-8247-567995d3ff47', NULL, NULL, '2022-09-28 17:31:59.762+00', '2022-09-28 17:31:59.762+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('f3a68acf-ecdc-41b8-95c9-d8719aa82ca6', 9, '84322e4f-0247-427f-8bed-e7617c3df5ad', 'e5387217-6ab7-48be-909a-2925609a1024', NULL, NULL, '2022-09-28 17:31:59.766+00', '2022-09-28 17:31:59.766+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('84ed62ca-ec7f-4102-8e11-d78dc729df9f', 2, '8e9c188c-0f1f-4c99-ac89-0709970345bd', '92e91e90-e1cd-4bc7-b470-67421bc2f147', NULL, NULL, '2022-09-28 17:31:59.774+00', '2022-09-28 17:31:59.774+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('8b17a7c6-9bad-4d04-b247-4222bdc68186', 8, '84322e4f-0247-427f-8bed-e7617c3df5ad', '0a103865-0c47-4c60-af3d-6d5c62203531', NULL, NULL, '2022-09-28 17:31:59.772+00', '2022-09-28 17:31:59.772+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('7c5f88e2-36c9-4414-b691-26a28791345a', 7, '8e9c188c-0f1f-4c99-ac89-0709970345bd', '7effd259-f531-42f7-bd06-f1182673ecd6', NULL, NULL, '2022-09-28 17:31:59.782+00', '2022-09-28 17:31:59.782+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('2cca3e30-d715-4f93-93f9-0cd97abd4dd1', 9, '8e9c188c-0f1f-4c99-ac89-0709970345bd', 'ede3c192-4ebe-48a8-b9f0-320e2bd4da8b', NULL, NULL, '2022-09-28 17:31:59.785+00', '2022-09-28 17:31:59.785+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('ab536810-deef-4645-9ec5-7c642c035d6c', 0, '58991f22-b172-48e4-8b27-e0a4c946f9b2', 'e2a99f8e-0d81-4fe8-9a85-5b6ca115ab44', NULL, NULL, '2022-09-28 17:31:59.787+00', '2022-09-28 17:31:59.787+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('39f187a2-d9b2-4364-a363-0d1e038f8f68', 5, '8e9c188c-0f1f-4c99-ac89-0709970345bd', 'c62d1c4c-0c5a-4b6a-91c4-217cff092082', NULL, NULL, '2022-09-28 17:31:59.791+00', '2022-09-28 17:31:59.791+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('12ab48b1-2174-4ae2-a226-2d9fa348723e', 3, '58991f22-b172-48e4-8b27-e0a4c946f9b2', '4f27cebc-1afb-4e2c-a7e7-a7e1002e1244', NULL, NULL, '2022-09-28 17:31:59.8+00', '2022-09-28 17:31:59.8+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('c4afdd15-cfe7-4c44-b052-f284eed734f5', 4, '58991f22-b172-48e4-8b27-e0a4c946f9b2', 'ccb9b344-c26b-4efa-a595-beacdc7d163c', NULL, NULL, '2022-09-28 17:31:59.802+00', '2022-09-28 17:31:59.802+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('8bad762d-39cf-49d1-9e99-7136552203ea', 7, '58991f22-b172-48e4-8b27-e0a4c946f9b2', '8221ddea-2cf7-457d-989f-a69df823ba09', NULL, NULL, '2022-09-28 17:31:59.808+00', '2022-09-28 17:31:59.808+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('239383fc-deea-428a-8868-cc008056f547', 9, '58991f22-b172-48e4-8b27-e0a4c946f9b2', '6bb1b466-82a7-4e6b-a173-16c3a8829d3d', NULL, NULL, '2022-09-28 17:31:59.815+00', '2022-09-28 17:31:59.815+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('5138f138-6e35-49ba-954b-fd33b071c908', 1, '84322e4f-0247-427f-8bed-e7617c3df5ad', '706cff12-ba44-49f7-8982-98b3996a2919', NULL, NULL, '2022-09-28 17:31:59.818+00', '2022-09-28 17:31:59.818+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('b9e40e8f-2116-4584-b9ec-1cbcd782c566', 2, '84322e4f-0247-427f-8bed-e7617c3df5ad', '56ea16b1-f732-4e46-a9a2-4a6bb3e64ecc', NULL, NULL, '2022-09-28 17:31:59.822+00', '2022-09-28 17:31:59.822+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('dad8653f-80ee-4774-9789-6080c31d171f', 3, '84322e4f-0247-427f-8bed-e7617c3df5ad', '39565f69-cb1c-4e96-89d4-dc02b8fa6b16', NULL, NULL, '2022-09-28 17:31:59.825+00', '2022-09-28 17:31:59.825+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('1c311a53-4ef5-412b-85eb-46661d6bd47b', 6, '84322e4f-0247-427f-8bed-e7617c3df5ad', '0bd6bdcb-ee99-4c30-b637-668c4ac0fee2', NULL, NULL, '2022-09-28 17:31:59.83+00', '2022-09-28 17:31:59.83+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('303b88cb-4b1f-4fdf-a4e5-89d6b9bc59b1', 5, '84322e4f-0247-427f-8bed-e7617c3df5ad', '556c6f38-9cfa-4b83-b379-1f663f8901e4', NULL, NULL, '2022-09-28 17:31:59.833+00', '2022-09-28 17:31:59.833+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('68d7b428-c5c0-454a-96fb-acf485a1289a', 0, '8e9c188c-0f1f-4c99-ac89-0709970345bd', '2d1f5012-dff5-401d-8503-628439ca8ef2', NULL, NULL, '2022-09-28 17:31:59.835+00', '2022-09-28 17:31:59.835+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('94120afd-7d8a-4c67-b773-273edee324eb', 1, '8e9c188c-0f1f-4c99-ac89-0709970345bd', '7c5864c6-634d-476d-a8b0-ca7ed5900345', NULL, NULL, '2022-09-28 17:31:59.836+00', '2022-09-28 17:31:59.836+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('4b9bed58-101f-4fef-8396-907bdb6cb43a', 3, '8e9c188c-0f1f-4c99-ac89-0709970345bd', '1e14bc37-c5a8-4667-bc78-01a633a23520', NULL, NULL, '2022-09-28 17:31:59.84+00', '2022-09-28 17:31:59.84+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('aed56b81-79f2-4d60-9e63-fabe08620222', 4, '8e9c188c-0f1f-4c99-ac89-0709970345bd', '51cfa034-9e56-4564-9ed7-e3b4bceda731', NULL, NULL, '2022-09-28 17:31:59.843+00', '2022-09-28 17:31:59.843+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('a35e7a48-f16f-40bc-ad51-71183939ebe1', 6, '8e9c188c-0f1f-4c99-ac89-0709970345bd', '78f6da45-91e4-40c9-8447-b99581528139', NULL, NULL, '2022-09-28 17:31:59.847+00', '2022-09-28 17:31:59.847+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('09ef9fcf-9699-4f70-a5b1-03321fe390af', 8, '8e9c188c-0f1f-4c99-ac89-0709970345bd', 'c8bbe191-823c-430f-86d2-d8c2b2ee7a6c', NULL, NULL, '2022-09-28 17:31:59.849+00', '2022-09-28 17:31:59.849+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('cc8ff9ca-9ecc-4ce6-a594-09325a42ca7c', 1, '58991f22-b172-48e4-8b27-e0a4c946f9b2', '3dc37b61-31ef-4070-b9eb-73e869e8e0ab', NULL, NULL, '2022-09-28 17:31:59.851+00', '2022-09-28 17:31:59.851+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('e4fdc43b-2b99-45e2-9874-8230c3296815', 2, '58991f22-b172-48e4-8b27-e0a4c946f9b2', 'fcf41302-e549-4ab9-9937-f0bfead5a44f', NULL, NULL, '2022-09-28 17:31:59.853+00', '2022-09-28 17:31:59.853+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('9d59a389-6777-41d5-bcd0-86d6d9a33110', 5, '58991f22-b172-48e4-8b27-e0a4c946f9b2', '96b5e86a-76b0-40ee-94ab-5226da627b62', NULL, NULL, '2022-09-28 17:31:59.857+00', '2022-09-28 17:31:59.857+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('f84a89e1-1e5c-47d5-a07e-9bfc64ef4ff0', 6, '58991f22-b172-48e4-8b27-e0a4c946f9b2', '2684ca14-9864-4377-aab9-7a471b1f8d14', NULL, NULL, '2022-09-28 17:31:59.858+00', '2022-09-28 17:31:59.858+00', NULL);
        INSERT INTO public.track_group_items (id, index, track_group_id, track_id, track_performers, track_composers, updated_at, created_at, deleted_at) 
            VALUES ('ed84cd42-8990-4d8e-a9f6-e00aaacdc2bb', 8, '58991f22-b172-48e4-8b27-e0a4c946f9b2', '374d19fc-18af-474d-8c19-debc993db991', NULL, NULL, '2022-09-28 17:31:59.861+00', '2022-09-28 17:31:59.861+00', NULL);
       `
    ).catch(e => {
      console.log('e', e)
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('track_groups', null, {})
    await queryInterface.bulkDelete('tracks', null, {})
    await queryInterface.bulkDelete('track_group_items', null, {})
    await queryInterface.bulkDelete('plays', null, {})
    await queryInterface.bulkDelete('user_groups', null, {})
    await queryInterface.bulkDelete('user_memberships', null, {})
    await queryInterface.bulkDelete('credits', null, {})
    await queryInterface.bulkDelete('playlists', null, {})
    // FIXME: vvv ?
    return queryInterface.bulkDelete('files', null, {})
  }
}
