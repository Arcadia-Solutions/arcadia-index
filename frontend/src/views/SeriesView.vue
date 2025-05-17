<template>
  <div
    id="series-view"
    v-if="series"
    :class="{
      'sidebar-right': userStore.settings.site_appearance.item_detail_layout == 'sidebar_right',
      'sidebar-left': userStore.settings.site_appearance.item_detail_layout == 'sidebar_left',
    }"
  >
    <div class="main">
      <SeriesFullHeader
        :series
        v-if="userStore.settings.site_appearance.item_detail_layout == 'header'"
      />
      <SeriesSlimHeader v-else class="slim-header" :series />
      <ContentContainer v-if="title_group_preview_mode == 'cover-only'">
        <div class="title-groups">
          <TitleGroupPreviewCoverOnly
            v-for="title_group in title_groups"
            :key="title_group.id"
            :id="title_group.id"
            :name="title_group.name"
            :cover="title_group.covers[0]"
          />
        </div>
      </ContentContainer>
      <div v-if="title_group_preview_mode == 'table'">
        <TitleGroupPreviewTable
          v-for="title_group in title_groups"
          :key="title_group.id"
          :title_group="title_group"
          class="preview-table"
        />
      </div>
    </div>
    <SeriesSidebar
      :series
      v-if="userStore.settings.site_appearance.item_detail_layout.includes('sidebar')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getSeries } from '@/services/api/seriesService'
import SeriesSlimHeader from '@/components/series/SeriesSlimHeader.vue'
import ContentContainer from '@/components/ContentContainer.vue'
import TitleGroupPreviewCoverOnly from '@/components/title_group/TitleGroupPreviewCoverOnly.vue'
import TitleGroupPreviewTable from '@/components/title_group/TitleGroupPreviewTable.vue'
import SeriesFullHeader from '@/components/series/SeriesFullHeader.vue'
import SeriesSidebar from '@/components/series/SeriesSidebar.vue'
import type { TitleGroupHierarchyLite } from '@/services/api/artistService'
import type { Series } from '@/services/api/seriesService'

const userStore = useUserStore()
const route = useRoute()

const series = ref<Series | null>(null)
const title_groups = ref<TitleGroupHierarchyLite[]>([])
const title_group_preview_mode = ref<'table' | 'cover-only'>('table') // TODO: make a select button to switch from cover-only to table

onMounted(async () => {
  const id = Number(route.params.id)
  // TODO: either toast an error message + redirect or show an error component
  if (!Number.isNaN(id)) {
    const data = await getSeries(id)
    series.value = data.series
    title_groups.value = data.title_groups
  }
})
</script>

<style scoped>
.title-groups {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
}

.preview-table {
  margin-bottom: 15px;
}
</style>
<style>
#series-view .series-covers img {
  border-radius: 7px;
}
</style>
