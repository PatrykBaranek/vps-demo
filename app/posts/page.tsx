import Link from "next/link";
import { cacheLife } from "next/cache";


export default async function Page() {
  'use cache';
  cacheLife('minutes');

  return (
    <section className="app-shell glass p-3">
      <h1 className="text-4xl text-center mb-5">Post page list</h1>
      <div className="grid grid-cols-4 gap-4">
        {new Array(100).fill(1).map((pageNumber, index) => (
          <div
            key={pageNumber + index}
            className="border rounded-2xl p-3 cursor-pointer"
          >
            <Link href={`/posts/${pageNumber + index}`}>
              Go to page: {pageNumber + index}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}