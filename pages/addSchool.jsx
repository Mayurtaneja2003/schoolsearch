import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';

export default function AddSchoolPage() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm();
	const [serverError, setServerError] = useState('');
	const [serverSuccess, setServerSuccess] = useState('');

	async function onSubmit(values) {
		setServerError('');
		setServerSuccess('');
		const formData = new FormData();
		formData.append('name', values.name);
		formData.append('address', values.address);
		formData.append('city', values.city);
		formData.append('state', values.state);
		formData.append('contact', values.contact);
		formData.append('email', values.email);
		if (values.image?.[0]) {
			formData.append('image', values.image[0]);
		}
		try {
			const res = await fetch('/api/schools', {
				method: 'POST',
				body: formData,
			});
			const data = await res.json();
			if (!res.ok) {
				const details = data?.error ? `: ${data.error}` : '';
				throw new Error((data?.message || 'Failed to save') + details);
			}
			setServerSuccess('School added successfully.');
			reset();
		} catch (err) {
			console.error('Create school failed:', err);
			setServerError(err.message);
		}
	}

	return (
		<div className="min-h-screen bg-gray-100 text-gray-900">
			<header className="bg-white shadow">
				<div className="mx-auto max-w-5xl px-4 py-4 flex justify-between items-center">
					<h1 className="text-2xl font-bold">Add School</h1>
					<nav className="text-sm text-blue-700">
						<Link href="/showSchools" className="hover:underline">View Schools</Link>
					</nav>
				</div>
			</header>
			<main className="mx-auto max-w-3xl px-4 py-8">
				<form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-md p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">Name</label>
						<input className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('name', { required: 'Name is required' })} />
						{errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Address</label>
						<input className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('address', { required: 'Address is required' })} />
						{errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>}
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">City</label>
							<input className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('city', { required: 'City is required' })} />
							{errors.city && <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>}
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">State</label>
							<input className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('state', { required: 'State is required' })} />
							{errors.state && <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>}
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">Contact</label>
							<input className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('contact', { required: 'Contact is required', pattern: { value: /^\d{10}$/, message: 'Enter 10 digit number' } })} />
							{errors.contact && <p className="text-sm text-red-600 mt-1">{errors.contact.message}</p>}
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Email</label>
							<input className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
							{errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Image</label>
						<input type="file" accept="image/*" className="w-full" {...register('image')} />
					</div>
					{serverError && <p className="text-sm text-red-600">{serverError}</p>}
					{serverSuccess && <p className="text-sm text-green-600">{serverSuccess}</p>}
					<button type="submit" disabled={isSubmitting} className="inline-flex items-center px-5 py-2.5 rounded bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60">
						{isSubmitting ? 'Saving...' : 'Save School'}
					</button>
				</form>
			</main>
		</div>
	);
}


