# FocusDashboard

Software engineers have the opportunity to get distracted easily. They have entertainment accessible to them all the time. The level of focus and the time they spend focused on work is going to determine the success of the organization.

The dataset available contains details of a set of employees including
- focus level at different times
- the category of action they are performing
- The times of the interruptions and their performance during those times
- The tool they are using
- The searches made online, the website they are using and description of the searches
- User details like their professional level, focus category (highly focused/not)

With the data available, processing and analysis can give valuable information like
- When is a person/team most focused?
- The time when a person is most unproductive
- The focus level of a person when performing various actions like learning, debugging etc.
- The level of focus while using a particular tool
- What are the different activities they perform over a duration and how does the number of activity or types of activity affect the focus level

Finding answers for these kind of questions will in turn lead to an actual understanding of the factors that affect the performance of an individual. Thus, a visualization for the above questions will act as an aid in making better decisions.

####Instructions to run
- Fork or clone this repo
- Install nodejs and NPM
- Install PostgreSQL 9.3.12 and pgAdminIII (available in Ubuntu Software Center or at [http://www.pgadmin.org/download/](http://www.pgadmin.org/download/) with username and password as 'postgres'
- Go to the project folder from your terminal and run `npm install pg`
- Run the create database query located at reactjs-adminlte/db/schema.sql
- Within the database run the create table queries present in the location reactjs-adminlte/db/schema.sql
- For each table created the corresponding csv file is located at [drive](https://drive.google.com/open?id=0BwSv3c2aQOYRelBSdmNCZ1p4VGs). In pdAdmin right click on each table and click import -> In file options, select the filename as the corresponding tables available as csv in the csv-files folder. select format as csv. In columns uncheck the column 'id' and click on 'Import' button. 
- Go to the project folder reactjs-adminlte from your terminal and run `npm install`
- Run `node server.js`
- Going to [http://localhost:8000](http://localhost:8000) will render an initial page where you can select a user from the dropdown to get a dashboard for that user.
