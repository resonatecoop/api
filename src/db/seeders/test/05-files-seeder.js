// THIS HAS TO RUN AFTER THE TRACKGROUP SEEDER FILE
//    it updates tracks table, so tracks table needs records
//      tracks table is seeded in trackgroups seeder

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeds the files table with test audio. 30 files total, 10 per album
    return queryInterface.sequelize.query(
      `
        -- INSERT INTO FILES TABLE
        -- Album 01: Best Album Ever
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('b60f1759-6405-4457-9910-6da1ccd5f40f','whiteNoise5s1.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,466080,'4beb60bbdd05674f0dba63b09b010bb11762acb6','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('692a9e72-8278-4ae1-b9e3-e17c8773db77','whiteNoise5s2.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,466262,'5371f61d52ae3d7588a9f90d5b52528d67857a3d','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('57200189-5eb7-434e-a023-57baabea9eda','whiteNoise5s3.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465744,'0f7ca4aafe83e4d9d47ca639e70619e9ff028017','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('d2cbc2b4-36a6-4854-85f9-ed0aa0b46711','whiteNoise5s4.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465922,'e41b5530933a0661ecc89da6424831cb30fc25e0','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('1b41b2ec-36d8-4385-8f15-bd25b55005db','whiteNoise5s5.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465782,'ee8d6692958d799773912ef0e09d8ca8f51dd77f','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('843eb984-da5b-4244-8ed7-2678948cca19','whiteNoise5s6.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465889,'830e4a3619af1b8fdf21408097b7fe71727866a9','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('3d141f46-de2f-4b0f-af6e-34cf6b987805','whiteNoise50s1.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4229829,'7b54841c2a255d855b83bad7d7d33fb1fa82e199','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('911ba504-d74b-4cd6-83f6-33937e03cd46','whiteNoise50s2.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4229463,'b1834719452b4d2c26fb1dc9e6e8e69cf44c2713','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('6fe8b335-d3ae-42e2-b2ac-a26866402520','whiteNoise50s3.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4230134,'0520ac6300a81b025311b2b280e9b83591f98c3f','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('8b30f3c5-37e5-4cba-b99c-f3cb7b5c15d2','whiteNoise50s4.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4229714,'77663e2078cd959d8b2c0b35254e8867e44fd939','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');

        -- Album 02: Best Album Ever 2
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('57f0476b-c5cf-43c9-8aad-ede6bde080c4','whiteNoise50s5.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4229936,'fab462a50d7bcb72b0e33b48fe79d164bc559d21','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('69560f28-2953-4ed9-9a5d-a1a4cc7db047','whiteNoise50s6.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4228520,'45502bfd615c2eac137fdb07517edfb4431cf8d8','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('9ba71ad7-eb4f-4a56-b8da-e3f395f590ea','whiteNoise5s1.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,466080,'4beb60bbdd05674f0dba63b09b010bb11762acb6','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('9a99d504-9270-450f-b64f-06daed70fd5a','whiteNoise5s2.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,466262,'5371f61d52ae3d7588a9f90d5b52528d67857a3d','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('bf8f778a-793e-4e66-bf19-f10ede501ea3','whiteNoise5s3.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465744,'0f7ca4aafe83e4d9d47ca639e70619e9ff028017','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('1a20b4b0-b853-4e75-8815-f5148af2b64a','whiteNoise5s4.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465922,'e41b5530933a0661ecc89da6424831cb30fc25e0','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('dba9e81b-d32c-4541-a99a-c81cb8fb142b','whiteNoise5s5.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465782,'ee8d6692958d799773912ef0e09d8ca8f51dd77f','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('8a45c5c4-4986-4140-bcf2-ac55f072ee93','whiteNoise5s6.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465889,'830e4a3619af1b8fdf21408097b7fe71727866a9','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('4ef71341-1de3-4b19-b224-46878619f7a4','whiteNoise50s1.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4229829,'7b54841c2a255d855b83bad7d7d33fb1fa82e199','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('26de83c3-537a-4a09-8942-2deb1eb42a04','whiteNoise50s2.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4229463,'b1834719452b4d2c26fb1dc9e6e8e69cf44c2713','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');

        -- Album 03: Best Album Ever 3
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('f27f9c60-ed1c-436c-9382-72a26abf644d','whiteNoise50s3.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4230134,'0520ac6300a81b025311b2b280e9b83591f98c3f','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('c1a1aea3-25d5-4608-93e5-7616a7d25387','whiteNoise50s4.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4229714,'77663e2078cd959d8b2c0b35254e8867e44fd939','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('9013c592-1576-4fa4-b2ea-9953bf8a21b0','whiteNoise50s5.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4229936,'fab462a50d7bcb72b0e33b48fe79d164bc559d21','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('7d9df3f3-b85d-4f3f-8fbe-bf48e6f1cb51','whiteNoise50s5.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4229936,'fab462a50d7bcb72b0e33b48fe79d164bc559d21','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('ac4833b7-5aa5-4205-8d4a-c8c9575a2bc0','whiteNoise50s6.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,4228520,'45502bfd615c2eac137fdb07517edfb4431cf8d8','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('23d45613-5b56-4ceb-9a2c-efa266beaeeb','whiteNoise5s1.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,466080,'4beb60bbdd05674f0dba63b09b010bb11762acb6','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('de7dfe91-1122-4a64-a757-20d7817251a4','whiteNoise5s2.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,466262,'5371f61d52ae3d7588a9f90d5b52528d67857a3d','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('112e3c00-7727-4e7b-8e60-be0751d56a77','whiteNoise5s3.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465744,'0f7ca4aafe83e4d9d47ca639e70619e9ff028017','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('a6cb36e6-77ff-4a37-ba83-0d828b254183','whiteNoise5s4.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465922,'e41b5530933a0661ecc89da6424831cb30fc25e0','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        INSERT INTO public.files(id,filename,filename_prefix,owner_id,description,size,hash,status,mime,metadata,updated_at,created_at)
        VALUES ('7516dc73-e304-43a7-9f00-0ba387acac9b','whiteNoise5s5.m4a',NULL,'1c88dea6-0519-4b61-a279-4006954c5d4c',NULL,465782,'ee8d6692958d799773912ef0e09d8ca8f51dd77f','processing','audio/x-m4a',NULL,'2023-01-04 14:30:47.234+00','2023-01-04 14:30:47.234+00');
        
        -- UPDATE TRACKS TABLE TO LINK FILE (track_url) TO TRACK
        UPDATE public.tracks SET track_url = '6fe8b335-d3ae-42e2-b2ac-a26866402520' WHERE id = '0a103865-0c47-4c60-af3d-6d5c62203531';
        UPDATE public.tracks SET track_url = '1b41b2ec-36d8-4385-8f15-bd25b55005db' WHERE id = '0ba2f958-ab3a-4807-8247-567995d3ff47';
        UPDATE public.tracks SET track_url = '3d141f46-de2f-4b0f-af6e-34cf6b987805' WHERE id = '0bd6bdcb-ee99-4c30-b637-668c4ac0fee2';
        UPDATE public.tracks SET track_url = '9a99d504-9270-450f-b64f-06daed70fd5a' WHERE id = '1e14bc37-c5a8-4667-bc78-01a633a23520';
        UPDATE public.tracks SET track_url = 'de7dfe91-1122-4a64-a757-20d7817251a4' WHERE id = '2684ca14-9864-4377-aab9-7a471b1f8d14';
        UPDATE public.tracks SET track_url = '57f0476b-c5cf-43c9-8aad-ede6bde080c4' WHERE id = '2d1f5012-dff5-401d-8503-628439ca8ef2';
        UPDATE public.tracks SET track_url = 'a6cb36e6-77ff-4a37-ba83-0d828b254183' WHERE id = '374d19fc-18af-474d-8c19-debc993db991';
        UPDATE public.tracks SET track_url = 'd2cbc2b4-36a6-4854-85f9-ed0aa0b46711' WHERE id = '39565f69-cb1c-4e96-89d4-dc02b8fa6b16';
        UPDATE public.tracks SET track_url = 'c1a1aea3-25d5-4608-93e5-7616a7d25387' WHERE id = '3dc37b61-31ef-4070-b9eb-73e869e8e0ab';
        UPDATE public.tracks SET track_url = 'b60f1759-6405-4457-9910-6da1ccd5f40f' WHERE id = '44a28752-1101-4e0d-8c40-2c36dc82d035';
        UPDATE public.tracks SET track_url = '7d9df3f3-b85d-4f3f-8fbe-bf48e6f1cb51' WHERE id = '4f27cebc-1afb-4e2c-a7e7-a7e1002e1244';
        UPDATE public.tracks SET track_url = 'bf8f778a-793e-4e66-bf19-f10ede501ea3' WHERE id = '51cfa034-9e56-4564-9ed7-e3b4bceda731';
        UPDATE public.tracks SET track_url = '843eb984-da5b-4244-8ed7-2678948cca19' WHERE id = '556c6f38-9cfa-4b83-b379-1f663f8901e4';
        UPDATE public.tracks SET track_url = '57200189-5eb7-434e-a023-57baabea9eda' WHERE id = '56ea16b1-f732-4e46-a9a2-4a6bb3e64ecc';
        UPDATE public.tracks SET track_url = '7516dc73-e304-43a7-9f00-0ba387acac9b' WHERE id = '6bb1b466-82a7-4e6b-a173-16c3a8829d3d';
        UPDATE public.tracks SET track_url = '692a9e72-8278-4ae1-b9e3-e17c8773db77' WHERE id = '706cff12-ba44-49f7-8982-98b3996a2919';
        UPDATE public.tracks SET track_url = 'dba9e81b-d32c-4541-a99a-c81cb8fb142b' WHERE id = '78f6da45-91e4-40c9-8447-b99581528139';
        UPDATE public.tracks SET track_url = '69560f28-2953-4ed9-9a5d-a1a4cc7db047' WHERE id = '7c5864c6-634d-476d-a8b0-ca7ed5900345';
        UPDATE public.tracks SET track_url = '8a45c5c4-4986-4140-bcf2-ac55f072ee93' WHERE id = '7effd259-f531-42f7-bd06-f1182673ecd6';
        UPDATE public.tracks SET track_url = '112e3c00-7727-4e7b-8e60-be0751d56a77' WHERE id = '8221ddea-2cf7-457d-989f-a69df823ba09';
        UPDATE public.tracks SET track_url = '9ba71ad7-eb4f-4a56-b8da-e3f395f590ea' WHERE id = '92e91e90-e1cd-4bc7-b470-67421bc2f147';
        UPDATE public.tracks SET track_url = '23d45613-5b56-4ceb-9a2c-efa266beaeeb' WHERE id = '96b5e86a-76b0-40ee-94ab-5226da627b62';
        UPDATE public.tracks SET track_url = '911ba504-d74b-4cd6-83f6-33937e03cd46' WHERE id = 'aa67b1ed-3d86-419e-9d51-0a3cb91f4218';
        UPDATE public.tracks SET track_url = '1a20b4b0-b853-4e75-8815-f5148af2b64a' WHERE id = 'c62d1c4c-0c5a-4b6a-91c4-217cff092082';
        UPDATE public.tracks SET track_url = '4ef71341-1de3-4b19-b224-46878619f7a4' WHERE id = 'c8bbe191-823c-430f-86d2-d8c2b2ee7a6c';
        UPDATE public.tracks SET track_url = 'ac4833b7-5aa5-4205-8d4a-c8c9575a2bc0' WHERE id = 'ccb9b344-c26b-4efa-a595-beacdc7d163c';
        UPDATE public.tracks SET track_url = 'f27f9c60-ed1c-436c-9382-72a26abf644d' WHERE id = 'e2a99f8e-0d81-4fe8-9a85-5b6ca115ab44';
        UPDATE public.tracks SET track_url = '8b30f3c5-37e5-4cba-b99c-f3cb7b5c15d2' WHERE id = 'e5387217-6ab7-48be-909a-2925609a1024';
        UPDATE public.tracks SET track_url = '26de83c3-537a-4a09-8942-2deb1eb42a04' WHERE id = 'ede3c192-4ebe-48a8-b9f0-320e2bd4da8b';
        UPDATE public.tracks SET track_url = '9013c592-1576-4fa4-b2ea-9953bf8a21b0' WHERE id = 'fcf41302-e549-4ab9-9937-f0bfead5a44f';
      `
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('files', null, {})
  }
}
