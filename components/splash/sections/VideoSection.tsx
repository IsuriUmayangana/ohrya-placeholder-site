export default function VideoSection() {
  return (
    <section className="video-section">
      <div className="video-container">
        <div className="video-wrapper">
          <div className="video-embed">
            <iframe
              src="https://player.vimeo.com/video/1219833027?h=aa43739fa3&badge=0&autopause=0&player_id=0&app_id=58479"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              title="What is the $2500 campaign?"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
