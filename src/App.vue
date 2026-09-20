<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue';
import HeroSection from './components/HeroSection.vue';
import PageContents from './components/PageContents.vue';
import ExamplesSection from './components/ExamplesSection.vue';
import DocsSection from './components/DocsSection.vue';
import SiteFooter from './components/SiteFooter.vue';
</script>

<template>
    <SiteHeader />
    <main>
        <HeroSection />

        <!--
            Everything below the hero shares one contents rail, which is why the sections inside this grid no
            longer carry the page gutter themselves: the wrapper holds it, and they are a column within it.
        -->
        <div class="shell lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
            <PageContents />

            <div class="min-w-0">
                <ExamplesSection />
                <DocsSection />
            </div>
        </div>
    </main>
    <SiteFooter />
</template>
