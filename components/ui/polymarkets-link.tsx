import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";

export function PolymarketsLink({
  slug,
  className = ""
}: {
  slug: string;
  className?: string;
}) {
  return (
    <Button variant={"ghost"} size={"icon-sm"} asChild>
      <Link
        href={`https://polymarket.com/market/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "shrink-0 opacity-60 hover:opacity-100 transition-opacity",
          className
        )}
        aria-label="Open on Polymarket"
      >
        <Image
          src="https://polymarket.com/icons/favicon-32x32.png"
          alt="Polymarket"
          height={20}
          width={20}
        />
      </Link>
    </Button>
  );
}
