<template>
  <div id="top-bar">
    <div class="left"></div>
    <div class="user-stats">
      <div class="stat" v-tooltip.bottom="'Uploaded'">
        <i class="pi pi-upload" />
        {{ $bytesToReadable(user.uploaded) }}
      </div>
      <span class="stat" v-tooltip.bottom="'Downloaded'">
        <i class="pi pi-download" />{{ $bytesToReadable(user.downloaded) }}
      </span>
      <span class="stat" v-tooltip.bottom="'Ratio'">
        <i class="pi pi-wave-pulse" />{{ user.ratio }}
      </span>
      <span class="stat" v-tooltip.bottom="'Bonus points'">
        <i class="pi pi-money-bill" />{{ user.bonus_points }}
      </span>
      <span class="stat" v-tooltip.bottom="'Freeleech tokens'">
        <i class="pi pi-ticket" />{{ user.freeleech_tokens }}
      </span>
    </div>
    <div class="right">
      <div class="actions">
        <a href="/upload"><Button icon="pi pi-upload" severity="secondary" size="small" /></a>
        <Button icon="pi pi-moon" @click="toggleDarkMode()" severity="secondary" size="small" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/user'
import { Button } from 'primevue'

export default {
  components: { Button },
  data() {
    return {
      user: {},
    }
  },
  methods: {
    toggleDarkMode() {
      document.documentElement.classList.toggle('dark-theme')
    },
  },
  created() {
    this.user = useUserStore()
  },
}
</script>

<style scoped>
#top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-background-secondary);
  height: 45px;
  padding: 0 7px;
  width: 100%;
}
.user-stats {
  font-size: 0.85em;
  display: flex;
  align-items: center;
  .stat {
    margin: 0px 10px;
    display: flex;
    align-items: center;
  }
  i {
    margin-right: 7px;
  }
}
.actions .p-button {
  margin-left: 7px;
}
</style>
