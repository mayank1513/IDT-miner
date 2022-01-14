import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { albRow, audioRow } from "types";

export default function App() {
  const router = useRouter();
  const [albums, setAlbums] = useState<albRow[]>([])
  const [audios, setAudios] = useState<audioRow[]>([])
  useEffect(() => {
    // check for folders.dat and files.csv
    const path = router.query.app;
    if (!path) return;
    fetch('/api/app-data', {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        update: true
      }),
    }).then(res => res.json())
      .then(data => {
        console.log(data)
        setAlbums(data.albums);
        setAudios(data.audios);
      })
    return () => {

    }
  }, [router.query])
  return (
    <div>
      <h1>Albums</h1>
      {
        albums.map(a => (<p>{a.labels[0]}</p>))
      }
      <h1>Audios</h1>
      {
        audios.map(a => (<p>{a.labels[0]}</p>))
      }
    </div>
  );
}
