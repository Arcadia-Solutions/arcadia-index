<template>
  <!-- TODO: use skeletons while the data is loading -->
  <div
    v-if="title_group"
    id="title-group-view"
    :class="{
      'sidebar-right': userStore.settings.site_appearance.item_detail_layout == 'sidebar_right',
      'sidebar-left': userStore.settings.site_appearance.item_detail_layout == 'sidebar_left',
    }"
  >
    <div
      :class="{
        main: true,
        'with-sidebar': userStore.settings.site_appearance.item_detail_layout.includes('sidebar'),
      }"
    >
      <TitleGroupFullHeader
        :title_group
        v-if="userStore.settings.site_appearance.item_detail_layout == 'header'"
      />
      <TitleGroupSlimHeader v-else :title_group class="slim-header" />
      <div class="actions">
        <div>
          <i
            v-if="title_group.is_subscribed"
            v-tooltip.top="$t('general.unsubscribe')"
            @click="unsubscribe"
            class="pi pi-bell-slash"
          />
          <i v-else v-tooltip.top="$t('general.subscribe')" @click="subscribe" class="pi pi-bell" />
          <i v-tooltip.top="$t('general.bookmark')" class="pi pi-bookmark" />
        </div>
        <div>
          <i v-tooltip.top="$t('general.edit')" class="pi pi-pen-to-square" />
          <i
            @click="uploadTorrent"
            v-tooltip.top="$t('torrent.upload_torrent')"
            class="pi pi-upload"
          />
          <i v-tooltip.top="$t('torrent.request_format')" class="pi pi-shopping-cart" />
        </div>
        <FloatLabel class="sort-by-select" variant="on">
          <Select
            v-model="sortBy"
            inputId="sort_by"
            :options="selectableSortingOptions"
            class="select"
            size="small"
          >
            <template #option="slotProps">
              <span>{{ $t(`torrent.${slotProps.option}`) }}</span>
            </template>
            <template #value="slotProps">
              <span>{{ $t(`torrent.${slotProps.value}`) }}</span>
            </template>
          </Select>
          <label for="sort_by">{{ $t('general.sort_by') }}</label>
        </FloatLabel>
      </div>
      <TitleGroupTable :title_group="title_group" :sortBy :preview="false" />
      <ContentContainer
        :container-title="$t('general.screenshots')"
        class="screenshots"
        v-if="title_group.screenshots.length !== 0"
      >
        <CustomGalleria :images="title_group.screenshots" />
      </ContentContainer>
      <Accordion
        v-if="title_group.torrent_requests.length != 0"
        value="0"
        class="torrent-requests dense-accordion"
      >
        <AccordionPanel value="0">
          <AccordionHeader
            >{{ $t('torrent.requests') }} ({{
              title_group.torrent_requests.length
            }})</AccordionHeader
          >
          <AccordionContent>
            <TorrentRequestsTable :torrentRequests="title_group.torrent_requests" />
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
      <ContentContainer
        class="description"
        v-if="title_group"
        :container-title="$t('title_group.description')"
      >
        <div class="title-group-description">
          {{ title_group.description }}
        </div>
        <div v-for="edition_group in title_group.edition_groups" :key="edition_group.id">
          <div v-if="edition_group.description" class="edition-description">
            <div class="edition-group-slug">{{ $getEditionGroupSlug(edition_group) }}</div>
            {{ edition_group.description }}
          </div>
        </div>
      </ContentContainer>
      <GeneralComments :comments="title_group.title_group_comments" />
    </div>
    <div
      class="sidebar"
      v-if="userStore.settings.site_appearance.item_detail_layout.includes('sidebar')"
    >
      <TitleGroupSidebar :title_group />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import GeneralComments from '@/components/community/GeneralComments.vue'
import TitleGroupSidebar from '@/components/title_group/TitleGroupSidebar.vue'
import ContentContainer from '@/components/ContentContainer.vue'
import { getTitleGroup, type TitleGroupAndAssociatedData } from '@/services/api/torrentService'
import TitleGroupTable from '@/components/title_group/TitleGroupTable.vue'
import TorrentRequestsTable from '@/components/request/TorrentRequestsTable.vue'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import TitleGroupFullHeader from '@/components/title_group/TitleGroupFullHeader.vue'
import TitleGroupSlimHeader from '@/components/title_group/TitleGroupSlimHeader.vue'
import { subscribeToItem, unsubscribeToItem } from '@/services/api/generalService'
import { useTitleGroupStore } from '@/stores/titleGroup'
import FloatLabel from 'primevue/floatlabel'
import Select from 'primevue/select'
import CustomGalleria from '@/components/CustomGalleria.vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const userStore = useUserStore()
const titleGroupStore = useTitleGroupStore()

const selectableSortingOptions = ['edition', 'size', 'seeders', 'completed', 'created_at']

const title_group = ref<TitleGroupAndAssociatedData>()
const sortBy = ref('edition')

onMounted(async () => {
  await fetchTitleGroup()
})

const fetchTitleGroup = async () => {
  title_group.value = await getTitleGroup(parseInt(route.params.id.toString()))
}

const uploadTorrent = () => {
  if (title_group.value) {
    titleGroupStore.id = title_group.value.id
    titleGroupStore.edition_groups = title_group.value.edition_groups
    titleGroupStore.content_type = title_group.value.content_type
    router.push({ path: '/upload' })
  }
}

const subscribe = async () => {
  await subscribeToItem(parseInt(route.params.id.toString()), 'title_group')
  if (title_group.value) {
    title_group.value.is_subscribed = true
  }
}

const unsubscribe = async () => {
  await unsubscribeToItem(parseInt(route.params.id.toString()), 'title_group')
  if (title_group.value) {
    title_group.value.is_subscribed = false
  }
}

watch(() => route.params.id, fetchTitleGroup, { immediate: true })
</script>

<style scoped>
.main.with-sidebar {
  width: 75%;
}

.sidebar {
  width: 25%;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.actions i {
  margin: 0px 0.5em;
  color: white;
  cursor: pointer;
}

.screenshots {
  margin-top: 20px;
}

.torrent-requests {
  margin-top: 20px;
}

.description {
  margin-top: 20px;
}

.title-group-description {
  margin-top: 10px;
  margin-bottom: 25px;
}

.edition-description {
  margin-top: 15px;
}

.edition-description .edition-group-slug {
  color: var(--color-primary);
  margin-bottom: 5px;
}

.comments {
  margin-top: 20px;
}
</style>
