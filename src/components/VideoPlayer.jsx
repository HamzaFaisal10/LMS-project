// Plays YouTube, Vimeo or direct video links.
function embedUrl(url) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default function VideoPlayer({ url, onEnded, title }) {
  if (!url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-slate-900 text-sm text-slate-400">
        No video for this lesson
      </div>
    );
  }
  const embed = embedUrl(url);
  return (
    <div className="aspect-video w-full overflow-hidden bg-black">
      {embed ? (
        <iframe
          src={embed}
          title={title || 'Lesson video'}
          className="h-full w-full"
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <video key={url} src={url} controls onEnded={onEnded} className="h-full w-full" />
      )}
    </div>
  );
}
