const ads = [
  {
    url: "./tt11.png",
  },
  {
    url: "https://tibhar.info/wp-content/uploads/2023/10/tibhar_site_image.jpg",
  },
  {
    url: "https://uus.lauatennis.ee/wp-content/uploads/2021/09/eadse_logo_full-1024x155.png",
  },
  {
    url: "https://uus.lauatennis.ee/wp-content/uploads/2023/05/RollmerFOTO.png",
  },
  {
    url: "https://www.suusaliit.ee/cache/suusaliit/public/news2_img/_1200x800x0/21939_Logo_EOK_eestikeelne.jpg",
  },
  {
    url: "https://www.ettu.org/wp-content/uploads/2024/09/ETTU_logo_color_cmyk_high.jpg",
  },
];

const Adboard = () => {
  return (
    <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[790px] flex flex-col overflow-hidden">
      <div className="h-full overflow-y-auto scrollbar-hide space-y-2">
        {ads.map((ad, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 hover:border-[#4C97F1]/30 hover:shadow-md transition-all duration-300"
          >
            <img
              src={ad.url}
              alt={`Advertisement ${index + 1}`}
              className="w-full h-auto max-h-24 sm:max-h-32 lg:max-h-40 object-contain rounded transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Adboard;
