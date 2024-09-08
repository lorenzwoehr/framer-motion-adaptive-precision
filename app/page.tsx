import { Calendar } from "./components/calendar";

export default function Home() {
  return (
    <div className="fixed select-none w-screen h-screen items-center justify-center flex bg-neutral-50 dark:bg-neutral-800">
      <Calendar />
    </div>
  );
}
