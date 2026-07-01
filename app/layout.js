export const metadata = {
    title: 'Tranquilamaria',
    description: 'Control financiero personal',
};

export default function RootLayout({ children }) {
    return (
          <html lang="es">
            <body>{children}</body>
      </html>
    );
}
