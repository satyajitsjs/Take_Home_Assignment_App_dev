# Take_Home_Assignment_App_dev_v2

```markdown
# Sales and Stock Management Single Page Application (SPA)

This project is a Single Page Application (SPA) for managing sales, stock, and profit information using a dashboard. It includes:

- Secure user login
- CSV file imports for database population
- The ability to add and update invoices

The solution is containerized using Docker (optional), supports asynchronous operations, and uses Django for the backend and React for the frontend.


## Features

- **User Authentication**: Secure login and logout using JWT tokens.
- **Dashboard**: View stock, sales, and profit data with filters like:
  - Store name
  - City
  - Zip Code
  - Store Location
  - County Number, County
  - Category, Category Name
  - Vendor Number, Vendor Name
  - Item Number
  - Aggregated data at city, county, and zip code levels.
- **CSV Import**: Import CSV files to populate the database with stock, sales, and profit data.
- **Invoice Management**: Add, update, and delete invoices from the UI, with real-time updates on the dashboard.
- **Error Handling**: Display an error page if any issues occur during operations.
- **Token Blacklisting**: Invalidate access and refresh tokens on logout for security.

## Tech Stack

- **Frontend**: React, JavaScript/TypeScript
- **Backend**: Django, Django REST framework
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with access and refresh token handling
- **Containerization**: Docker

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/satyajitsjs/Take_Home_Assignment_App_dev.git
   cd Take_Home_Assignment_App_dev
   ```

2. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the following environment variables:

   ```env
   # PostgreSQL settings
   POSTGRES_DB=take_home
   POSTGRES_USER=take_home
   POSTGRES_PASSWORD=take_home
   POSTGRES_HOST=db
   POSTGRES_PORT=5432

   # Cache settings
   CACHE_TIMEOUT=3600
   
  SECRET_KEY='django-insecure-84b7r&uz7*^1$)g++4$65jljc(d9r4+@k-kl_o9a+f06$xwc4f'
  DEBUG=False
  ALLOWED_HOSTS=*

3. **Set Up Backend (Django)**

   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Apply migrations:
     ```bash
     python manage.py migrate
     ```
   - Run the development server:
     ```bash
     python manage.py runserver --insecure 
     ```

4. **Set Up Frontend (React)**

   - Navigate to the 

sales-management-frontend

 directory:
     ```bash
     cd sales-management-frontend
     ```
   - Install frontend dependencies:
     ```bash
     npm install
     ```
   - Start the frontend:
     ```bash
     npm start
     ```

5. **Run with Docker**

   - Ensure you have Docker installed.
   - Build and run the container:
     ```bash
     docker-compose up --build
     ```
   - Open a terminal and use the following commands to copy the dump data to the Docker database:
     ```bash
     docker cp local_db_backup_v2.dump db:/local_db_backup_v2.dump
     docker exec -it db bash
     pg_restore -U take_home -d take_home -v /local_db_backup_v2.dump
     ```

## Usage

- **Login**: Use the provided credentials or register a new user.
- **Dashboard**: Filter sales, stock, and profit data using the dashboard filters.
- **Invoice Management**: Add, update, or delete invoices and see the dashboard update in real-time.
- **CSV Import**: Upload a CSV file to populate the database.

## Assumptions and Decisions

- **Backend Framework**: Django was chosen for its robustness in handling APIs and its compatibility with DRF (Django REST framework) for building RESTful APIs.
- **Frontend Framework**: React was chosen for its ease of integration, reactivity, and developer-friendly ecosystem.
- **Database**: PostgreSQL was used for its robustness and scalability.
- **Asynchronous Processing**: Async tasks are used for handling large CSV file imports and ensuring responsive UI.

## API Endpoints (OpenAPI Spec)

| Method | Endpoint                     | Description                                |
|--------|-------------------------------|--------------------------------------------|
| POST   | `/api/login/`                 | User login                                 |
| POST   | `/api/logout/`                | User logout and token blacklisting         |
| GET    | `/api/dashboard/`             | Fetch dashboard data                       |
| POST   | `/api/invoices/`              | Create a new invoice                       |
| GET    | `/api/invoices/`              | List paginated invoices                    |
| PUT    | `/api/invoices/{invoice_id}/` | Update an invoice                          |
| DELETE | `/api/invoices/{invoice_id}/` | Delete an invoice                          |

## Design Patterns
- **Service Layer Pattern**: The application is divided into layers, separating the business logic from the API logic.
- **Factory Pattern**: Used for generating tokens and invoices.
- **Observer Pattern**: Real-time updates on the dashboard after invoice creation and updates.

## Architecture

The following diagram outlines the architecture:

```plaintext
+-------------------+          +-----------------------+
|  Frontend (React) | <------> | Backend (Django REST) |
+-------------------+          +-----------------------+
         |                            |
         v                            v
+-------------------+          +-----------------------+
| Database (PostgreSQL) |      | Async Processing      |
+-------------------+          +-----------------------+
```

## License

This project is licensed under the MIT License.

---