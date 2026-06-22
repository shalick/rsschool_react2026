declare module '*.css';
declare module '*.module.css';

interface ImportMetaEnv {
	VITE_QUERY_CACHE_TTL_MS?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
