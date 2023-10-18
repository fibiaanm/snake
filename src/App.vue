<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue';
import { until } from '@vueuse/core'
import { Log } from '@/facade/Logger'
import { app, application } from '@/engine/context'
import Icon from '@/components/Icon.vue'

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
  focusCanva()
})

const focusCanva = () => {
  applicationWrapper.value!.focus()
}

</script>

<template>
  <div class="relative w-screen h-screen flex content-start flex-wrap">
    <header class="w-full self-start h-20 items-center flex px-2 justify-center text-3xl">
        <div class="select-none">
            Snake Game by fibiaanm
        </div>
    </header>
    <body class="w-full flex justify-center self-start py-8 flex-wrap">
      <div class="w-40 flex flex-wrap justify-center items-start place-self-start">
        <div class="flex w-full">
          <Icon>space_bar</Icon> Pause
        </div>
        <div class="flex w-full">
          <Icon>arrow_upward</Icon> upward
        </div>
        <div class="flex w-full">
          <Icon>arrow_downward</Icon> downward
        </div>
        <div class="flex w-full">
          <Icon>arrow_forward</Icon> rigth
        </div>
        <div class="flex w-full">
          <Icon>arrow_back</Icon> left
        </div>
      </div>
      <canvas tabindex="0" class="w-96 h-96 border focus:outline-2 focus:outline-red-800 border-red-600 rounded-lg"
        ref="applicationWrapper" @keydown.down="app().snakeDirection = 'down'"
        @keydown.right="app().snakeDirection = 'right'" @keydown.up="app().snakeDirection = 'up'"
        @keydown.left="app().snakeDirection = 'left'" @keydown.space="app().pause" @keydown.esc="app().restart()"></canvas>
      <canvas class="absolute hidden top-0 left-0" ref="applicationAux"></canvas>
      <div class="w-24 flex flex-wrap justify-center place-self-start">
        <span class="w-full text-center">
          Points {{ application.points }}
        </span>
        <span class="duration-200 border my-1 w-20 text-center border-green-400 bg-green-400 text-white h-fit rounded-lg py-0.5 px-2" :class="[application.paused ? 'opacity-100' : 'opacity-0']">
          Paused
        </span>
        <span class="duration-200 border my-1 w-20 text-center border-red-400 bg-red-400 text-white h-fit rounded-lg py-0.5 px-2" :class="[application.end ? 'opacity-100' : 'opacity-0']">
          Over
        </span>
        Speed:
        <input class="w-full text-center" type="range" min="1" max="5" step="0.1" v-model="application.speed" @mouseup="focusCanva">
        {{ application.speed }}

      </div>
    </body>
  </div>
</template>

<style scoped></style>
