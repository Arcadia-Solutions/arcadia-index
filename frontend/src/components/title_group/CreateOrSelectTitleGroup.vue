<template>
  <div class="title" v-if="action == 'select'">
    {{ $t('title_group.select_title') }}
    <span class="alternative" @click="action = 'create'">({{ $t('general.or_create_one') }})</span>
  </div>
  <div class="title" v-if="action == 'create'">
    {{ $t('title_group.create_title') }}
    <span class="alternative" @click="action = 'select'">({{ $t('general.or_select_one') }})</span>
  </div>

  <div id="select-title-group" v-if="action == 'select'">
    <FloatLabel>
      <InputNumber size="small" v-model="titleGroupId" name="id" :format="false" />
      <label for="id">{{ $t('title_group.title_group_id') }}</label>
    </FloatLabel>
    <div class="flex justify-content-center">
      <Button
        v-if="step == 3"
        :label="$t('general.submit')"
        @click="sendSelectedTitleGroup"
        icon="pi pi-check"
        size="small"
        class="validate-button"
        :loading="gettingTitleGroupInfo"
      />
    </div>
  </div>
  <div id="create-title-group" v-if="action == 'create'">
    <FloatLabel>
      <Select
        v-model="content_type"
        inputId="content_type"
        :options="selectableContentTypes"
        class="select"
        size="small"
        @update:modelValue="(step = 2) && (manualCreation = false)"
      >
        <template #option="slotProps">
          <span>{{ $t(`title_group.content_type.${slotProps.option}`) }}</span>
        </template>
        <template #value="slotProps">
          <span v-if="slotProps.value">
            {{ $t(`title_group.content_type.${slotProps.value}`) }}
          </span>
        </template>
      </Select>
      <label for="content_type">{{ $t('title_group.content_type.content_type') }}</label>
    </FloatLabel>
    <div class="external-db-inputs-wrapper" v-if="step > 1 && !manualCreation">
      <div class="external-db-inputs" v-if="content_type == 'movie'">
        <FloatLabel>
          <IconField>
            <InputText size="small" name="tmdb_id" v-model="external_database_ids.tmdb" />
            <label for="tmdb_id">TMDB id</label>
            <InputIcon
              :class="{
                pi: true,
                'pi-search': !gettingExternalDatabaseData,
                'pi-hourglass': gettingExternalDatabaseData,
                'pi-spin': gettingExternalDatabaseData,
                'cursor-pointer': true,
              }"
              @click="getExternalDBData(external_database_ids.tmdb, 'tmdb/movie')"
            />
          </IconField>
        </FloatLabel>
        or
        <FloatLabel>
          <InputText size="small" name="imdb_id" />
          <label for="imdb_id">IMDB id</label>
        </FloatLabel>
      </div>
      <div class="external-db-inputs" v-if="content_type == 'tv_show'">
        <FloatLabel>
          <InputText size="small" name="tvdb_id" />
          <label for="tvdb_id">TVDB id</label>
        </FloatLabel>
        or
        <FloatLabel>
          <IconField>
            <InputText size="small" name="tmdb_id" v-model="external_database_ids.tmdb" />
            <label for="tmdb_id">TMDB id</label>
            <InputIcon
              :class="{
                pi: true,
                'pi-search': !gettingExternalDatabaseData,
                'pi-hourglass': gettingExternalDatabaseData,
                'pi-spin': gettingExternalDatabaseData,
                'cursor-pointer': true,
              }"
              @click="getExternalDBData(external_database_ids.tmdb, 'tmdb/tv')"
            />
          </IconField>
        </FloatLabel>
        or
        <FloatLabel>
          <InputText size="small" name="imdb_id" />
          <label for="imdb_id">IMDB id</label>
        </FloatLabel>
      </div>
      <div class="external-db-inputs" v-if="content_type == 'music'">
        <FloatLabel>
          <InputText size="small" name="musicbrainz_id" />
          <label for="musicbrainz_id">Musicbrainz id</label>
        </FloatLabel>
        or
        <FloatLabel>
          <InputText size="small" name="discogs_id" />
          <label for="discogs_id">Discogs id</label>
        </FloatLabel>
      </div>
      <div class="external-db-inputs" v-if="content_type == 'book'">
        <FloatLabel>
          <IconField>
            <InputText
              size="small"
              name="openlibrary_id"
              v-model="external_database_ids.openlibrary"
            />
            <label for="openlibrary_id">Open Library id</label>
            <InputIcon
              :class="{
                pi: true,
                'pi-search': !gettingExternalDatabaseData,
                'pi-hourglass': gettingExternalDatabaseData,
                'pi-spin': gettingExternalDatabaseData,

                'cursor-pointer': true,
              }"
              @click="getExternalDBData(external_database_ids.openlibrary, 'openlibrary')"
            />
          </IconField>
        </FloatLabel>
      </div>
      <div v-if="step == 2" class="external-db-inputs" style="margin-left: 5px">
        or
        <span
          class="cursor-pointer"
          style="margin-left: 10px; color: var(--color-secondary); font-size: 1.2em"
          @click="(step = 3) && (manualCreation = true)"
        >
          create the title manually
        </span>
      </div>
    </div>
    <div v-if="step > 2">
      <CreateOrEditTitleGroup
        :content_type="content_type"
        @validated="sendTitleGroup"
        :initialTitleGroupForm
        :sendingTitleGroup
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { InputNumber } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { getExternalDatabaseData } from '@/services/api/externalDatabasesService'
import InputIcon from 'primevue/inputicon'
import IconField from 'primevue/iconfield'
import { useToast } from 'primevue/usetoast'
import {
  createTitleGroup,
  getTitleGroupLite,
  type ContentType,
  type TitleGroup,
  type UserCreatedEditionGroup,
  type UserCreatedTitleGroup,
} from '@/services/api/torrentService'
import { useTitleGroupStore } from '@/stores/titleGroup'
import CreateOrEditTitleGroup from '../title_group/CreateOrEditTitleGroup.vue'

