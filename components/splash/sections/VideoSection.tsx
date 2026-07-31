export default function VideoSection() {
  return (
    <section className="video-section">
      <div className="video-container">
        <div className="video-wrapper">
          <div className="video-embed">
            <iframe
              src="https://player.vimeo.com/video/1164417032?h=6ac660cc25&badge=0&autopause=0&player_id=0&app_id=58479"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Introduction to OHRYA"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
