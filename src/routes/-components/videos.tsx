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
];

const VideoBoard = () => {
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());

  const getVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    );
    return match ? match[1] : null;
  };

  const handlePlayVideo = (index: number) => {
    setPlayingVideos((prev) => new Set(prev).add(index));
  };

  return (
    <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[790px] flex flex-col rounded-lg sm:rounded-xl overflow-hidden">
      <div className="h-full overflow-y-auto scrollbar-hide space-y-2 sm:space-y-3 lg:space-y-4 p-2 sm:p-3 lg:p-0">
        {videos.map((video, index) => {
          const videoId = getVideoId(video.url);
          if (!videoId) return null;

          const isPlaying = playingVideos.has(index);

          return (
            <div key={index} className="group bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 hover:border-[#4C97F1]/30 hover:shadow-lg hover:shadow-[#4C97F1]/10 transition-all duration-300">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-[#4C97F1] transition-colors duration-200">
                {video.title}
              </h3>
              <div className="relative">
                {!isPlaying ? (
                  <>
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full aspect-video rounded-md sm:rounded-lg object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
                      onError={(e) => {
                        if (video.thumbnail && e.currentTarget.src === video.thumbnail) {
                          e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                        } else {
                          e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }
                      }}
                      onClick={() => handlePlayVideo(index)}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={() => handlePlayVideo(index)}
                    >
                      <div className="bg-black/70 rounded-full p-2 sm:p-3 lg:p-4 group-hover:bg-[#4C97F1]/90 group-hover:scale-110 transition-all duration-300">
                        <svg
                          className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white"
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
                    className="w-full aspect-video rounded-md sm:rounded-lg border-2 border-[#4C97F1]/20"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoBoard;
