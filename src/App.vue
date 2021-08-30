<template lang="pug">

    div#app

        SelfAwareGridDemo

</template>

<script lang="ts">

    import Vue from 'vue';
    import SelfAwareGridDemo from '@/components/SelfAwareGridDemo.vue';

    export default Vue.extend({
        name: 'App',
        components: { SelfAwareGridDemo }
    });

</script>

<style lang="sass">

    body

        padding: 0
        margin: 0

        background-color: #1d2935

    #app

        font-family: Avenir, Helvetica, Arial, sans-serif
        -webkit-font-smoothing: antialiased
        -moz-osx-font-smoothing: grayscale
        color: #FFFFFF

</style>
