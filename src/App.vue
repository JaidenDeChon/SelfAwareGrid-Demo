<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue';
import HeroSection from './components/HeroSection.vue';
import StylingDemo from './components/StylingDemo.vue';
import NavigationDemo from './components/NavigationDemo.vue';
import UsageSection from './components/UsageSection.vue';
import SiteFooter from './components/SiteFooter.vue';
</script>

<template>
    <SiteHeader />
    <main>
        <HeroSection />
        <StylingDemo />
        <div class="shell"><hr class="border-line" /></div>
        <NavigationDemo />
        <UsageSection />
    </main>
    <SiteFooter />
</template>
