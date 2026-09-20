<script setup lang="ts">
import NavigationDemo from './NavigationDemo.vue';
import LifeDemo from './LifeDemo.vue';
import StylingDemo from './StylingDemo.vue';
</script>

<template>
    <section id="examples" class="scroll-mt-20 pt-10 sm:pt-16">

        <h2 class="font-display text-3xl font-extralight tracking-tight sm:text-4xl">Examples</h2>

        <NavigationDemo />
        <hr class="border-line" />
        <LifeDemo />
        <hr class="border-line" />
        <StylingDemo />
    </section>
</template>
