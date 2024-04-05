# This is an express/node app

npx sequelize-cli init

## set up instructions

1) Create a blank copy of sqllite db and name it db.sqlite3 and place it in root folder
2) Run the migration command npx sequelize-cli db:migrate
3) Run the seed command npx sequelize-cli db:seed:all
4) npm install
5) npm start


# Notes
## Sequelize commands

### Generate model
npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string

### Generate migration
npx sequelize-cli migration:create --name modify_users_add_new_fields

### Run Migration
npx sequelize-cli db:migrate

### Undo Migration
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-create-posts.js

### Create Seed
npx sequelize-cli seed:generate --name demo-user

### Run seed
npx sequelize-cli db:seed:all

### Undo seed
npx sequelize-cli db:seed:undo

### Seed a particular file
npx sequelize-cli db:seed --seed my-seeder-file.js