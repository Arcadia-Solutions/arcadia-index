<template>
  <div class="title" v-if="action == 'select'">
    {{ $t('edition_group.select_edition') }}
    <span class="alternative" @click="action = 'create'">({{ $t('general.or_create_one') }})</span>
  </div>
  <div class="title" v-if="action == 'create'">
    {{ $t('edition_group.create_edition') }}
    <span class="alternative" @click="action = 'select'">({{ $t('general.or_select_one') }})</span>
  </div>
  <div id="select-edition-group" v-if="action == 'select'">
    <FloatLabel>
      <Select
        v-model="selected_edition_group"
        inputId="edition_group"
        :options="titleGroup.edition_groups"
        size="small"
        class="select-existing-edition"
      >
        <template #option="slotProps">
          <div>
            {{ getEditionGroupSlug(slotProps.option) }}
          </div>
        </template>
        <template #value="slotProps" v-if="selected_edition_group">
          <div>
            {{ getEditionGroupSlug(slotProps.value) }}
          </div>
        </template>
      </Select>
      <label for="edition_group">{{ $t('torrent.edition') }}</label>
    </FloatLabel>
    <div class="flex justify-content-center">
      <Button
        label="Validate edition"
        @click="() => sendEditionGroup()"
        icon="pi pi-check"
        size="small"
        class="validate-button"
        :loading="creatingEditionGroup"
      />
    </div>
  </div>
  <div v-if="action === 'create'">
    <div v-if="step > 0">
      <CreateOrEditEditionGroup :titleGroup @validated="sendEditionGroup" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FloatLabel from 'primevue/floatlabel'
import Select from 'primevue/select'
import Button from 'primevue/button'
import {
  createEditionGroup,
  type EditionGroup,
  type EditionGroupInfoLite,
  type UserCreatedEditionGroup,
} from '@/services/api/torrentService'
import { useTitleGroupStore } from '@/stores/titleGroup'
import CreateOrEditEditionGroup from './CreateOrEditEditionGroup.vue'
import { getEditionGroupSlug } from '@/services/helpers'

// eslint-disable-next-line prefer-const
let action = ref('select') // create | select
const step = 1

const titleGroup = useTitleGroupStore()
const selected_edition_group = ref<EditionGroupInfoLite | null>(null)
let creatingEditionGroup = false

const emit = defineEmits<{
  done: [editionGroup: EditionGroupInfoLite]
}>()

const sendEditionGroup = (editionGroupForm?: UserCreatedEditionGroup) => {
  if (action.value == 'select') {
    // this should be an invariant - TODO: should we emit a warning if the value is actually null?
    if (selected_edition_group.value) {
      emit('done', selected_edition_group.value)
    }
  } else if (editionGroupForm !== undefined) {
    creatingEditionGroup = true
    const formattededitionGroupForm = JSON.parse(JSON.stringify(editionGroupForm))
    // otherwise there is a json parse error, last char is "Z"
    formattededitionGroupForm.release_date = formattededitionGroupForm.release_date.slice(0, -1)
    createEditionGroup(formattededitionGroupForm).then((data: EditionGroup) => {
      creatingEditionGroup = false
      emit('done', data)
    })
  }
}
</script>
<style scoped>
.title {
  font-weight: bold;
  font-size: 1.5em;
}

.title .alternative {
  font-size: 0.8em;
  color: var(--color-secondary);
  cursor: pointer;
}

.p-floatlabel {
  margin: 30px 0px;
}

.select-existing-edition {
  width: 500px;
}

.validate-button {
  margin-top: 20px;
}
</style>
