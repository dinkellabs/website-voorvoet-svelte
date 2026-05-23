// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.svelte-kit/ambient.d.ts" />
declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }
    interface Locals {
      requestId: string;
    }
    interface PageData {
      meta?: {
        title?: string;
        description?: string;
        ogImage?: string;
        canonical?: string;
        og?: { image?: string; locale?: string };
      };
      alternates?: Array<{ lang: string; href: string }>;
      structuredData?: Record<string, unknown> | Array<unknown>;
      siteStructuredData?: Array<Record<string, unknown>>;
      flash?: { type: 'success' | 'error'; text: string };
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface PageState {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Platform {}
    namespace Superforms {
      type Message = {
        type: 'success' | 'error';
        text: string;
      };
    }
  }

  const __APP_VERSION__: string;
}

export {};
