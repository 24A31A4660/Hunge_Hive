import 'leaflet/dist/leaflet.css';
import './globals.css';
import { Providers } from '../components/Providers';

export const metadata = {
  title: 'HungerHive – Smart Food Donation & Hunger Management',
  description: 'Connect surplus food with people in need. HungerHive reduces food waste by intelligently matching donors with NGOs and volunteers for efficient food distribution.',
  keywords: 'food donation, hunger management, food waste, NGO, volunteer, food distribution',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

