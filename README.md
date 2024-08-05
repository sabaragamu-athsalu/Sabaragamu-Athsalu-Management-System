# Sabaragamu Athsalu Inventory Management System

## Description

The Sabaragamu Athsalu Inventory Management System is an innovative and robust solution designed to streamline and optimize inventory processes for our valued client. Our system addresses the critical need for efficient management of stock, seamless tracking of inventory levels, and enhanced operational efficiency. By automating and simplifying inventory tasks, our solution enables the client to maintain accurate records, reduce manual errors, and ensure timely availability of products.

## Table of Contents

1. [Installation](#installation)
2. [Database Setup](#database-setup)
3. [Usage](#usage)
4. [Features](#features)
5. [Contributing](#contributing)
6. [License](#license)
7. [Additional Sections](#additional-sections)

## Installation

### Prerequisites

- Node.js (v12.x or higher)
- npm (v6.x or higher)
- MySQL

### Steps

1. **Download the zip file and extract it:**
   ```sh
   Sabaragamu-Athsalu-Management-System.zip
   ```
2. **Navigate to the extracted project directory:**
   ```sh
   cd Sabaragamu-Athsalu-Management-System
   ```
3. **Install the dependencies for both the API and the client:**

   ```sh
   # Install API dependencies the root folder
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

## Database Setup

### Configuration

1. **Update the `config/config.json` file in the `api/config` directory to match your database setup. Here is an example configuration for MySQL:**
   ```json
   {
     "development": {
       "username": "your_db_user",
       "password": "your_db_password",
       "database": "your_db_name",
       "host": "your_db_host",
       "dialect": "mysql"
     },
     "test": {
       "username": "your_db_user",
       "password": "your_db_password",
       "database": "your_db_name",
       "host": "your_db_host",
       "dialect": "mysql"
     },
     "production": {
       "username": "your_db_user",
       "password": "your_db_password",
       "database": "your_db_name",
       "host": "your_db_host",
       "dialect": "mysql"
     }
   }
   ```

### Creating the Database

1. **Using MySQL CLI:**

   ```sh
   mysql -u your_db_user -p
   CREATE DATABASE sabaragamu_athsalu;
   ```

2. **Using phpMyAdmin:**
   1. Open phpMyAdmin in your browser (usually accessible via `http://localhost/phpmyadmin` or through your hosting provider's control panel).
   2. Log in to phpMyAdmin with your database username and password.
   3. Click on the "New" button in the left sidebar.
   4. Enter a name for your database and select the appropriate collation (usually `utf8_general_ci`).
   5. Click "Create".

### Migrations and Seeding

1. **Run migrations to set up the database schema:**

   ```sh
   cd api
   npx sequelize-cli db:migrate
   ```

2. **Seed the database with initial data if you have seed files:**
   ```sh
   npx sequelize-cli db:seed:all
   ```

### Importing Database File Using phpMyAdmin

1. **Open phpMyAdmin in your browser (usually accessible via `http://localhost/phpmyadmin` or through your hosting provider's control panel).**
2. **Log in to phpMyAdmin with your database username and password.**
3. **Create a new database if you haven't done so already.**
4. **Select the newly created database from the left sidebar.**
5. **Go to the "Import" tab.**
6. **Click on the "Choose File" button and select your .sql file.**
7. **Ensure the format is set to SQL.**
8. **Click the "Go" button to start the import process.**

## Usage

### Running the Application

1. **To start the development server for both the API and the client:**

   ```sh
   # Start the API server from the root folder
   npm run dev

   # Start the client server
   cd client
   npm run dev
   ```

2. **Open `http://localhost:5173` to view the client in the browser.**
