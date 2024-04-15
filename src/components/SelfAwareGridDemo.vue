<template lang="pug">

    .self-aware-grid-test

        section

            h2.section-title Style rows and columns easily

            .description

                p {{ styleDescription }}

            .controls

                .information
                    p Column count: {{ columnCount }}
                    p Row count: {{ rowCount }}

                h3.instructions Resize me!

                .buttons
                    button(@click="numberOfChildren++") Add one
                    button(@click="numberOfChildren--") Remove one

            .resizable-container

                .grid-style-parent

                    .child(v-for="child in numberOfChildren")

                        h3 {{ child }}

        section

            h2.section-title Navigate a grid like a spreadsheet

            .description

                p {{ navigationDescription }}

            .controls

                h3.instructions Focus a grid item, then traverse using arrow-keys!

                .buttons

                    button(@click="focusFirstPositionChild") Focus First Child

            .resizable-container

                .grid-position-parent

                    .child(
                        v-for="child in numberOfChildren"
                        @keydown="handleKeyPress($event, child - 1)"
                        tabindex="1"
                        :id="'position-child-' + child"
                    )

                        h3 {{ child }}

</template>

<script lang="ts">

    import Vue from 'vue';
    import SelfAwareGrid from 'self-aware-grid';

    export default Vue.extend({

        name: 'SelfAwareGridTest',

        data () {
            return {
                // Needed for examples
                gridStyleObject: undefined as SelfAwareGrid | undefined,
                gridStyleParentEl: undefined as Element | undefined,

                gridPositionObject: undefined as SelfAwareGrid | undefined,
                gridPositionParentEl: undefined as Element | undefined,

                // Just allows for adding more children
                numberOfChildren: 40,

                styleDescription: 'Using CSS, there\'s no way to style specific columns or rows of a responsive ' +
                  'grid. If you know exactly which column or row you\'d like to target, then you can do so, but if ' +
                  'your grid is a responsive one, you\'re out of luck. SelfAwareGrid helps by allowing you to target ' +
                  'and style any specific row or column in a grid with dynamically-placed children.',

                navigationDescription: 'There is no easy way to navigate a grid of focusable items the same way you ' +
                  'would a spreadsheet. If you want to traverse through a grid using anything other than your "Tab" ' +
                  'key, such as arrow-keys or anything else, or if you want to traverse vertically and not just ' +
                  'horizontally, you\'re in for a hard time setting that behavior up on your own. SelfAwareGrid ' +
                  'helps with this process, providing an easy way to make this behavior possible on a responsive grid.'
            };
        },

        mounted () {
            this.gridStyleParentEl = document.getElementsByClassName('grid-style-parent')[0];
            this.gridStyleObject = new SelfAwareGrid(this.gridStyleParentEl);
            this.gridStyleObject.beginObservingResize();

            this.gridPositionParentEl = document.getElementsByClassName('grid-position-parent')[0];
            this.gridPositionObject = new SelfAwareGrid(this.gridPositionParentEl);
            this.gridPositionObject.beginObservingResize();
        },

        beforeDestroy () {
            if (this.gridStyleObject) {
                this.gridStyleObject.destroy();
            }
            if (this.gridPositionObject) {
                this.gridPositionObject.destroy();
            }
        },

        computed: {
            columnCount (): number {
                return this.gridStyleObject?.columnCount() ?? Number.NaN;
            },
            rowCount (): number {
                return this.gridStyleObject?.rowCount() ?? Number.NaN;
            }
        },

        methods: {

            focusFirstPositionChild (): void {
                const firstChild = document.getElementById('position-child-1');
                if (firstChild) firstChild.focus();
            },

            handleKeyPress (event: KeyboardEvent, childIndex: number): void {

                let nextIndexToFocus: number | undefined;
                const numberOfGridChildren = this.gridPositionParentEl?.children.length;

                if (numberOfGridChildren === undefined) {
                    return;
                }

                switch (event.key) {
                    case 'ArrowUp':
                        nextIndexToFocus = this.gridPositionObject?.getGridItemAbove(childIndex);
                        break;
                    case 'ArrowDown':
                        nextIndexToFocus = this.gridPositionObject?.getGridItemBelow(childIndex);
                        break;
                    case 'ArrowLeft':
                        nextIndexToFocus = this.gridPositionObject?.getGridItemToTheLeft(childIndex);
                        break;
                    case 'ArrowRight':
                        nextIndexToFocus = this.gridPositionObject?.getGridItemToTheRight(childIndex);
                        break;
                    default:
                        return;
                }

                if (nextIndexToFocus === undefined) {
                    return;
                }

                if (nextIndexToFocus < 0 || nextIndexToFocus >= numberOfGridChildren) {
                    return;
                }

               event.preventDefault();
                (this.gridPositionParentEl?.children[nextIndexToFocus] as HTMLElement).focus();
            }
        }
    });

