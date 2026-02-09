# drone delivery system

this is a mock drone delivery system build using Node.js and Express.js. It allows users to create delivery orders, track their status, and manage drone deliveries.

## Features
- Create delivery orders with pickup and drop-off locations
- Track delivery status
- admin manage drones and deliveries

## Installation
1. Clone the repository
2. Navigate to the project directory
3. Run `npm install` to install dependencies
4. Run `npm run migrate` to set up the database
5. run `npm run db:seed` to seed the database with sample data
6. Run `npm start` to start the server
7. now you can access the API at `http://localhost:3000`

> make sure port 3000 is available on your machine before starting the server.

here is a sample Postman collection to test the API endpoints: [Postman Collection](https://qaytharaapi.postman.co/workspace/New-Team-Workspace~7d37179d-3a11-49f2-8524-10c5dbc6dd4d/collection/16294366-4c38c847-9470-4635-b82a-78890b1325bb?action=share&creator=16294366)
or you can import  use the attached Postman collection file to test the API endpoints.


## Testing
To run tests, use the following command:

> you need to rest the database before running the tests to ensure a clean state. You can do this by running the following command:
```
npm run test
```