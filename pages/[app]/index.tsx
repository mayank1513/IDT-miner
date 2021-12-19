import { useRouter } from "next/router";

export default function App() {
  const router = useRouter();
  return (
    <div>
      <span>{router.asPath}</span>
    </div>
  );
}
