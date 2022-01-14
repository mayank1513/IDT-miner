import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { albRow, audioRow } from "types";
import AlbRow from '@/components/AlbRow';
import AudioRow from "@/components/AudioRow";

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
    <Container>
      {
        albums.length != 0 && (
          <>
            <h1>Albums</h1>
            <table>
              <tbody>
                {
                  albums.map(a => <AlbRow key={a.url} album={a} arteBaseUrl="" />)
                }
              </tbody>
            </table>
          </>
        )
      }
      {
        audios.length != 0 && (
          <>
            <h1>Audios</h1>
            <table>
              <tbody>
                {
                  audios.map(a => <AudioRow key={a.url} audio={a} arteBaseUrl="" />)
                }
              </tbody>
            </table>
          </>
        )
      }
    </Container>
  );
}

import styled from "styled-components";
const Container = styled.div/*css */`
max-width: 1400px;
margin: auto;
table {
  margin: 20px;
  width: 100%;
}
`