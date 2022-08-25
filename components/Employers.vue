<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useEmployersStore } from "~~/store/employers";
import { useVacanciesStore } from "~~/store/vacancies";
import * as XLSX from "XLSX";

const page = ref(1);

const employersStore = useEmployersStore();
const vacanciesStore = useVacanciesStore();
const { employers, count, PER_PAGE } = storeToRefs(employersStore);
const { lastPrimaryKey, params } = storeToRefs(useRequestStore());
const { pending } = storeToRefs(usePendingStore());

watch(pending, () => (page.value = 1));

async function select(page: number) {
  await employersStore.paginate(page - 1);
}

function description(string: string) {
  return !string
    ? "Компания пока не указала описание. (•ิ_•ิ)?"
    : string.replace(/<\/?[^>]+>/gi, " ");
}

async function _export() {
  const vac = await vacanciesStore.allVac(lastPrimaryKey.value);
  var result = vac.reduce((r, a) => {
    r[a.employer.id] = [...(r[a.employer.id] || []), a];
    return r;
  }, []);

  const t = await employersStore.allEmployers(lastPrimaryKey.value);
  const z = t.map(({ id, name, site_url, alternate_url }) => {
    const _ = [];

    result.forEach((v) => {
      if (v[0].employer.id == id) _.push(v);
    });

    var address = _[0][0].address?.raw ?? "";
    var description = _[0][0].description;
    var hhVacUrls = _[0].map(({ alternate_url }) => alternate_url).join(", ");
    var vacName = _[0].map(({ name }) => name).join(", ");

    return {
      address,
      hhVacUrls,
      vacName,
      description,
      name,
      company_site: site_url,
      hh_page: alternate_url,
    };
  });

  console.log(z);

  const ws = XLSX.utils.json_to_sheet(z);

  /* add to workbook */
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${params.value.area.label}`);

  /* generate an XLSX file */
  XLSX.writeFile(wb, "employers.xlsx");
}
</script>

<template>
  <i-button @click="_export" block outline color="light"
    >Выгрузить работадателей</i-button
  >
  <div class="_margin-top:1 card-wrapper">
    <i-card v-for="employer in employers" :key="employer.id">
      <div class="card-header" style="display: flex">
        <div class="_margin-top:1/2">
          <h4 class="card-title">
            <a target="_blank">{{ employer.name }}</a>
          </h4>
          <p v-if="!!employer.site_url">{{ employer.site_url }}</p>
        </div>
      </div>
      <div
        class="_margin-bottom:2/3"
        style="margin-top: 1.25rem; max-height: 300px"
      >
        <p
          style="
            font-size: 0.975rem;
            line-height: 1.5rem;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 13;
            -webkit-box-orient: vertical;
          "
        >
          {{ description(employer.description) }}
        </p>
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
    margin-top: calc(var(--spacing) * 3 / 4);
  }
}

.card {
  p,
  h4 {
    margin: 0;
  }
}
</style>
