import { useRouter } from "next/router";
import { useEffect, useReducer, useState } from "react";
import { albRow, audioRow } from "types";
import AlbRow from '@/components/AlbRow';
import AudioRow from "@/components/AudioRow";
import Loader from "@/components/Loader";

type stateType = { albums: albRow[], audios: audioRow[], langs: string[] }
const reducer = (state: stateType, action: stateType) => {
  return action;
}
export default function App() {
  const router = useRouter();
  // do not updates tables except after fetching data to avoid unnecessary rerenders
  // No need to use complex solutions like react-table or react-datasheet for now 
  // const [albums, setAlbums] = useState<albRow[]>([])
  // const [audios, setAudios] = useState<audioRow[]>([])
  // const [albLabels, setAlbLabels] = useState<string[]>(['en'])
  // const [audioLabels, setAudioLabels] = useState<string[]>(['en'])

  const [{ albums, audios, langs }, setState] = useReducer(reducer, { albums: [], audios: [], langs: [] });
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [saved, setSaved] = useState(true);

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
        setState({
          albums: data.albums,
          audios: data.audios,
          langs: Object.values(data.info.i18n.labelLangs)
        })
        setLoaderVisible(false);
      })

    function onBeforeUnload(e: Event) {
      // if (!saved) {
      e = e || window.event;
      const msg = `You have not saved your data. Your data will be loast if you don't save.`;
      console.log(msg);
      if (e) {
        e.preventDefault();
        e.returnValue = msg;
      }
      return msg;
      // }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      // window.removeEventListener('beforeunload', onBeforeUnload);
    }
  }, [router.query])

  return (
    <Container>
      <button disabled={saved} className="btn" onClick={() => {
        if (saved) return;
        setLoaderVisible(true);
        fetch('/api/app-data', {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: router.query.app,
            audios,
            albums
          }),
        }).then(res => res.json())
          .then(data => {
            console.log(data);
            setLoaderVisible(false);
            setSaved(true);
          })
      }}>Save</button>
      {
        albums.length != 0 && (
          <>
            <h1>Albums</h1>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  {
                    langs.map(l => <th key={l}>{`${l} Title`}</th>)
                  }
                  {
                    ['Arte', 'Date', 'Place', 'Lang'].map(it => <th key={it}>{it}</th>)
                  }
                </tr>
              </thead>
              <tbody>
                {
                  albums.map(a => <AlbRow key={a.url} saved={saved} setSaved={setSaved} album={a} arteBaseUrl="" />)
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
              <thead>
                <tr>
                  <th>URL</th>
                  {
                    langs.map(l => <th key={l}>{`${l} Title`}</th>)
                  }
                  {
                    ['Arte', 'Sloka', 'Date', 'Place', 'Video', 'Lang', 'Size'].map(it => <th key={it}>{it}</th>)
                  }
                </tr>
              </thead>
              <tbody>
                {
                  audios.map(a => <AudioRow key={a.url} saved={saved} setSaved={setSaved} audio={a} arteBaseUrl="" />)
                }
              </tbody>
            </table>
          </>
        )
      }
      {
        loaderVisible && <Loader message="Loading..." />
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
.btn {
  float: right;
}
`