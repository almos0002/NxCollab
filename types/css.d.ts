declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "@excalidraw/excalidraw/index.css" {
  const content: string;
  export default content;
}
