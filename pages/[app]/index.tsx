import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App() {
  const router = useRouter();
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
      })
    return () => {

    }
  }, [router.query])
  return (
    <div>
      <span>{router.asPath}</span>
    </div>
  );
}
