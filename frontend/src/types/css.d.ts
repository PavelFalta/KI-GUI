declare module '*.css' {
  const css: { [key: string]: string };
  export default css;
}

declare module '*.scss' {
  const scss: { [key: string]: string };
  export default scss;
}

declare module '*.sass' {
  const sass: { [key: string]: string };
  export default sass;
}

declare module '*.less' {
  const less: { [key: string]: string };
  export default less;
} 