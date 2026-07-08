This is a Full Stack Web Application using react as frontend and laravel as backend 
This App allows the user to create an account and projects.
When the project is created as the owner of the project you can add members and assign them as manager if you want them to manage the project.
AS a manager or an owner of the project you can create tasks and assign them to the members or even managers.
When the task is done they will be mark as done and a progress bar will be updated to keep track of the progress of your project.

Tech Stack
(BACKEND)
-Laravel

(FRONTEND)
-React

(DATABASE)
-Mysql

BACKEND SETUP
-cd backend
-composer install
-set the .env in your localhost mysql database
-php artisan migrate
-php artisan db:seed
-php artisan serve

FRONTEND SETUP
-cd frontend
-npm install
-npm run dev


