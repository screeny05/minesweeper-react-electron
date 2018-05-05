declare module '*.woff2';
declare module '*.png';
declare module '*.json';

interface Window {
    require: (path: string) => any;
}