const action = ref('select') // create | select
const titleGroupId = ref<number | null>(null)
const step = ref(1)
const manualCreation = ref(false)
const selectableContentTypes: ContentType[] = [
  'movie',
  'tv_show',
  'music',
  'software',
  'book',
  'collection',
]
const content_type = ref<ContentType>('movie') // consider either
const gettingTitleGroupInfo = ref(false)
let sendingTitleGroup = false
let initialTitleGroupForm: UserCreatedTitleGroup | null = null
const external_database_ids = {
  openlibrary: '',
  tmdb: '',
  imdb: '',
  musicbrainz: '',
}
let gettingExternalDatabaseData = false
const titleGroupStore = useTitleGroupStore()
const toast = useToast()

const emit = defineEmits<{
  gotEditionData: [editionGroup: UserCreatedEditionGroup]
  done: [titleGroup?: TitleGroup]
}>()

const getExternalDBData = (item_id: string | number, database: string) => {
  gettingExternalDatabaseData = true
  getExternalDatabaseData(item_id, database).then((data) => {
    data.title_group.original_release_date = new Date(data.title_group.original_release_date)
    initialTitleGroupForm = data.title_group
    // if the api also returns some info about the specific edition, pass it to the edition component
    if (data.edition_group) {
      emit('gotEditionData', data.edition_group)
    }
    step.value = 3
    gettingExternalDatabaseData = false
  })
}

const sendSelectedTitleGroup = async (): Promise<void> => {
  gettingTitleGroupInfo.value = true
  if (!titleGroupStore.id && titleGroupId.value) {
    const titleGroupLite = await getTitleGroupLite(titleGroupId.value).catch((error) => {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.response.data.error,
        life: 4000,
      })
    })
    if (titleGroupLite) {
      titleGroupStore.id = titleGroupLite.id
      titleGroupStore.edition_groups = titleGroupLite.edition_groups
      titleGroupStore.content_type = titleGroupLite.content_type
    }
  }
  if (titleGroupStore.id) {
    emit('done')
  }
  gettingTitleGroupInfo.value = false
}

const sendTitleGroup = async (titleGroupForm: UserCreatedTitleGroup) => {
  sendingTitleGroup = true
  titleGroupForm.content_type = content_type.value
  console.log(content_type.value)
  const formattedTitleGroupForm = JSON.parse(JSON.stringify(titleGroupForm))
  // otherwise there is a json parse error, last char is "Z"
  formattedTitleGroupForm.original_release_date =
    formattedTitleGroupForm.original_release_date.slice(0, -1)
  createTitleGroup(formattedTitleGroupForm)
    .then((data) => {
      // this.creatingTitleGroup = false
      titleGroupStore.id = data.id
      titleGroupStore.content_type = data.content_type
      emit('done', data)
    })
    .finally(() => {
      sendingTitleGroup = false
    })
}

onMounted(() => {
  if (titleGroupStore.id) {
    titleGroupId.value = titleGroupStore.id
  }
})
</script>
<style scoped>
.title {
  font-weight: bold;
  font-size: 1.5em;
  margin-bottom: 25px;
}

.title .alternative {
  font-size: 0.8em;
  color: var(--color-secondary);
  cursor: pointer;
}

.p-floatlabel {
  margin-top: 30px;
}

.select {
  width: 200px;
}

.external-db-inputs-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 55px;
}

.external-db-inputs {
  display: flex;
  align-items: center;
  margin-left: -10px;
  margin-top: 30px;
}

.external-db-inputs .p-floatlabel {
  margin: 0px 10px;
}

.validate-button {
  margin-top: 20px;
}
</style>
