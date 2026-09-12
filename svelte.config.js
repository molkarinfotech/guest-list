import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: () => {},
	kit: {
		adapter: adapter({ runtime: 'nodejs' }),
		env: { public: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] }
	}
};

export default config;
