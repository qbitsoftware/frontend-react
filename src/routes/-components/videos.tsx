const videos = [
    { url: "https://www.youtube.com/watch?v=9ss7SA0LnPQ&ab_channel=EestiLauatenniseliit" },
]

const VideoBoard = () => {
    const getVideoId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return match ? match[1] : null;
    };

    return (
        <div className="flex flex-col space-y-4">
            {videos.map((video, index) => {
                const videoId = getVideoId(video.url);
                if (!videoId) return null;

                return (
                    <iframe
                        key={index}
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
                        className="w-full aspect-video rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                );
            })}
        </div>
    )
}

export default VideoBoard

