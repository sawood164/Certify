# Certificate Generator

A modern web application for managing and generating certificates for student clubs and events at VIT Bhopal.

## Features

### Admin Portal

- **Dashboard Overview**

  - Real-time statistics and analytics
  - Activity feed and notifications
  - Quick access to key features

- **User Management**

  - Add, edit, and manage student profiles
  - Role-based access control
  - Bulk user operations

- **Club Management**

  - Create and manage student clubs
  - Handle club membership requests
  - Track club activities and events

- **Event Management**

  - Create and manage events
  - Track event registrations
  - Generate event certificates

- **Certificate Generation**
  - Custom certificate templates
  - Bulk certificate generation
  - Digital signatures support
  - Certificate preview and download

### Student Portal

- **Dashboard**

  - View certificates and achievements
  - Track club memberships
  - View upcoming events

- **Club Management**

  - Browse available clubs
  - Request club membership
  - Track membership status

- **Event Management**
  - View and register for events
  - Track event participation
  - Download event certificates

## Tech Stack

- **Frontend**

  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Shadcn UI Components

- **Storage**
  - Firebase Firestore (Database)
  - Firebase Storage (Files)
  - Local Storage (Cache)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account

### Installation

1. Clone the repository

```bash
git clone https://github.com/sawood164/certificate-generator.git
cd certificate-generator
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
certificate-generator/
├── app/
│   ├── admin/              # Admin portal pages
│   ├── student/            # Student portal pages
│   ├── login/              # Authentication pages
│   └── layout.tsx          # Root layout
├── components/             # Reusable components
├── lib/                    # Utility functions
├── public/                 # Static assets
└── types/                  # TypeScript type definitions
```

## Usage

### Admin Portal

1. Login with admin credentials
2. Navigate to the desired section (Users, Clubs, Events, Certificates)
3. Use the interface to manage data and generate certificates

### Student Portal

1. Login with student credentials
2. Access dashboard to view certificates and club memberships
3. Register for events and request club memberships

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, email sawoodalam19@gmail.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- VIT Bhopal for inspiration
- All contributors and maintainers
- Open source community
