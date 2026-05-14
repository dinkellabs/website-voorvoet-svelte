<script lang="ts">
  import { page } from '$app/state';
  import * as m from '$lib/paraglide/messages.js';
  import Title from '$lib/components/Title.svelte';
  import Button from '$lib/components/Button.svelte';

  const lang = $derived.by(() => {
    const candidate = page.params.lang;
    return candidate === 'de' || candidate === 'en' || candidate === 'nl' ? candidate : 'nl';
  });
  const backHref = $derived(`/${lang}`);
</script>

<section class="error-page" aria-labelledby="error-heading">
  <div class="error-page__bg" aria-hidden="true">
    <img
      src="/images/page_not_found/404_not_found_voorvoet.jpg"
      alt=""
      class="error-page__bg-img"
    />
    <div class="error-page__overlay"></div>
  </div>

  <div class="error-page__content">
    <p class="error-page__code">{page.status}</p>
    <Title level={1} id="error-heading" class="error-page__title">{m.error_title()}</Title>
    <p class="error-page__subtitle">{m.error_subtitle()}</p>
    <Button href={backHref} class="error-page__back">{m.error_back()}</Button>
  </div>
</section>

<style>
  .error-page {
    position: relative;
    min-height: calc(100dvh - 68px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .error-page__bg {
    position: absolute;
    inset: 0;
  }

  .error-page__bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .error-page__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 100%);
  }

  .error-page__content {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 2rem;
    max-width: 600px;
  }

  .error-page__code {
    font-size: 6rem;
    font-weight: 900;
    color: var(--color-text-white);
    line-height: 1;
    opacity: 0.8;
    margin-bottom: 0.5rem;
  }

  :global(.error-page__title) {
    font-size: clamp(1.75rem, 3vw + 0.5rem, 3rem);
    font-weight: 800;
    color: var(--color-text-white);
    margin-bottom: 1rem;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .error-page__subtitle {
    font-size: 1.1rem;
    color: var(--color-text-white);
    opacity: 0.9;
    margin-bottom: 2rem;
  }

  :global(.error-page__back) {
    background-color: var(--color-success);
    padding: 0.75rem 2rem;
    border-radius: 8px;
  }

  :global(.error-page__back:hover) {
    background-color: var(--color-primary-700);
  }
</style>
