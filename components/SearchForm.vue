<script setup lang="ts">
import { storeToRefs } from "pinia";
import { getSuggestsAreas } from "~/api/suggests/index";
import { cleanExtraSpaces } from "~/utilities/string";
import { Area } from "~~/@types";

const requsetStore = useRequestStore();
const { pending } = storeToRefs(usePendingStore());

const request = ref("");
const area = ref<Area>();

let query = "";
const loading = ref(false);
const options = ref([]);

async function onSearch(_query: string) {
  if (!_query) return (query = "");

  const clean = cleanExtraSpaces(_query);
  if (clean.length < 2 || clean === query) return;

  loading.value = true;
  query = clean;
  options.value = await fetchAreas();
  loading.value = false;
}

async function fetchAreas() {
  const {
    data: {
      value: { items },
    },
  } = await getSuggestsAreas({ text: query }, ["items"]);

  return items.map((item) => ({ id: item.id, label: item.text }));
}

async function fetchVacancies() {
  if (pending.value) return;

  await requsetStore.fill({ text: request.value, area: toRaw(area.value) });
}
</script>

<template>
  <i-card>
    <i-form>
      <div class="form-group-wrapper">
        <i-form-group>
          <i-tooltip trigger="click">
            <label class="form-label form-label-help">Поисковый запрос</label>
            <template #body>
              <p>Язык поисковых запросов:</p>
              <a target="_blank" href="https://hh.ru/article/1175"
                >https://hh.ru/article/1175</a
              ></template
            >
          </i-tooltip>
          <i-input v-model="request" placeholder="Профессия, должность" />
        </i-form-group>

        <i-form-group>
          <label class="form-label">Город, Регион</label>
          <i-select
            placeholder="Город, Регион"
            v-model="area"
            :options="options"
            :clearable="true"
            :loading="loading"
            @search="onSearch"
            autocomplete
          />
        </i-form-group>
      </div>

      <i-form-group class="_margin-top:1">
        <i-button
          :disabled="pending"
          @click="fetchVacancies"
          color="disabled"
          block
        >
          Найти
        </i-button>
      </i-form-group>
    </i-form>
  </i-card>
</template>

<style lang="scss">
.form-label-help {
  text-decoration: underline dotted;
  -webkit-text-decoration: underline dotted;
  cursor: help;
  border-bottom: 0;
}
</style>
