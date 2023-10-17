<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue';
import { until } from '@vueuse/core'
import { Log } from '@/facade/Logger'
import { app } from '@/engine/context'

const applicationWrapper: Ref<HTMLCanvasElement | undefined> = ref()
const applicationAux: Ref<HTMLCanvasElement | undefined> = ref()

onMounted(async () => {
  await until(applicationWrapper).toBeTruthy()
  await until(applicationAux).toBeTruthy()

  app({
    aux: applicationAux.value!,
    main: applicationWrapper.value!
  })

  Log.info('Wrappers loaded');
  app().restart()
  requestAnimationFrame(app().refresh)
  applicationWrapper.value!.focus()
})

</script>

<template>
  <div class="relative w-screen h-screen flex items-center justify-center">
    <canvas tabindex="0" class="w-96 h-96 border focus:outline-2 focus:outline-red-800 border-red-600"
      ref="applicationWrapper" @keydown.down="app().snakeDirection = 'down'"
      @keydown.right="app().snakeDirection = 'right'" @keydown.up="app().snakeDirection = 'up'"
      @keydown.left="app().snakeDirection = 'left'"></canvas>
    <canvas class="absolute hidden top-0 left-0" ref="applicationAux"></canvas>
  </div>
</template>

<style scoped></style>
