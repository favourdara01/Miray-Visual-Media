import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import Video from "yet-another-react-lightbox/plugins/video";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function FullscreenViewer({ open, setOpen, media, index }) {
  const slides = media.map((item) => {
    if (item.type === "video") {
      return {
        type: "video",
        width: 1280,
        height: 720,
        sources: [
          {
            src: item.url,
            type: "video/mp4",
          },
        ],
      };
    }

    return {
      src: item.url,
    };
  });

  return (
    <Lightbox
      open={open}
      close={() => setOpen(false)}
      slides={slides}
      index={index}
      plugins={[Video, Thumbnails, Zoom]}
      animation={{ fade: 300 }}
      carousel={{
        finite: false,
      }}
      styles={{
        container: { backgroundColor: "rgba(0,0,0,0.95)" },
      }}
    />
  );
}