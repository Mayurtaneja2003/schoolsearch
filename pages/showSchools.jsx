import useSWR from 'swr';
import Link from 'next/link';


const PLACEHOLDER_IMG = 'https://res.cloudinary.com/dagp859yh/image/upload/v1756819210/placeholder_sgkyw0.svg';
const fetcher = (url) => fetch(url, { cache: 'no-store' }).then((r) => r.json());

export default function ShowSchoolsPage() {
	const { data, error, isLoading, mutate } = useSWR('/api/schools', fetcher);

	return (
		<div className="min-h-screen bg-gray-100 text-gray-900">
			<header className="bg-white shadow">
				<div className="mx-auto max-w-6xl px-4 py-4 flex justify-between items-center">
					<Link href="/" className="text-2xl font-bold hover:underline">Schools Manager</Link>
					<nav className="text-sm text-blue-700">
						<Link href="/addSchool" className="hover:underline">Add School</Link>
					</nav>
				</div>
			</header>
			<main className="mx-auto max-w-6xl px-4 py-8">
				{isLoading && <p className="text-gray-700">Loading...</p>}
				{error && <p className="text-red-700">Failed to load.</p>}
				{data?.success && (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{data.data.map((school) => (
							<div key={school.id} className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
								<div className="aspect-video bg-gray-100">
									{(() => {
												const raw = school.imagePath || '';
												const src = raw
													? /^https?:\/\//.test(raw)
														? raw
														: `/${raw.replace(/\\/g, '/')}`
													: PLACEHOLDER_IMG;
										return (
											<img
												src={src}
												alt={school.name}
												className="w-full h-full object-cover"
												onError={(e) => {
													e.currentTarget.onerror = null;
													e.currentTarget.src = PLACEHOLDER_IMG;
												}}
											/>
										);
									})()}
								</div>
								<div className="p-4">
									<h3 className="font-semibold text-lg text-gray-900">{school.name}</h3>
									<p className="text-sm text-gray-700 mt-1">{school.address}</p>
									<p className="text-sm text-gray-700">{school.city}</p>
								</div>
							</div>
						))}
					</div>
				)}
				{data?.success && data.data.length === 0 && (
					<p className="text-gray-600">No schools yet. Add one from the Add School page.</p>
				)}
			</main>
		</div>
	);
}


