const ads = [
  {
    url: "https://uus.lauatennis.ee/wp-content/uploads/2021/09/eadse_logo_full-1024x155.png",
  },
  {
    url: "https://uus.lauatennis.ee/wp-content/uploads/2023/05/RollmerFOTO.png",
  },
  {
    url: "https://tibhar.info/wp-content/uploads/2023/10/tibhar_site_image.jpg",
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
    <div className="flex flex-col space-y-4">
      {ads.map((ad, index) => (
        <img key={index} src={ad.url} />
      ))}
    </div>
  );
};

export default Adboard;
