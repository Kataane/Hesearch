import { IndexableType } from "dexie";
import { defineStore, storeToRefs } from "pinia";
import { Area, IFullVacancy } from "~~/@types";
import { getFullVacancy, getVacancies } from "~~/api/vacancies";
import { db } from "~~/db";
import { pause, serial } from "~~/utilities/promise";

const { vacancies } = db;
const PER_PAGE = 5;
const PER_PAGE_HH = 20;

export type status = "Start" | "End";

const { params, lastPrimaryKey, requestIsExpiry } = storeToRefs(
  useRequestStore()
);

const pendingStore = usePendingStore();

export const useVacanciesStore = defineStore("vacanciesStore", () => {
  watch(lastPrimaryKey, async () => await fill(), {
    deep: true,
  });

  const state = reactive({
    vacancies: [] as IFullVacancy[],
    count: 0,
    status: "Start" as status,
  });

  const readonlyState = readonly({ PER_PAGE });

  async function fill() {
    pendingStore.addPending("vacancies");
    state.status = "Start";

    const vacancyId = await vacancybyRequest(lastPrimaryKey.value);
    const index = await _put(vacancyId);
    await setCount(vacancyId);

    const pages = await getPages(vacancyId);

    try {
      if (index) {
        await _fill(params.value, index, pages);
      }
      await paginate(0);
    } catch (error) {
      console.log(error);
    } finally {
      state.status = "End";
      pendingStore.deletePending("vacancies");
    }
  }

  async function paginate(page: number) {
    const { vacancies: _vacancies } = await vacancies
      .where({
        requestId: lastPrimaryKey.value,
      })
      .first();

    state.vacancies =
      _vacancies.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE) ?? [];
  }

  async function _put(vacancyId: IndexableType) {
    if (vacancyId === undefined || requestIsExpiry.value)
      return put(lastPrimaryKey.value, vacancyId);
    return undefined;
  }

  async function getPages(vacancyId: IndexableType) {
    const pages =
      vacancyId === undefined
        ? async () => {
            const { pages } = await _pages(params.value);
            return pages;
          }
        : () => Math.ceil(state.count / PER_PAGE_HH);

    return pages();
  }

  async function setCount(vacancyId: IndexableType) {
    const count = await _count(vacancyId);
    count === undefined || count == 0
      ? ({ found: state.count } = await _pages(params.value))
      : (state.count = count);
  }

  async function vacancybyRequest(requestId: IndexableType) {
    const keys = await vacancies
      .where({
        requestId: requestId,
      })
      .primaryKeys();

    return keys.length > 0 ? keys[0] : undefined;
  }

  async function allVac(requestId: IndexableType) {
    const { vacancies: _vacancies } = await vacancies
      .where({
        requestId: requestId,
      })
      .first();

    return _vacancies;
  }

  return {
    fill,
    paginate,
    allVac,
    ...toRefs(readonlyState),
    ...toRefs(state),
  };
});

async function _count(vacancyId: IndexableType) {
  if (vacancyId === undefined) return undefined;

  return vacancies
    .where({
      id: vacancyId,
    })
    .first()
    .then((v) => v.vacancies.length);
}

async function put(requestId: IndexableType, vacancyId?: IndexableType) {
  return vacancies.put({
    id: vacancyId,
    requestId: requestId,
    vacancies: [],
  });
}

async function _pages({ area, text }: { area: Area; text: string }) {
  return getVacancies({
    area: area.id,
    text: text,
  });
}

async function _fill(
  { area, text }: { area: Area; text: string },
  vacancyId: IndexableType,
  pages: number
) {
  const _vacancies = await serial(
    [...Array(pages + 1).keys()].map((page) => async () => {
      await pause(10, 30);
      return getVacancies({
        page,
        area: area.id,
        text,
      }).then(({ items }) =>
        items.map(async ({ id, snippet }) => {
          const fv = await getFullVacancy(id);
          fv.snippet = snippet;
          return fv;
        })
      );
    })
  );

  const h = await Promise.all(_vacancies);

  return vacancies.update(vacancyId, {
    vacancies: h,
  });
}
