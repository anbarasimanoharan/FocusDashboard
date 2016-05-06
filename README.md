# FocusDashboard

####Initial installation and setting up the database
- Fork or clone this repo
- Install PostgreSQL 9.3.12 and pgAdminIII
- Run the create database query found in the schema.sql in the project folder reactjs-adminlte
- Within the database run the create table queries present in schema.sql
- For each table created the corresponding csv file is located at csv_files in the reactjs-adminlte folder. In pdAdmin right click on each table and click import -> In file options, select the filename as the corresponding tables available as csv in the csv-files folder. select format as csv. In columns uncheck the column 'id' and click on 'Import' button. 

#### Instructions to run
- Install nodejs and NPM
- Go to the project folder reactjs-adminlte from your terminal and run `npm install`
- Run `node server.js`
- Going to [http://localhost:8000](http://localhost:8000) will render an initial page where you can select a user from the dropdown to get a dashboard for that user.
