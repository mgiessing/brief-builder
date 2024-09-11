import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Use the Node adapter to build a server-side rendered application suitable for Docker
    adapter: adapter()
  }
};

export default config;
