# Auth-Ticket Client

This is the client-side application for the Auth-Ticket system. It provides user authentication, ticket display, and project search functionalities.

## Features

- User authentication (ID and PIN)
- Ticket display with QR code
- Add tickets to Google Wallet
- Search and filter projects
- View project locations on a map

## Getting Started

To run this project locally, follow these steps.

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/auth-ticket.git
    cd auth-ticket/auth-ticket-client
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the project root and set the following variables. Refer to the `.env.example` file.

```
VITE_API_URL=http://localhost:7071/api
VITE_EVENT_NAME=Event Name
VITE_HOW_TO_TICKETING_URL=https://example.com/how_to_ticketing.pdf
```

- `VITE_API_URL`: The URL of the backend API.
- `VITE_EVENT_NAME`: The name of the event displayed on the ticket.
- `VITE_HOW_TO_TICKETING_URL`: The URL to a page explaining how to issue tickets.

### Running the Development Server

```bash
npm run dev
```

This will start the development server locally.

### Building for Production

To build the application for production, run the following command:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This application can be deployed to any static site hosting service, such as Azure Static Web Apps. Refer to the documentation of the respective service for deployment instructions.