import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const location = useLocation();

  if (location.pathname.includes("admin")) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-[#E0E8F1] mt-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-4 lg:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-6">
              <img
                src="/RLogo.png"
                alt={t("homepage.title")}
                className="h-16"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto md:mx-0 font-['Inter']">
              {t("homepage.description")}
            </p>
            
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-background border border-[#E0E8F1] rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#4C97F1] hover:border-[#4C97F1] transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-background border border-[#E0E8F1] rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#4C97F1] hover:border-[#4C97F1] transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-6 text-foreground font-['Inter'] relative">
              {t("footer.links")}
              <div className="absolute bottom-0 left-0 w-full h-px bg-[#4C97F1] opacity-20"></div>
            </h3>
            <nav>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/uudised"
                    className="text-sm text-muted-foreground hover:text-[#4C97F1] transition-colors duration-300 group flex items-center justify-center md:justify-start font-['Inter']"
                  >
                    <div className="w-1 h-1 bg-[#4C97F1] rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {t("navbar.menu.news.name")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/voistlused"
                    className="text-sm text-muted-foreground hover:text-[#4C97F1] transition-colors duration-300 group flex items-center justify-center md:justify-start font-['Inter']"
                  >
                    <div className="w-1 h-1 bg-[#4C97F1] rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {t("footer.menu.tournaments")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/klubid"
                    className="text-sm text-muted-foreground hover:text-[#4C97F1] transition-colors duration-300 group flex items-center justify-center md:justify-start font-['Inter']"
                  >
                    <div className="w-1 h-1 bg-[#4C97F1] rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {t("footer.menu.clubs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/kontakt"
                    className="text-sm text-muted-foreground hover:text-[#4C97F1] transition-colors duration-300 group flex items-center justify-center md:justify-start font-['Inter']"
                  >
                    <div className="w-1 h-1 bg-[#4C97F1] rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {t("footer.menu.contact")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-6 text-foreground font-['Inter'] relative">
              {t("footer.contact.name")}
              <div className="absolute bottom-0 left-0 w-full h-px bg-[#4C97F1] opacity-20"></div>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start group">
                <div className="w-8 h-8 bg-background border border-[#E0E8F1] rounded-md flex items-center justify-center mr-3 group-hover:border-[#4C97F1] transition-colors duration-300">
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-[#4C97F1] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground font-['Inter']">eltl@lauatennis.ee</span>
              </div>
              <div className="flex items-center justify-center md:justify-start group">
                <div className="w-8 h-8 bg-background border border-[#E0E8F1] rounded-md flex items-center justify-center mr-3 group-hover:border-[#4C97F1] transition-colors duration-300">
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-[#4C97F1] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground font-['Inter']">+372 514 3454</span>
              </div>
              <div className="flex items-center justify-center md:justify-start group">
                <div className="w-8 h-8 bg-background border border-[#E0E8F1] rounded-md flex items-center justify-center mr-3 group-hover:border-[#4C97F1] transition-colors duration-300">
                  <svg className="w-4 h-4 text-muted-foreground group-hover:text-[#4C97F1] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground font-['Inter']">Laki 3, 10621 Tallinn</span>
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-6 text-foreground font-['Inter'] relative">
              {t("footer.newsletter.title")}
              <div className="absolute bottom-0 left-0 w-full h-px bg-[#4C97F1] opacity-20"></div>
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed font-['Inter']">
              {t("footer.newsletter.description")}
            </p>
            <div className="space-y-4">
              <div className="flex rounded-md border border-[#E0E8F1] overflow-hidden">
                <input
                  type="email"
                  placeholder={t("footer.newsletter.placeholder")}
                  className="flex-1 px-4 py-2 text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none font-['Inter']"
                />
                <button className="px-4 py-2 bg-[#4C97F1] text-white hover:bg-[#4C97F1]/90 transition-colors duration-300 focus:outline-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#E0E8F1]">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground font-['Inter']">
              <p>
                {t("eltl.name")} &copy; {new Date().getFullYear()}. All rights reserved.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground font-['Inter']">Powered by</span>
              <a
                href="https://tournament10.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity duration-300 hover:opacity-80"
              >
                <img 
                  src="/t10logo_text.svg" 
                  alt="Tournament10" 
                  className="h-6" 
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
