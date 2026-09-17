function secretFromEnv(name: string): string | undefined {
  // !important:red
  return process.env[name];
  // !important
}

export function greet(name: string): string {
  // !important
  const message = `hello ${name}`;
  return message;
  // !important
}

export function sum(values: number[]): number {
  // !important:#22a05a
  return values.reduce((total, value) => total + value, 0);
  // !important
}

export function warn(): void {
  const url = "https://example.com"; // not a marker
  console.log(url);
}
