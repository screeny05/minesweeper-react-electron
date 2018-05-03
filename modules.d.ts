declare module '*.woff2';
declare module '*.png';

interface Window {
    require: (path: string) => any;
}
