
# How the test data was made

**Note:** The test data for the File Upload process was created using a different method that what is described here. You can read about the File Upload test data creation process [here](./HowTheFileUploadTestDataWasMade.md).

TL;DR: Add new test data by creating new SQL INSERT INTO statements in a new test data seeder in the `api/src/db/seeders/test` folder. Create a new seeder in order to not disrupt the existing test data. You will need to re-seed the test database, as if you were starting the test container for the first time.

You should never replace the existing test data set. If you do, you will have to rewrite every assertion in every test.

Please DO NOT change the existing SQL statements / test seeders. You can add new test data to the test data set by creating new test seeders in the `api/src/db/seeders/test` directory and adding the appropriate SQL INSERT INTO statements into the new seeders.

What follows is an overview of the process that created the original test data set. It might help you figure out how to create additional, new test data:

* The development Docker container was started up
* The pgsql service in this Docker container was accessed externally using pgAdmin
* A database backup was created, using pgAdmin 'Backup Server...'
  * On the 'General' tab
    * Use 'Plain' format
    * Enter a filename / location 
    * Encoding: UTF-8
    * Role name: resonate
  * On the 'Data/Objects' tab
    * 'Type of Objects'
      * Only data
  * On the 'Options' tab
    * 'Queries'
      * 'Use Column Inserts' set to true
      * 'Use Insert Commands' set to true
  * Click 'Backup'
* Now there is a plain text/sql file at the name/location you saved
  * This file should contain a lot of INSERT INTO statements.
  * These statements go into api/src/db/seeders/test files.
    * You will need to work out which statements belong in which file. It is probably best to create new seeder files, so that the original, base data is not disrupted.

* Don't forget to re-seed the database after you enter all of the INSERT INTO statements.