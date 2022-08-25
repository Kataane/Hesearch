<script setup lang="ts">
import { storeToRefs } from "pinia";

const { pending } = storeToRefs(usePendingStore());

const active = ref("Vacancies");

function select(tab: string) {
  active.value = tab;
}
</script>

<template>
  <i-layout>
    <i-layout-content>
      <i-container>
        <i-row>
          <i-column xs="6" offset="3">
            <div class="_margin-top:2">
              <SearchForm />
              <div style="margin-top: 1.25rem">
                <i-tabs v-model="active" @update:modelValue="select" stretch>
                  <template #header>
                    <i-tab-title for="Vacancies"> Вакансии </i-tab-title>
                    <i-tab-title for="Employers"> Работодатели </i-tab-title>
                    <i-tab-title for="Skills"> Навыки </i-tab-title>
                  </template>
                </i-tabs>
              </div>
              <div class="_margin-top:1">
                <i-loader v-if="pending">Поиск вакансий</i-loader>
                <component v-else :is="active" />
              </div>
            </div>
          </i-column>
        </i-row>
      </i-container>
    </i-layout-content>
  </i-layout>
</template>

<style lang="scss">
@import "@inkline/inkline/css/variables";
@import "@inkline/inkline/css/mixins";

:root {
  @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@200;300;400;500;600;700;800;900&display=swap");
  --color--primary--h: 195deg;
  --color--primary--s: 77%;
  --color--primary--l: 11%;

  --border-top-left-radius: 0.1rem;
  --border-top-right-radius: 0.1rem;
  --border-bottom-right-radius: 0.1rem;
  --border-bottom-left-radius: 0.1rem;

  --box-shadow-blur-radius: 0;

  --font-family-primary--base: "IBM Plex Sans", sans-serif;
}

@include i-button() {
  @include variant("disabled") {
    cursor: not-allowed;
    background: #c6c6c6;
    border-color: #c6c6c6;
    color: #8d8d8d;
  }

  @include variant("light") {
    color: var(--contrast-color-for-light-background);
    border-width: var(--border-width);
    border-style: var(--border-style);
    border-color: var(--color--light);

    &:hover,
    &:focus {
      cursor: pointer;
      outline: none;
      background-color: var(--color--gray-05) !important;
    }
  }
}

@include i-pagination() {
  @include variant("center") {
    .pagination-items {
      flex-grow: 1;
      justify-content: center;
    }
  }

  .pagination-item {
    background-color: transparent;
    border-width: var(--border-width);
    border-style: var(--border-style);
    border-color: var(--color--light);

    &:hover {
      background-color: #178bb22b;
    }
  }

  .pagination-item.-active {
    background: var(----background--active);
  }
}

.form-group-wrapper {
  display: flex;

  .form-group {
    margin-top: 0;
    width: 100%;
  }

  .form-group + .form-group {
    margin-left: var(--margin-left);
  }
}
</style>
