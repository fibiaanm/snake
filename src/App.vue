<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue'
import { until } from '@vueuse/core'
import { Log } from '@/facade/Logger'
import { app, application } from '@/engine/context'
import Icon from '@/components/Icon.vue'

const canvas: Ref<HTMLCanvasElement | undefined> = ref()
const gameStarted = ref(false)

onMounted(async () => {
  await until(canvas).toBeTruthy()
  app(canvas.value!)
  await app().loadLevels()
  Log.info('Levels loaded')
  canvas.value!.focus()
})

const focusCanvas = () => canvas.value?.focus()

function startGame() {
  gameStarted.value = true
  app().restart()
  focusCanvas()
}

// ── Swipe detection ────────────────────────────────────────────────
const MIN_SWIPE = 35
let _x0 = 0, _y0 = 0

function onDragStart(e: PointerEvent) { _x0 = e.clientX; _y0 = e.clientY }
function onDragEnd(e: PointerEvent) {
  const dx = e.clientX - _x0, dy = e.clientY - _y0
  if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return
  app().snakeDirection = Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'down'  : 'up')
}

// ── D-pad ──────────────────────────────────────────────────────────
function dir(d: 'up' | 'down' | 'left' | 'right') {
  app().snakeDirection = d
  focusCanvas()
}
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden bg-gray-950">

    <!-- Full-screen WebGL canvas -->
    <canvas
      tabindex="0"
      class="absolute inset-0 w-full h-full outline-none touch-none"
      ref="canvas"
      @pointerdown="onDragStart"
      @pointerup="onDragEnd"
      @keydown.down.prevent="app().snakeDirection = 'down'"
      @keydown.right.prevent="app().snakeDirection = 'right'"
      @keydown.up.prevent="app().snakeDirection = 'up'"
      @keydown.left.prevent="app().snakeDirection = 'left'"
      @keydown.space.prevent="app().pause()"
      @keydown.esc="startGame()"
    />

    <!-- ── Top bar ─────────────────────────────────────────────── -->
    <header class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3
                   backdrop-blur-md bg-black/30 border-b border-white/5 select-none">
      <span class="text-white/40 text-xs tracking-[0.3em] uppercase">
        Lvl {{ application.level }}
      </span>
      <span class="text-white/90 font-mono text-lg tracking-widest">
        {{ application.points }} pts
      </span>
      <button
        v-if="!application.end && !application.levelComplete"
        class="px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white/70 text-xs active:bg-white/20"
        @click="app().pause(); focusCanvas()"
        @pointerdown.stop
      >
        {{ application.paused ? '▶ Resume' : '⏸ Pause' }}
      </button>
      <div v-else class="w-20" />
    </header>

    <!-- ── Pause modal ───────────────────────────────────────── -->
    <Transition name="fade">
      <div v-if="application.paused && !application.end && !application.levelComplete"
           class="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-black/40"
           @pointerdown.stop>
        <div class="flex flex-col items-center gap-4 px-10 py-8 rounded-3xl
                    backdrop-blur-xl bg-gray-900/70 border border-white/10 shadow-2xl min-w-[220px]">
          <h2 class="text-white text-2xl font-light tracking-widest">Paused</h2>
          <p class="text-white/40 font-mono text-2xl">
            {{ application.points }}<span class="text-sm ml-1">pts</span>
          </p>
          <div class="w-full flex flex-col gap-1">
            <div class="flex justify-between text-xs text-gray-500">
              <span>Speed</span>
              <span class="font-mono text-gray-300">{{ application.speed }}x</span>
            </div>
            <input type="range" min="1" max="5" step="0.1" class="w-full accent-blue-500"
              v-model="application.speed" />
          </div>
          <button class="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                         text-white font-medium tracking-wide transition-colors"
                  @click="app().pause(); focusCanvas()">
            ▶ Resume
          </button>
          <button class="w-full py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10
                         active:bg-white/20 text-white/70 font-medium tracking-wide transition-colors"
                  @click="startGame()">
            ↺ Restart
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── Level Complete modal ──────────────────────────────── -->
    <Transition name="fade">
      <div v-if="application.levelComplete"
           class="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-black/40"
           @pointerdown.stop>
        <div class="flex flex-col items-center gap-5 px-10 py-8 rounded-3xl
                    backdrop-blur-xl bg-gray-900/70 border border-white/10 shadow-2xl min-w-[240px]">
          <div class="text-yellow-400 text-2xl select-none">✦</div>
          <h2 class="text-white text-2xl font-light tracking-widest select-none">
            Level {{ application.level }} Complete
          </h2>
          <p class="text-white/50 font-mono text-3xl font-light">
            {{ application.points }}<span class="text-base ml-1">pts</span>
          </p>
          <button class="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                         text-white font-medium tracking-wide transition-colors"
                  @click="app().advanceLevel(); focusCanvas()">
            {{ app().isLastLevel ? '↺ New Round' : 'Next Level →' }}
          </button>
          <button class="w-full py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10
                         active:bg-white/20 text-white/50 text-sm tracking-wide transition-colors"
                  @click="app().stayInLevel(); focusCanvas()">
            Keep Playing
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── Game Over / Start modal ────────────────────────────── -->
    <Transition name="fade">
      <div v-if="application.end"
           class="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-black/40"
           @pointerdown.stop>
        <div class="flex flex-col items-center gap-5 px-10 py-8 rounded-3xl
                    backdrop-blur-xl bg-gray-900/70 border border-white/10 shadow-2xl min-w-[220px]">
          <h2 class="text-white text-2xl font-light tracking-widest select-none">
            {{ gameStarted ? 'Game Over' : 'Snake' }}
          </h2>
          <div v-if="gameStarted" class="flex flex-col items-center gap-1">
            <p class="text-white/50 font-mono text-4xl font-light">
              {{ application.points }}<span class="text-lg ml-1">pts</span>
            </p>
            <p v-if="application.points > 0 && application.points === application.record"
               class="text-yellow-400 text-xs tracking-widest">✦ NEW RECORD</p>
            <p v-else-if="application.record > 0"
               class="text-white/30 text-xs font-mono">
              record {{ application.record }}
            </p>
          </div>
          <div class="w-full flex flex-col gap-1">
            <div class="flex justify-between text-xs text-gray-500">
              <span>Speed</span>
              <span class="font-mono text-gray-300">{{ application.speed }}x</span>
            </div>
            <input type="range" min="1" max="5" step="0.1" class="w-full accent-blue-500"
              v-model="application.speed" />
          </div>
          <button class="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                         text-white font-medium tracking-wide transition-colors"
                  @click="startGame()">
            {{ gameStarted ? 'Play Again' : 'Start' }}
          </button>
          <p class="text-white/20 text-xs tracking-widest select-none hidden md:block">
            or press Space
          </p>
        </div>
      </div>
    </Transition>

    <!-- ── D-pad ──────────────────────────────────────────────── -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 select-none"
         style="display:grid;grid-template-columns:repeat(3,5rem);grid-template-rows:repeat(3,5rem);gap:6px;"
         @pointerdown.stop>
      <div /><button class="dpad-btn rounded-t-2xl"  @click="dir('up')"><Icon>arrow_upward</Icon></button><div />
      <button  class="dpad-btn rounded-l-2xl" @click="dir('left')"><Icon>arrow_back</Icon></button>
      <div class="rounded-xl backdrop-blur-md bg-white/5 border border-white/10" />
      <button  class="dpad-btn rounded-r-2xl" @click="dir('right')"><Icon>arrow_forward</Icon></button>
      <div /><button class="dpad-btn rounded-b-2xl"  @click="dir('down')"><Icon>arrow_downward</Icon></button><div />
    </div>

    <!-- ── Speed panel — desktop only ──────────────────────── -->
    <aside class="hidden md:flex absolute bottom-6 right-6 flex-col gap-3 p-4 rounded-2xl z-10
                  backdrop-blur-md bg-black/40 border border-white/10 text-sm text-gray-400 w-44"
           @pointerdown.stop>
      <div class="flex flex-col gap-1.5">
        <div class="flex justify-between text-xs text-gray-500">
          <span>Speed</span>
          <span class="font-mono text-gray-300">{{ application.speed }}x</span>
        </div>
        <input type="range" min="1" max="5" step="0.1" class="w-full accent-blue-500"
          v-model="application.speed" @mouseup="focusCanvas" />
      </div>
      <div class="border-t border-white/10 text-xs text-gray-600 pt-1 leading-5">
        <div>Swipe · move</div>
        <div>Space · pause</div>
        <div>Esc · restart</div>
      </div>
    </aside>

  </div>
</template>

<style scoped>
.dpad-btn {
  @apply flex items-center justify-center text-white/80 text-2xl
         backdrop-blur-md bg-white/10 border border-white/10
         active:bg-white/25 transition-colors cursor-pointer;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }
</style>
