<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useSkillsStore } from "~~/store/skills";

const page = ref(1);

const skillsStore = useSkillsStore();
const { count, skills, PER_PAGE } = storeToRefs(skillsStore);

async function select(page: number) {
  await skillsStore.paginate(page - 1);
}
</script>

<template>
  <i-table border hover>
    <thead>
      <tr>
        <th>Навык</th>
        <th>Количество</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="skill in skills" :key="skill.name">
        <td>{{ skill.name }}</td>
        <td>{{ skill.count }}</td>
      </tr>
    </tbody>
  </i-table>
  <i-pagination
    class="_display:flex _justify-content:center _margin-y:1"
    v-model="page"
    @update:modelValue="select"
    quick-link
    :items-total="count"
    :items-per-page="PER_PAGE"
  />
</template>
