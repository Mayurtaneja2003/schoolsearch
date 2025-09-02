import Link from 'next/link';

export default function Home() {
	return (
		<main className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900 px-4">
			<div className="max-w-xl w-full text-center">
				<h1 className="text-3xl font-bold mb-6">School Manager</h1>
				<p className="text-gray-700 mb-8">Add schools and view them as cards.</p>
				<div className="flex items-center justify-center gap-4">
					<Link href="/addSchool" className="px-5 py-3 rounded bg-blue-700 text-white hover:bg-blue-800">Add School</Link>
					<Link href="/showSchools" className="px-5 py-3 rounded border border-gray-300 hover:bg-gray-200">View Schools</Link>
				</div>
			</div>
		</main>
	);
}
