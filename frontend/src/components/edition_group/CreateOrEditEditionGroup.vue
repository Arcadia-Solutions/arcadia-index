<template>
  <Form
    v-slot="$form"
    :initialValues="editionGroupForm"
    :resolver
    @submit="onFormSubmit"
    validateOnSubmit
    :validateOnValueUpdate="false"
    validateOnBlur
  >
    <div class="line">
      <div>
        <FloatLabel>
          <InputText size="small" v-model="editionGroupForm.name" name="name" />
          <label for="name">{{ $t('general.name') }}</label>
        </FloatLabel>
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
          {{ $form.name.error?.message }}
        </Message>
      </div>
      <div>
        <FloatLabel>
          <InputText size="small" v-model="editionGroupForm.distributor" name="distributor" />
          <label for="distributor">{{ $t('edition_group.distributor') }}</label>
        </FloatLabel>
        <Message v-if="$form.distributor?.invalid" severity="error" size="small" variant="simple">
          {{ $form.distributor.error?.message }}
        </Message>
      </div>
      <div v-if="titleGroup.content_type == 'music'">
        <FloatLabel>
          <InputText
            size="small"
            v-model="editionGroupForm.additional_information.label"
            name="label"
          />
          <label for="label">{{ $t('edition_group.label') }}</label>
        </FloatLabel>
        <Message v-if="$form.label?.invalid" severity="error" size="small" variant="simple">
          {{ $form.label.error?.message }}
        </Message>
      </div>
      <div v-if="titleGroup.content_type == 'music'">
        <FloatLabel>
          <InputText
            size="small"
            v-model="editionGroupForm.additional_information.catalogue_number"
            name="catalogue_number"
          />
          <label for="catalogue_number">{{ $t('edition_group.catalogue_number') }}</label>
        </FloatLabel>
        <Message v-if="$form.label?.invalid" severity="error" size="small" variant="simple">
          {{ $form.label.error?.message }}
        </Message>
      </div>
      <div>
        <FloatLabel>
          <Select
            v-model="editionGroupForm.source"
            inputId="source"
            :options="$getSources(titleGroup.content_type)"
            class="select-source"
            size="small"
            name="source"
          />
          <label for="source">{{ $t('edition_group.source') }}</label>
        </FloatLabel>
        <Message v-if="$form.source?.invalid" severity="error" size="small" variant="simple">
          {{ $form.source.error?.message }}
        </Message>
      </div>
    </div>
    <div>
      <FloatLabel>
        <Textarea
          v-model="editionGroupForm.description"
          name="description"
          class="description"
          autoResize
          rows="5"
        />
        <label for="description">{{ $t('general.description') }}</label>
      </FloatLabel>
      <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">
        {{ $form.description.error?.message }}
      </Message>
    </div>
    <div class="release-date">
      <label for="release_date" class="block">{{ $t('general.release_date') }}</label>
      <DatePicker
        v-model="release_date"
        showIcon
        :showOnFocus="false"
        inputId="release_date"
        size="small"
        dateFormat="yy-mm-dd"
        name="release_date"
      />
      <Message v-if="$form.release_date?.invalid" severity="error" size="small" variant="simple">
        {{ $form.release_date.error?.message }}
      </Message>
    </div>
    <div class="covers input-list">
      <label>{{ $t('general.cover', 2) }}</label>
      <div v-for="(link, index) in editionGroupForm.covers" :key="index">
        <InputText
          size="small"
          v-model="editionGroupForm.covers[index]"
          :name="`covers[${index}]`"
        />
        <Button v-if="index == 0" @click="addCover" icon="pi pi-plus" size="small" />
        <Button
          v-if="index != 0 || editionGroupForm.covers.length > 1"
          @click="removeCover(index)"
          icon="pi pi-minus"
          size="small"
        />
        <Message
          v-if="($form.covers as unknown as FormFieldState[])?.[index]?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ ($form.covers as unknown as FormFieldState[])[index].error?.message }}
        </Message>
      </div>
    </div>
    <div class="external-links input-list">
      <label>{{ $t('general.external_link', 2) }}</label>
      <div v-for="(link, index) in editionGroupForm.external_links" :key="index">
        <InputText
          size="small"
          v-model="editionGroupForm.external_links[index]"
          :name="`external_links[${index}]`"
        />
        <Button v-if="index == 0" @click="addLink" icon="pi pi-plus" size="small" />
        <Button
          v-if="index != 0 || editionGroupForm.external_links.length > 1"
          @click="removeLink(index)"
          icon="pi pi-minus"
          size="small"
        />
        <Message
          v-if="($form.external_links as unknown as FormFieldState[])?.[index]?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ ($form.external_links as unknown as FormFieldState[])[index].error?.message }}
        </Message>
      </div>
    </div>
    <div class="flex justify-content-center">
      <Button
        label="Validate edition"
        icon="pi pi-check"
        size="small"
        class="validate-button"
        type="submit"
        :loading="sendingEditionGroup"
      />
    </div>
  </Form>
