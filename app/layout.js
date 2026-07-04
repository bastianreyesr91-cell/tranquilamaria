import './globals.css';

export const metadata = {
        title: 'Tranquilamaria',
        description: 'Control financiero personal',
        manifest: '/manifest.json',
        appleWebApp: {
                    capable: true,
                    statusBarStyle: 'black-translucent',
                    title: 'Tranquilamaria',
        },
        icons: {
                    icon: [
                        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
                                ],
                    apple: '/apple-touch-icon.png',
        },
};

export const viewport = {
        themeColor: '#0f172a',
        width: 'device-width',
        initialScale: 1,
};

export default function RootLayout({ children }) {
        return (
                    <html lang="es">
                        <body>{children}</body>
            </html>
        );
}
