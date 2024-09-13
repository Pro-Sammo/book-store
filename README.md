# Book Store

## Features

- CRUD operations for books and authors
- Input validation with Express Validator
- Error handling with meaningful HTTP status codes
- TypeScript for type safety
- Database support for MySQL
- Environment configuration with .env file

## Requirements

- Node.js (v18 or higher)
- MySQL
- Knex
- TypeScript
- Express
- Express Validator
- mysql2
- bcryptjs
- cookie-parser
- cors
- dotenv
- jsonwebtoken

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DB_HOST`

`DB_PORT`

`DB_USER`

`DB_PASSWORD`

`DB_NAME`

`CORS_ORIGIN`

`PORT`

`JWT_SECRET_KEY`

## Setup

Clone the repository:

```bash
 git clone https://github.com/Pro-Sammo/book-store.git
 cd book-store
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```bash
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
CORS_ORIGIN=
PORT=
JWT_SECRET_KEY=
```

Execute .sql file in the database:

```bash
userSchema.sql
authorSchema.sql
bookSchema.sql
```

Build the server:

```bash
npm run build
```

Start the server:

```bash
npm start
```

The API will be available at http://localhost:4000
