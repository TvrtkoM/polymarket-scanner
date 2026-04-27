import Image from "next/image";
import Link from "next/link";

export function PolymarketsLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`https://polymarket.com/market/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      aria-label="Open on Polymarket"
    >
      <Image
        src="https://polymarket.com/icons/favicon-32x32.png"
        alt="Polymarket"
        height={20}
        width={20}
      />
    </Link>
  );
}