</template>
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Message from 'primevue/message'
import {
  Form,
  type FormFieldState,
  type FormResolverOptions,
  type FormSubmitEvent,
} from '@primevue/forms'
import { useI18n } from 'vue-i18n'
import { isValidUrl } from '@/services/helpers'
import type { TitleGroupLite, UserCreatedEditionGroup } from '@/services/api/torrentService'

interface Props {
  titleGroup: TitleGroupLite
  sendingEditionGroup?: boolean
  initialEditionGroupForm?: UserCreatedEditionGroup | null
}
const {
  titleGroup,
  sendingEditionGroup = false,
  initialEditionGroupForm = null,
} = defineProps<Props>()

const { t } = useI18n()

const emit = defineEmits<{
  validated: [editionGroup: UserCreatedEditionGroup]
}>()

const editionGroupForm = ref<UserCreatedEditionGroup>({
  name: '',
  description: null,
  external_links: [''],
  covers: [''],
  release_date: '',
  title_group_id: 0,
  source: null,
  distributor: '',
  additional_information: {},
})

const release_date = computed({
  get() {
    const date = new Date(editionGroupForm.value.release_date)
    if (!isNaN(date.getTime())) {
      return date
    }
    return new Date()
  },
  set(date) {
    editionGroupForm.value.release_date = date.toISOString()
  },
})

const resolver = ({ values }: FormResolverOptions) => {
  const errors: Partial<Record<keyof UserCreatedEditionGroup, { message: string }[]>> = {}

  if (values.name.length < 5) {
    errors.name = [{ message: t('error.write_more_than_x_chars', [5]) }]
  }
  // if (values.distributor.length < 2) {
  //   errors.distributor = [{ message: 'Write more than 2 characters' }]
  // }
  // if (values.source == '') {
  //   errors.source = [{ message: 'Select a source' }]
  // }
  if (values.release_date === '') {
    errors.release_date = [{ message: t('error.select_date') }]
  }
  // if (values.description.length < 10) {
  //   errors.description = [{ message: 'Write more than 10 characters' }]
  // }
  values.external_links.forEach((link: string, index: number) => {
    if (!isValidUrl(link) && link != '') {
      if (!('external_links' in errors)) {
        errors.external_links = []
      }
      errors.external_links![index] = { message: t('error.invalid_url') }
    }
  })
  values.covers.forEach((link: string, index: number) => {
    if (!isValidUrl(link) && link != '') {
      if (!('covers' in errors)) {
        errors.covers = []
      }
      errors.covers![index] = { message: t('error.invalid_url') }
    }
  })

  return {
    errors,
  }
}

const onFormSubmit = ({ valid }: FormSubmitEvent) => {
  if (valid) {
    emit('validated', editionGroupForm.value)
  }
}
const addCover = () => {
  editionGroupForm.value.covers.push('')
}
const removeCover = (index: number) => {
  editionGroupForm.value.covers.splice(index, 1)
}
const addLink = () => {
  editionGroupForm.value.external_links.push('')
}
const removeLink = (index: number) => {
  editionGroupForm.value.external_links.splice(index, 1)
}

onMounted(() => {
  if (titleGroup.id !== 0) {
    editionGroupForm.value.title_group_id = titleGroup.id
  }
  if (initialEditionGroupForm !== null) {
    editionGroupForm.value = initialEditionGroupForm
  }
  if (titleGroup.content_type == 'music') {
    editionGroupForm.value.additional_information.label = ''
    editionGroupForm.value.additional_information.catalogue_number = ''
  }
})
</script>
<style scoped>
.description {
  width: 100%;
  height: 10em;
}

.select-source {
  width: 150px;
}

.release-date {
  margin-top: 20px;
}

.input-list {
  margin-top: 15px;
}

.input-list .p-component {
  margin-right: 5px;
  margin-bottom: 5px;
}

.input-list input {
  width: 400px;
}

.p-floatlabel {
  margin-top: 30px;
}

.validate-button {
  margin-top: 20px;
}
</style>
