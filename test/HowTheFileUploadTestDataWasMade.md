# How the File Upload test data was made
The File Upload test data provides data for the 'Best Album Ever', 'Best Album Ever 2', and 'Best Album Ever 3' track groups. This data was created and incorporated into the api several months after the original test data set was created.

The file upload data was generated differently than [the other test data](./HowTheTestDataWasMade.md). It was created by invoking an api endpoint in the file 'test/baseline/file/FileUpload.test.js'. Running this test file created data in two tables (inserts for the 'files' table, updates for the 'tracks' table) and outputted a set of processed audio files to the 'data/media/audio' folder. 

This was run as a test file simply because doing so emulated the actual upload process, resulting in useful test data for the seeding process. 

It is important to note that audio files that have not been processed by the api will not play back on the Resonate front end. This means you can't simply copy the original source audio ('whiteNoise*.m4a' files) to the 'data/media/audio' folder. The audio must be processed by the api in order to play back in the Beam / UI application. 

The resulting database data was incorportated into the '05-files-seeder.js' Sequelize seeder file.
The resulting audio files were copied into the 'test/media/audio' folder. They are copied to the 'data/media/audio' folder by a script named 'copyAudioFiles.sh', during the seeding process.

The seeder file and the copy script run as part of the docker:seed:all:test script.

# PLEASE NOTE
'test/baseline/file/FileUpload.test.js' is not a legitimate test file, and should have all of its tests set tp 'skip', to avoid running the test data generation process as part of the overall test suite. 

If deemed necessary, an exclude pattern for this test file can be added to the Mocha test runner config. A link to more info about doing so is [here](https://stackoverflow.com/questions/34301448/run-mocha-excluding-paths).