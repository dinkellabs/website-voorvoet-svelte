export function isExternal(url: string): boolean;
export function renderButton(label: string, href: string): string;
export function processButtonSyntax(text: string): string;
declare const remarkButton: () => (tree: unknown) => void;
export default remarkButton;
