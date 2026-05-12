import "../globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";
import CartProvider from "@/components/CartProvider";
import AuthProvider from "@/components/AuthProvider";

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    title: locale === "fa" ? "سهندکاور" : "SahandCover",
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === "fa";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <CartProvider>
              <AuthProvider>
                <Navbar locale={locale} />
                <main className="flex-1">{children}</main>
                <Footer />s
              </AuthProvider>
            </CartProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
