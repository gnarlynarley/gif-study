type ValidClassName = string | false | null | undefined;

export function joinClassNames(...classNames: ValidClassName[]): string {
  return classNames.filter(Boolean).join(" ");
}
export { joinClassNames as cx };
