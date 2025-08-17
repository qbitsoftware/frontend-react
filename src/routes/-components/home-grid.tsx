import { useRef } from "react";
import WidgetWrapper from "./widget-wrapper";
import NewsWidget from "./news-widget";
import CalendarWidget from "./calendar-widget";
import RatingWidget from "./rating-widget";
import Adboard from "./adboard";
import { useTranslation } from "react-i18next";
import VideoBoard from "./videos";

const HomePageGrid = () => {
  const { t } = useTranslation();
  const newsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const adboardRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full min-h-screen mx-auto px-2 sm:px-4 md:px-6 lg:px-4 relative max-w-[95%]">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-white drop-blur-lg"></div>
        <div className="absolute inset-0 bg-[url('/sun-tornado.svg')] bg-no-repeat bg-cover opacity-20 block"></div>
      </div>
      <div className="relative z-10">
        {/* Top Section: News and Calendar - Mobile Stacked, Desktop Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 my-4 sm:my-6 lg:my-8 mb-8 sm:mb-12 lg:mb-16">
          <div className="flex flex-col">
            <WidgetWrapper
              heading={t("homepage.news.name")}
              addr="uudised"
              icon="news"
            >
              <div className="py-2 px-2 sm:px-4 flex-grow" ref={newsRef}>
                <NewsWidget />
              </div>
            </WidgetWrapper>
          </div>
          <div className="flex flex-col">
            <WidgetWrapper
              heading={t("homepage.calendar.name")}
              addr="voistlused"
              icon="calendar"
            >
              <div className="py-2 px-2 sm:px-4 flex-grow" ref={calendarRef}>
                <CalendarWidget
                />
              </div>
            </WidgetWrapper>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-2 my-4 sm:my-6 lg:my-8">
          <div className="flex flex-col order-3 sm:order-3 lg:order-1">
            <div className="h-full">
              <div className="lg:mt-[calc(3.5rem+1px)]">
                <div className="p-1 sm:p-2 flex-grow scrollbar-hide overflow-hidden" ref={adboardRef}>
                  <Adboard />
                </div>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-2 flex flex-col order-1 sm:order-1 lg:order-2">
            <WidgetWrapper
              heading={t("homepage.ranking.name")}
              addr="reiting"
              icon="ranking"
            >
              <div className="py-2 px-1 sm:px-2 flex-grow" ref={ratingRef}>
                <RatingWidget />
              </div>
            </WidgetWrapper>
          </div>

          {/* Videos Widget - Full width on mobile, half width on tablet, quarter width on desktop */}
          <div className="flex flex-col order-2 sm:order-2 lg:order-3">
            <WidgetWrapper
              heading={t("homepage.videoboard.name")}
              addr="#"
              icon="videos"
            >
              <div className="py-2 px-1 sm:px-2 flex-grow scrollbar-hide overflow-hidden" ref={videosRef}>
                <VideoBoard />
              </div>
            </WidgetWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageGrid;
