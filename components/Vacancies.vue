<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useVacanciesStore } from "~~/store/vacancies";

const page = ref(1);

const { pending } = storeToRefs(usePendingStore());
const vacanciesStore = useVacanciesStore();
const { count, vacancies, PER_PAGE } = storeToRefs(vacanciesStore);

// ! Crooked nail
watch(pending, async () => {
  page.value = 1;
});

async function select(page: number) {
  vacanciesStore.paginate(page - 1);
}
</script>

<template>
  <div class="card-wrapper">
    <i-card v-for="vac in vacancies" :key="vac.id">
      <h4 class="card-title">
        <a target="_blank">{{ vac.name }}</a>
      </h4>
      <div>
        <div class="_font-size:sm">
          {{ vac.employer.name }}
        </div>
        <div class="_font-size:sm">{{ vac.area.name }}</div>
      </div>
      <div class="card-snippet _margin-top:1">
        <p style="font-size: 15px" v-html="vac.snippet.responsibility" />
        <p style="font-size: 15px" v-html="vac.snippet.requirement" />
      </div>
    </i-card>
    <i-pagination
      class="_display:flex _justify-content:center _margin-y:1"
      v-model="page"
      @update:modelValue="select"
      quick-link
      :items-total="count"
      :items-per-page="PER_PAGE"
    />
  </div>
</template>

<style lang="scss">
.card-wrapper {
  .card + .card {
    margin-top: calc(var(--spacing) * 1);
  }
}

.card-snippet > p {
  margin: 0;
}
</style>
