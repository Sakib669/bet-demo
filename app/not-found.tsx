import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <section className="page-shell not-found-page"><p className="eyebrow">PULSE / LOST PAGE</p><strong>404</strong><h1>This page left the room.</h1><p>The address may have changed. The game room is still right where you left it.</p><Link className="button-primary" href="/"><ArrowLeft size={17} /> Back to the game room</Link></section>;
}
