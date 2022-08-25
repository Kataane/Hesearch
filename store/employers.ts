import { IndexableType } from "dexie";
import { defineStore, storeToRefs } from "pinia";
import { IEmployer } from "~~/@types";
import { db } from "~~/db";
import { filterByUniqId, sliceArray } from "~~/utilities/array";
import { serial } from "~~/utilities/promise";
import { useVacanciesStore } from "./vacancies";

const PER_PAGE = 5;
const { vacancies, employers } = db;

const { lastPrimaryKey, requestIsExpiry, params } = storeToRefs(
  useRequestStore()
);
const { status } = storeToRefs(useVacanciesStore());

const pendingStore = usePendingStore();

export const useEmployersStore = defineStore("employersStore", () => {
  watch([params, status], async () => {
    if (status.value === "End") await fill();
  });

  const state = reactive({
    employers: [] as IEmployer[],
    count: 0,
  });

  const readonlyState = readonly({ PER_PAGE });

  async function fill() {
    pendingStore.addPending("employers");

    const employerId = await getEmpoloyerId(lastPrimaryKey.value);
    const index = await _put(employerId);

    // TODO: Not load all pages. Load only optimal N pages. If needed more, load other N pages.
    try {
      if (index) await _fill(index, lastPrimaryKey.value);
      await paginate(0);

      state.count = await _count(lastPrimaryKey.value);
    } catch (error) {
      console.log(error);
    } finally {
      pendingStore.deletePending("employers");
    }
  }

  async function paginate(page: number) {
    const { employers: _employers } = await employers
      .where({
        requestId: lastPrimaryKey.value,
      })
      .first();

    state.employers =
      _employers.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE) ?? [];
  }

  async function _put(employerId: IndexableType) {
    if (employerId === undefined || requestIsExpiry.value)
      return put(lastPrimaryKey.value, employerId);
    return undefined;
  }

  async function allEmployers(requestId: IndexableType) {
    const { employers: _employers } = await employers
      .where({
        requestId: requestId,
      })
      .first();

    return _employers;
  }

  return {
    fill,
    paginate,
    allEmployers,
    ...toRefs(readonlyState),
    ...toRefs(state),
  };
});

async function getEmpoloyerId(requestId: IndexableType) {
  const keys = await employers
    .where({
      requestId: requestId,
    })
    .primaryKeys();

  return keys.length > 0 ? keys[0] : undefined;
}

async function _count(requestId: IndexableType) {
  const employerId = await getEmpoloyerId(requestId);

  const { employers: _employers } = await employers
    .where({
      id: employerId,
    })
    .first();

  return _employers.length;
}

async function put(requestId: IndexableType, employerId?: IndexableType) {
  return employers.put({
    id: employerId,
    requestId: requestId,
    employers: [],
  });
}

async function employersUrls(requestId: IndexableType) {
  return vacancies
    .where({
      requestId: requestId,
    })
    .first()
    .then((v) =>
      v.vacancies
        .map(({ employer }) => employer)
        .filter(filterByUniqId)
        .map(({ url }) => url)
    );
}

async function _fill(employerId: IndexableType, requestId: IndexableType) {
  const urls = await employersUrls(requestId);

  console.log(urls);

  const chunks = sliceArray(urls, 10);

  const promises = await serial(
    chunks.map((urls) => async () => {
      return urls.map((url) => $fetch<IEmployer>(url));
    })
  );

  const _employers = await Promise.all(promises);

  return employers.update(employerId, {
    employers: _employers,
  });
}