</script>

<style lang="sass">

    $top-color: #4f6f7f
    $bottom-color: #42b983
    $left-color: #4f6f7f
    $right-color: #42b983

    .self-aware-grid-test

        section

            display: flex
            flex-direction: column
            align-items: center

            padding: 2rem
            margin-bottom: 3rem

            & > div

                width: 50rem

                box-sizing: border-box

        .controls

            height: 100%

            margin-top: 4rem

            display: flex
            align-items: center
            justify-content: space-between

            .information

                display: flex
                flex-direction: column
                justify-content: center

                p

                    margin: 0.3rem

        button

            margin-left: 1rem
            padding: 1rem

            color: #2c3e50
            font-weight: bold
            font-size: 0.9rem
            text-transform: uppercase

            border-radius: 0.4rem
            background-color: #42b983
            cursor: pointer
            outline: none
            border: 0.2rem solid transparent

            &:focus

                border: 0.2rem solid white

        h2.section-title

            width: 50rem

        .description

            font-size: 1.2rem
            letter-spacing: 0.04em
            line-height: 1.5em

            padding: 0.5rem 1.5rem

            background-color: #141e24
            border-radius: 0.4rem

        .resizable-container

            border: 1px solid white

            margin-top: 1rem

            height: 100%
            width: 50rem

            resize: horizontal
            overflow: auto

        .grid-style-parent,
        .grid-position-parent

            width: 100%
            box-sizing: border-box

            display: grid
            grid-column-gap: 1rem
            grid-row-gap: 1rem
            grid-template-columns: repeat(auto-fill, 4rem)

            .child

                height: 4rem
                width: 4rem

                display: flex
                align-items: center
                justify-content: center

                box-sizing: border-box

                background-color: #2c3e50

        .grid-position-parent .child

            border: 0.2rem solid transparent

            &:focus

                outline: none
                border: 0.2rem solid white

        .grid-style-parent .child

            // top row
            &.self-aware-grid__child--is-top-row
                background-color: $top-color

            // bottom row
            &.self-aware-grid__child--is-bottom-row
                background-color: $bottom-color

            // left column
            &.self-aware-grid__child--is-left-column
                background-color: $left-color

            // right column
            &.self-aware-grid__child--is-right-column
                background-color: $right-color

            // top left corner
            &.self-aware-grid__child--is-top-row.self-aware-grid__child--is-left-column
                background: linear-gradient(45deg, $left-color 0%, $top-color 100%)

            // bottom left corner
            &.self-aware-grid__child--is-left-column.self-aware-grid__child--is-bottom-row
                background: linear-gradient(-225deg, $left-color 0%, $bottom-color 100%)

            // bottom right corner
            &.self-aware-grid__child--is-bottom-row.self-aware-grid__child--is-right-column
                background: linear-gradient(225deg, $right-color 0%, $bottom-color 100%)

            // top right corner
            &.self-aware-grid__child--is-right-column.self-aware-grid__child--is-top-row
                background: linear-gradient(-45deg, $right-color 0%, $top-color 100%)

</style>
