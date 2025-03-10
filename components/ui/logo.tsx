import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/spark-logo.jpg";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex shrink-0" aria-label="Cruip">
      <Image src={logo} alt="Cruip Logo" width={42} height={42} />
    </Link>
  );
}
