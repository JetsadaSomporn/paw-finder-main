// Deno Edge Runtime Type Definitions for Supabase
export {};

declare global {
  namespace Deno {
    export function serve(
      handler: (request: Request) => Response | Promise<Response>
    ): void;
    
    export namespace env {
      export function get(key: string): string | undefined;
    }
  }
}
