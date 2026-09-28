import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex min-w-0 items-center" aria-label="Magic Deck Tracker">
      <img
        src="/logo.png"
        alt=""
        className="h-10 w-auto max-w-[11rem] object-contain object-left lg:h-20 lg:max-w-full"
      />
    </Link>
  );
}
