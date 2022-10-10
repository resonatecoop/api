
# How the test data was made

TL;DR: Add new test data by creating new SQL INSERT INTO statements into the appropriate test data seeder in the `api/src/db/seeders/test` folder.

You should never replace the existing test data set. If you do, you will have to rewrite every assertion in every test.

DO NOT change the existing SQL statements.

That being said, you might need to add new test data. What follows is an overview of the process that created the original test data set. It might help you figure out how to create additional, new test data:

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
    * You will need to work out which statements belong in which file.

* Don't forget to run the test seeders after you enter all of the INSERT INTO statements.