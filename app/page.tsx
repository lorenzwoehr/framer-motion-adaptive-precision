import { Calendar } from "./components/calendar";

export default function Home() {
  return (
    <div className="fixed select-none w-screen h-screen items-center justify-center flex bg-neutral-50 dark:bg-neutral-800">
      <Calendar />
      <p className="absolute bottom-8 text-balance text-center text-xs md:text-sm leading-loose text-neutral-500 dark:text-neutral-600">
        Source code available on{" "}
        <a
          href="https://github.com/lorenzwoehr/framer-motion-adaptive-precision"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
