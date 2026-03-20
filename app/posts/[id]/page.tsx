import { cacheLife } from "next/cache";
import { setTimeout } from "node:timers/promises";


interface Props {
	params: Promise<{ id: string; }>;
}

export default async function Page({ params }: Readonly<Props>) {
	'use cache';
	cacheLife('minutes');

	await setTimeout(2000);
	const { id } = await params;

	return (
		<>
			<h1>Page { id }</h1>
			<p>Page content</p>
		</>
	);
}
