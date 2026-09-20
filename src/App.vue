<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue';
import HeroSection from './components/HeroSection.vue';
import NavigationDemo from './components/NavigationDemo.vue';
import LifeDemo from './components/LifeDemo.vue';
import StylingDemo from './components/StylingDemo.vue';
import DocsSection from './components/DocsSection.vue';
import SiteFooter from './components/SiteFooter.vue';
</script>

<template>
    <SiteHeader />
    <main>
        <HeroSection />
        <NavigationDemo />
        <div class="shell"><hr class="border-line" /></div>
        <LifeDemo />
        <div class="shell"><hr class="border-line" /></div>
        <StylingDemo />
        <DocsSection />
    </main>
    <SiteFooter />
</template>
