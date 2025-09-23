import { useState, useEffect } from "react";

const AnnouncementBoard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const announcements = [
    {
      title: "Naiste Kuldliiga 2025/26",
      dates: "25. oktoober - 2. mai",
      image: "/kuldliiga-2526.jpg",
      gradient: "from-[#4C97F1]/60 to-blue-600/85",
      width: "w-[30%]"
    },
    {
      title: "Meistriliiga 2025/26",
      dates: "25. oktoober - 2. mai",
      image: "/meistriliiga-banner.jpg",
      gradient: "from-[#4C97F1]/60 to-blue-700/85 lg:from-blue-800/75 lg:to-blue-900/90",
      width: "w-[60%]",
      shadow: "shadow-lg"
    },
    {
      title: "Võistkondlikud 2025/26",
      dates: "26. oktoober - 3. mai",
      image: "/teams.jpg",
      gradient: "from-[#4C97F1]/60 to-blue-600/85",
      width: "w-[30%]"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="lg:hidden h-[80px] sm:h-[90px] py-3 px-3">
        <div className="w-full bg-center bg-cover rounded-md shadow-md flex flex-col items-center justify-center p-3 relative overflow-hidden" style={{ backgroundImage: `url('${announcements[currentIndex].image}')` }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${announcements[currentIndex].gradient}`}></div>
          <h3 className="text-sm sm:text-sm md:text-base font-bold text-white relative z-10 text-center">{announcements[currentIndex].title}</h3>
          <p className="text-[10px] sm:text-xs text-white/90 relative z-10 mt-1">{announcements[currentIndex].dates}</p>
        </div>
      </div>

      <div className="hidden lg:flex gap-3 h-[110px] py-3 px-4">
        {announcements.map((announcement, index) => (
          <div key={index} className={`${announcement.width} bg-center bg-cover rounded-md ${announcement.shadow || 'shadow-md'} flex flex-col items-center justify-center p-3 relative overflow-hidden`} style={{ backgroundImage: `url('${announcement.image}')` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${announcement.gradient}`}></div>
            <h3 className={`${index === 1 ? 'text-2xl' : 'text-lg'} font-bold text-white relative z-10 text-center`}>{announcement.title}</h3>
            <p className="text-xs text-white/90 relative z-10 mt-1">{announcement.dates}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default AnnouncementBoard;
