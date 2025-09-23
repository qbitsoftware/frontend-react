import { useState } from "react";

interface Video {
  url: string;
  title: string;
  thumbnail?: string;
}

const videos: Video[] = [
  {
    url: "https://www.youtube.com/watch?v=UBTGfE6J39Y&t=3530s",
    title: "Eesti Meistrivõistlused '25 Finaal",
    thumbnail: "/thumbnails/emv_thumbnail.png",
  },
  {
    url: "https://www.youtube.com/watch?v=9ss7SA0LnPQ&ab_channel=EestiLauatenniseliit",
    title: "Meistriliiga '25 TalTech vs Viimsi PINX",
    thumbnail: "/thumbnails/taltech-pinx.png",
  },
  {
    url: "https://www.youtube.com/watch?v=-rcQ7cwEZAo",
    title: "Meistriliiga '25 Viimsi PINX vs Tartu SS Kalev",
    thumbnail: "/thumbnails/pinx-kalev.png",
  },
  {
    url: "https://www.youtube.com/watch?v=eE-89ZA6B34",
    title: "Meistriliiga '25 Viimsi LTK vs Maardu Forus",
    thumbnail: "/thumbnails/viimsi-maardu.png",
  },
  {
    url: "https://www.youtube.com/watch?v=qfrVjumKaow",
    title: "Meistriliiga '25 LTK Kalev vs LTK Sakala",
    thumbnail: "/thumbnails/kalev-sakala.png",
  },
];

const VideoBoard = () => {
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());

  const getVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const handlePlayVideo = (index: number) => {
    setPlayingVideos((prev) => new Set(prev).add(index));
  };

  return (
    <div className="h-[280px] sm:h-[320px] md:h-[360px] lg:h-[800px] rounded-md sm:rounded-lg overflow-hidden">
      <div className="h-full flex-col gap-2 sm:gap-3 lg:gap-2 overflow-y-auto scrollbar-hide">
        {videos.map((video, index) => {
          const videoId = getVideoId(video.url);
          if (!videoId) return null;

          const isPlaying = playingVideos.has(index);

          return (
            <div
              key={index}
              className="group flex-shrink-0 w-full bg-slate-50 border border-gray-200 mb-3 rounded-md pb-2 hover:border-[#4C97F1]/30 hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => handlePlayVideo(index)}
            >
              <div className="relative mb-2">
                {!isPlaying ? (
                  <>
                    <img
                      src={
                        video.thumbnail ||
                        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                      }
                      alt={video.title}
                      className="w-full aspect-video rounded-t-md object-cover transition-transform duration-300"
                      onError={(e) => {
                        if (
                          video.thumbnail &&
                          e.currentTarget.src === video.thumbnail
                        ) {
                          e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                        } else {
                          e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/70 rounded-full p-2 sm:p-3 group-hover:bg-[#4C97F1]/90 group-hover:scale-110 transition-all duration-300">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`}
                    className="w-full aspect-video rounded-md"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
              <h3 className="px-2 text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-[#4C97F1] transition-colors duration-200 leading-tight">
                {video.title}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoBoard;
